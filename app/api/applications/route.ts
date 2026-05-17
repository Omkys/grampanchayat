import { getSupabaseAdmin } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

function generateAppNo() {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `GP-${year}-${seq}`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { name, mobile, details, service_type, citizen_id } = body;

    if (!name?.trim() || !mobile?.trim()) {
      return NextResponse.json({ error: "Name and mobile are required" }, { status: 400 });
    }

    const application_no = generateAppNo();

    const { data, error } = await supabase.from("applications").insert({
      application_no,
      service_type: service_type || "takrar",
      form_data: { name, mobile, details },
      status: "pending",
      ...(citizen_id ? { citizen_id } : {}),
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, application_no, data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
