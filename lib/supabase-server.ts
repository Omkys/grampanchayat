import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _adminClient: SupabaseClient | null = null;
let _serverClient: SupabaseClient | null = null;

function requireUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in .env");
  }
  return url;
}

/**
 * Server client for API routes. Prefers the service-role key; falls back to the anon key
 * so public GET routes work in local dev when SUPABASE_SERVICE_ROLE_KEY is not set yet.
 * Ensure RLS allows anon SELECT on tables used by public reads, or add the service role key.
 */
export function getSupabaseServer(): SupabaseClient {
  if (_serverClient) return _serverClient;

  const url = requireUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (serviceKey) {
    _serverClient = createClient(url, serviceKey);
    return _serverClient;
  }

  if (anonKey) {
    _serverClient = createClient(url, anonKey);
    return _serverClient;
  }

  throw new Error(
    "Missing Supabase keys. Set SUPABASE_SERVICE_ROLE_KEY (recommended) or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env"
  );
}

/** Service-role only — required for privileged writes that bypass RLS. */
export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;

  const url = requireUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it in .env (Supabase → Settings → API → service_role) for admin/write API routes."
    );
  }
  _adminClient = createClient(url, key);
  return _adminClient;
}
