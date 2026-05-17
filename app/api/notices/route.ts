import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function supabaseForPublicRead(): SupabaseClient {
  try {
    return getSupabaseAdmin();
  } catch {
    return getSupabaseServer();
  }
}

export async function GET() {
  try {
    const supabase = supabaseForPublicRead();
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(20);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const rows = (data ?? []).filter((n) => n.is_active !== false);
    return NextResponse.json(rows);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
