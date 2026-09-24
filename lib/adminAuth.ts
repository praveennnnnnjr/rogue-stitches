import "server-only";
import { supabaseAdmin } from "./supabaseAdmin";
import { ADMIN_EMAIL } from "./adminEmail";

export function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer (.+)$/);
  return match ? match[1] : null;
}

// Gates every /api/admin/* write: the caller must present a *real* Supabase
// access token (from the logged-in session) whose account email matches
// ADMIN_EMAIL. This replaced an earlier standalone-PIN scheme — now "admin"
// isn't a separate password, it's just "signed in as this one account",
// verified against Supabase itself rather than a locally-signed token.
export async function verifyAdminRequest(req: Request): Promise<boolean> {
  const token = getBearerToken(req);
  if (!token) return false;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user?.email) return false;

  return data.user.email.toLowerCase() === ADMIN_EMAIL;
}
