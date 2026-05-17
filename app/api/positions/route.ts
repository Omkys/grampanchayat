import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import {
  LEADER_POSITION_OPTIONS,
  OFFICIAL_CATEGORY_OPTIONS,
  uniqueLeaderOptionsFromDb,
} from "@/lib/position-options";
import { normalizeLeaderRow, type LeaderRowDb } from "@/lib/leaders-normalize";

/**
 * Returns position presets for admin dropdowns plus roles already used on the live site (from DB).
 * The homepage reads leaders/officials from their tables — this API only helps the admin form.
 */
export async function GET() {
  try {
    const supabase = getSupabaseServer();

    const [leadersRes, officialsRes] = await Promise.all([
      supabase.from("leaders").select("*"),
      supabase.from("officials").select("category, designation_en, designation_mr"),
    ]);

    const leaderDesignations =
      (leadersRes.data as LeaderRowDb[] | null)?.map((r) => normalizeLeaderRow(r).designation).filter(Boolean) ??
      [];

    const fromDb = uniqueLeaderOptionsFromDb([...new Set(leaderDesignations)]);

    return NextResponse.json({
      leaders: {
        presets: LEADER_POSITION_OPTIONS,
        fromWebsite: fromDb,
        all: [...LEADER_POSITION_OPTIONS, ...fromDb],
      },
      officials: {
        presets: OFFICIAL_CATEGORY_OPTIONS,
      },
      errors: {
        leaders: leadersRes.error?.message ?? null,
        officials: officialsRes.error?.message ?? null,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
