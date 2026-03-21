import { getSupabaseAdmin } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { complaint_type, subject, description, citizen_id } = body;

    if (!subject?.trim()) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    const complaint_no = `CMP-${new Date().getFullYear()}-${Math.floor(Math.random() * 99999).toString().padStart(5, "0")}`;

    const { data, error } = await supabase.from("complaints").insert({
      complaint_no,
      complaint_type: complaint_type || "other",
      subject,
      description: description || null,
      citizen_id: citizen_id || null,
      status: "pending",
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, complaint_no, data });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("complaints").select("*").order("submitted_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
