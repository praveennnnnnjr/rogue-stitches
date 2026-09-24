# ROGUESTITCHES

A complete e-commerce storefront for the ROGUESTITCHES streetwear brand:
dark/gothic UI, product catalog, slide-over cart, checkout with Razorpay,
an admin dashboard for products and orders, and automatic order
notifications. Built with Next.js 14 (App Router), Tailwind CSS, and
Supabase.

## 1. Install

```bash
npm install
```

## 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`.
   This creates the `products` and `orders` tables, locks them down with
   Row Level Security, and creates the public `products` storage bucket.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret —
     it's server-only and bypasses RLS, which is what lets the admin
     dashboard write products and read orders)

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | From Supabase API settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | From Supabase API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | From Supabase API settings — server only |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Yes | The one account that gets admin access — see §7 |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | For real payments | See §5 |
| `SENDGRID_API_KEY` + `SENDGRID_FROM_EMAIL` + `OWNER_EMAIL` | Pick one notify option | See §6 |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` / `TWILIO_TO_NUMBER` | Pick one notify option | See §6 |
| `NOTIFY_WEBHOOK_URL` | Pick one notify option | See §6 |
| `NEXT_PUBLIC_EMAILJS_*` | Pick one notify option | See §6 |

The storefront and admin dashboard both work with **only** the Supabase
variables filled in — orders will save as `pending` and no notification
will fire until you wire up payments/notifications.

## 4. Run it

```bash
npm run dev
```

Storefront: `http://localhost:3000`
Admin: `http://localhost:3000/admin` (log in at `/login` using the
`NEXT_PUBLIC_ADMIN_EMAIL` account — see §7)

## 5. Payments (Razorpay)

1. Create a [Razorpay](https://razorpay.com) account, grab your **Key ID**
   and **Key Secret** from Settings → API Keys (use test-mode keys first).
2. Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
3. That's it — `/api/create-order` creates the Razorpay order server-side,
   the checkout modal opens Razorpay's UPI/card/netbanking widget, and
   `/api/verify-payment` verifies the signature before the order is marked
   `paid`.

Without these two variables set, checkout still works end-to-end: the
order is saved with `payment_status: "pending"` so you can follow up
manually (useful for testing, or a cash-on-delivery-style flow).

## 6. Order notifications (pick at least one)

Every successful checkout calls `/api/notify`, which tries each of these
in order and uses whichever has credentials configured:

- **SendGrid** (email) — set `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`,
  `OWNER_EMAIL`.
- **Twilio** (SMS) — set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
  `TWILIO_FROM_NUMBER`, `TWILIO_TO_NUMBER`.
- **Generic webhook** — set `NOTIFY_WEBHOOK_URL` to a Zapier/Make/Twilio
  Function endpoint; the full order JSON is POSTed to it.

There's also a **client-side EmailJS** path (`NEXT_PUBLIC_EMAILJS_*`) that
fires straight from the browser right after checkout, if you'd rather not
touch the server route at all.

Every notification includes: Order ID, Customer Name, Mobile Number,
Address, Product List, Total Amount, and Payment Status.

## 7. Admin dashboard (email-based, not a PIN)

Customer and admin login share one page: `/login` (email/password via real
**Supabase Auth**, `context/AuthContext.tsx`). Whoever is logged in as
`NEXT_PUBLIC_ADMIN_EMAIL` gets an "Admin Panel" link in the navbar's
account menu and full access at `/admin`; everyone else visiting `/admin`
sees either a login prompt (not signed in) or a plain "Not Authorized"
screen (signed in as a different email) — never the product management UI.

**You need to create that owner account once**, either:
- Click LOGIN → "Create an account" on the site itself, using the exact
  `NEXT_PUBLIC_ADMIN_EMAIL` address, or
- Supabase Dashboard → Authentication → Users → Add user (skip the
  confirmation email hassle this way)

If your Supabase project has "Confirm email" enabled (Authentication →
Providers → Email), a self-service signup can't log in until that link is
clicked — the dashboard route sidesteps that.

Server-side, every `/api/admin/*` request carries the logged-in user's
Supabase access token as a Bearer token. `lib/adminAuth.ts` verifies that
token against Supabase itself (`supabaseAdmin.auth.getUser(token)`) and
checks the resulting email against `ADMIN_EMAIL` — so admin access isn't a
client-side flag anyone could fake, it's tied to an actual authenticated
session. Writes then go through the Supabase **service role** key, same as
before. The `products` and `orders` tables still have no public
write/read-all policies (see `supabase/schema.sql`).

**Going further:** for a multi-admin team, replace the single
`ADMIN_EMAIL` string with a `profiles` table (`user_id`, `role`) and check
`role = 'admin'` there instead — same verified-session pattern, just a
lookup instead of a string compare.

## 8. Project structure

```
app/
  (store)/            storefront pages — share Navbar/Footer/CheckoutModal
    page.tsx            home (hero + full catalog)
    shop/page.tsx        full catalog, filterable by ?category=
    new-arrivals/page.tsx
    cart/page.tsx        dedicated cart page (resolves to /cart)
    wishlist/page.tsx    dedicated wishlist page (resolves to /wishlist)
  product/[slug]/page.tsx  dynamic product detail page (resolves to /product/<slug>)
  login/page.tsx        email/password login + signup (no storefront chrome)
  admin/page.tsx         admin login-gate + dashboard (no storefront chrome)
  api/
    create-order/        Razorpay order creation (server)
    verify-payment/       Razorpay signature verification (server)
    notify/                SendGrid / Twilio / webhook notification (server)
    admin/
      products/              create/update/delete products (service role)
      upload/                 product image upload (service role)
      orders/                  list/update orders (service role)
components/            storefront UI (Navbar, ProductGrid, ProductCard, CheckoutModal, Footer)
components/admin/      admin UI (AdminDashboard, ProductForm, ProductsTable, OrdersTable)
context/               CartContext, WishlistContext, AuthContext (Supabase Auth session + isAdmin)
lib/                   Supabase clients, types, slugify, admin auth verification, notify helper
supabase/schema.sql    tables + RLS policies + storage bucket
```

Note: `(store)` is a route group — the parentheses don't appear in the
URL. `app/(store)/cart/page.tsx` serves `/cart`, not `/store/cart`. It's
organized this way so `/cart` and `/wishlist` share the same navbar and
footer as the rest of the storefront, while `/login` and `/admin`
deliberately don't (a login screen and an owner dashboard don't need
customer nav around them).

## 9. Deploy

Push to GitHub and import into [Vercel](https://vercel.com) (or any
Next.js host). Add all the same environment variables from `.env.local`
in the host's project settings. Remember to switch Razorpay to live-mode
keys when you're ready to take real payments.
