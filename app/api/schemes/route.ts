import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase-server";
import { verifyStaffFromRequest } from "@/lib/verify-staff-request";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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
      .from("schemes")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const rows = (data ?? []).filter((s) => s.is_active !== false);
    return NextResponse.json(rows);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Staff create/update when dashboard client hits RLS. */
export async function POST(req: NextRequest) {
  try {
    const isStaff = await verifyStaffFromRequest(req.headers.get("authorization"));
    if (!isStaff) {
      return NextResponse.json({ error: "Unauthorized. Admin or official login required." }, { status: 401 });
    }

    const body = await req.json();
    const { action, id, payload } = body as {
      action?: "insert" | "update";
      id?: string;
      payload?: Record<string, unknown>;
    };

    if (!payload || (action === "update" && !id)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (action === "update" && id) {
      const { data, error } = await supabase.from("schemes").update(payload).eq("id", id).select("id").maybeSingle();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, id: data?.id ?? id });
    }

    const { data, error } = await supabase.from("schemes").insert(payload).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, id: data.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
