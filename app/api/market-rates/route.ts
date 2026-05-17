import { getSupabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const search = req.nextUrl.searchParams.get("search")?.trim() || "";
    let query = supabase.from("market_rates").select("*");
    if (search) {
      const term = search.replace(/[%_]/g, "");
      if (term) query = query.or(`crop_mr.ilike.%${term}%,crop_en.ilike.%${term}%`);
    }
    const { data, error } = await query.order("crop_en", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
