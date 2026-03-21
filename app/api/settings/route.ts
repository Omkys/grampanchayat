import { getSupabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("settings").select("*");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const settings: Record<string, string> = {};
    data?.forEach((row) => { settings[row.key] = row.value; });
    return NextResponse.json(settings);
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
