import { getSupabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from("settings").select("*");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const settings: Record<string, string> = {};
    data?.forEach((row) => { settings[row.key] = row.value; });
    return NextResponse.json(settings);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
