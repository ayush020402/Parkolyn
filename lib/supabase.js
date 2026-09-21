import { createClient } from "@supabase/supabase-js";

let client;

// Lazily constructed server-side singleton. Uses the service-role key, which
// bypasses Row Level Security — so this must only ever be imported from route
// handlers / server code, never from a client component.
export function getSupabase() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Supabase is not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
      );
    }
    client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}
