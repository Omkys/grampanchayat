import { createClient } from "@supabase/supabase-js";

/** Verify Bearer JWT belongs to admin/official (for dashboard API writes). */
export async function verifyStaffFromRequest(authHeader: string | null): Promise<boolean> {
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return false;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" || profile?.role === "official";
}
