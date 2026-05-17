import { getSupabaseAdmin } from "@/lib/supabase-server";
import { normalizeMobile, validateEventRegistration } from "@/lib/validate-event";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_id, full_name, mobile, email, profile_id } = body as {
      event_id?: string;
      full_name?: string;
      mobile?: string;
      email?: string;
      profile_id?: string | null;
    };

    if (!event_id) {
      return NextResponse.json({ error: "Event id is required." }, { status: 400 });
    }

    const validationError = validateEventRegistration({
      full_name: full_name || "",
      mobile: mobile || "",
      email: email || "",
    });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, is_active, registration_open")
      .eq("id", event_id)
      .maybeSingle();

    if (eventError) return NextResponse.json({ error: eventError.message }, { status: 500 });
    if (!event || event.is_active === false) {
      return NextResponse.json({ error: "This event is not available for registration." }, { status: 404 });
    }
    if (event.registration_open === false) {
      return NextResponse.json({ error: "Registration is closed for this event." }, { status: 400 });
    }

    const normalizedMobile = normalizeMobile(mobile!);

    const { data, error } = await supabase
      .from("event_registrations")
      .insert({
        event_id,
        full_name: full_name!.trim(),
        mobile: normalizedMobile,
        email: email?.trim() || null,
        profile_id: profile_id || null,
      })
      .select("id, registered_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This mobile number is already registered for this event." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, registration: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json(
        { error: "Server configuration error. Add SUPABASE_SERVICE_ROLE_KEY in .env." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
