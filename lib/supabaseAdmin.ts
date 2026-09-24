import "server-only";
import { createClient } from "@supabase/supabase-js";

// This client uses the SERVICE ROLE key and must never be imported into
// any "use client" component or exposed to the browser. It's only used
// from app/api/admin/* route handlers, each of which checks an admin
// session token before touching the database. See lib/adminAuth.ts.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !serviceRoleKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabaseAdmin] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. " +
      "Admin product uploads and order management will fail until these are configured."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export const PRODUCT_IMAGES_BUCKET = "products";
