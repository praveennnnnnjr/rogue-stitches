-- ROGUESTITCHES — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor (or `supabase db push` if
-- you're using the CLI with this file as a migration).

-- ============================================================
-- 1. PRODUCTS
-- ============================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  price numeric(10, 2) not null,
  image_url text,
  category text not null
    check (category in ('shirts', 't-shirts', 'hoodies', 'bottoms')),
  sizes text[] not null default '{}',
  stock integer not null default 0,
  in_stock boolean not null default true,
  is_new boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- If you ran an earlier version of this schema (free-text category,
-- no slug), this brings an existing table up to date without losing data.
-- Run these one at a time if any step errors on existing rows that don't
-- yet satisfy the new constraints (e.g. backfill slugs before adding the
-- unique constraint).
alter table public.products add column if not exists slug text;
update public.products set slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'))
  where slug is null;
alter table public.products alter column slug set not null;
create unique index if not exists products_slug_key on public.products (slug);

alter table public.products
  add column if not exists category text not null default 'shirts';
alter table public.products drop constraint if exists products_category_check;
alter table public.products
  add constraint products_category_check
  check (category in ('shirts', 't-shirts', 'hoodies', 'bottoms'));
alter table public.products
  add column if not exists stock integer not null default 0;

create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_category_idx on public.products (category);

-- Anyone (including the anon key used by the storefront) can READ products.
create policy "Public can read products"
  on public.products for select
  using (true);

-- No insert/update/delete policy is created for the anon/authenticated
-- roles on purpose: all writes go through /api/admin/* routes using the
-- SERVICE ROLE key, which bypasses RLS entirely. Admin access is gated by
-- a verified Supabase Auth session matching ADMIN_EMAIL (lib/adminAuth.ts),
-- not by RLS.


-- ============================================================
-- 2. ORDERS
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  mobile_number text not null,
  address text not null,
  pincode text not null,
  items jsonb not null,
  total_amount numeric(10, 2) not null,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed')),
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Customers (anon key, from checkout) can only INSERT their own order —
-- they can never read back the full orders table, which contains other
-- customers' names/addresses/phone numbers.
create policy "Anyone can place an order"
  on public.orders for insert
  with check (true);

-- No select/update policy for anon/authenticated: order management
-- (listing orders, changing payment_status) goes through /api/admin/orders
-- using the SERVICE ROLE key.


-- ============================================================
-- 3. STORAGE — product images bucket
-- ============================================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Public read so product images render on the storefront.
create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'products');

-- No insert/update/delete policy for anon/authenticated on this bucket:
-- uploads go through /api/admin/upload using the SERVICE ROLE key.
