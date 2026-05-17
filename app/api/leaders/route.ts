import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { normalizeLeaderRow, type LeaderRowDb } from "@/lib/leaders-normalize";

/** Public read: active leaders for the home page leadership strip. */
export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const { data, error, count } = await supabase.from("leaders").select("*", { count: "exact" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data as LeaderRowDb[] | null) ?? [];
    const leaders = rows
      .map(normalizeLeaderRow)
      .filter((r) => r.is_active !== false)
      .sort((a, b) => a.display_order - b.display_order);

    if (leaders.length === 0 && (count ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            "Leaders exist in the database but are hidden (is_active = false). Edit them in admin and enable Active on homepage.",
        },
        { status: 200 }
      );
    }

    if (leaders.length === 0 && (count ?? 0) === 0) {
      const hint = !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
        ? " No rows in leaders table. Save from admin after upload; add SUPABASE_SERVICE_ROLE_KEY or run supabase/leaders-public-read-fix.sql."
        : " No rows in leaders table — image in Storage alone is not enough; save the leader form in admin.";
      return NextResponse.json({ error: `No leaders found.${hint}` }, { status: 200 });
    }

    return NextResponse.json(leaders);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
