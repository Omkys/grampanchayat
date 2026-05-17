/**
 * Browser Supabase client for the Next.js App Router.
 *
 * Required environment variables (set in `.env`, never commit secrets):
 * - `NEXT_PUBLIC_SUPABASE_URL` — project URL from Supabase → Settings → API
 * - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon (public) key; safe to expose to the client
 *
 * Used for: auth, dashboard CRUD, and Storage uploads where RLS allows the signed-in user.
 * Server-only privileged access uses `getSupabaseAdmin()` in `lib/supabase-server.ts` instead.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env");
    }
    _client = createClient(url, key);
  }
  return _client;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string) {
    const client = getClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (client as any)[prop];
    return typeof val === "function" ? val.bind(client) : val;
  },
});
