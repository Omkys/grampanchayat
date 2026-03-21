import { getSupabaseAdmin } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const search = req.nextUrl.searchParams.get("search") || "";
    let query = supabase.from("market_rates").select("*");
    if (search) query = query.or(`crop_mr.ilike.%${search}%,crop_en.ilike.%${search}%`);
    const { data, error } = await query.order("updated_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
