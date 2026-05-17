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

async function fetchActiveEvents(supabase: SupabaseClient) {
  let { data, error } = await supabase
    .from("events")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("event_date", { ascending: false });

  if (error?.message?.includes("sort_order") && error.message.includes("does not exist")) {
    ({ data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false }));
  }

  if (error) return { error: error.message, rows: null as null };
  const rows = (data ?? []).filter((e) => e.is_active !== false);
  return { error: null, rows };
}

export async function GET() {
  try {
    const { error, rows } = await fetchActiveEvents(supabaseForPublicRead());
    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json(rows);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Staff create/update (service role) when dashboard client insert hits RLS or schema issues. */
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
      const { data, error } = await supabase.from("events").update(payload).eq("id", id).select("id").maybeSingle();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, id: data?.id ?? id });
    }

    const { data, error } = await supabase.from("events").insert(payload).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, id: data.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
