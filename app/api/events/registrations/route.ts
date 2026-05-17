import { getSupabaseAdmin } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Staff-only: list registrations for an event (service role). Dashboard also uses direct Supabase with RLS. */
export async function GET(req: NextRequest) {
  try {
    const eventId = req.nextUrl.searchParams.get("event_id");
    if (!eventId) {
      return NextResponse.json({ error: "event_id query parameter is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("event_registrations")
      .select("id, event_id, full_name, mobile, email, registered_at, profile_id")
      .eq("event_id", eventId)
      .order("registered_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
