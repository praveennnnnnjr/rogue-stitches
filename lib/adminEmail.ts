// The one account that gets admin access. Not a secret — knowing this email
// doesn't grant access, only a valid Supabase session that's logged in AS
// this address does (verified server-side in lib/adminAuth.ts). Change it
// via NEXT_PUBLIC_ADMIN_EMAIL in .env.local, then create a real Supabase
// Auth user with that exact email (Supabase Dashboard → Authentication →
// Users → Add user, or sign up through the site's login modal).
export const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@roguestitches.com"
).toLowerCase();
