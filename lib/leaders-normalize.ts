import type { LeaderRow } from "@/lib/leaders";

/** Raw row from Supabase — supports new and legacy column names. */
export type LeaderRowDb = {
  id: string;
  name?: string | null;
  designation?: string | null;
  role_en?: string | null;
  role_mr?: string | null;
  image_url?: string | null;
  display_order?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

/** Map DB row → app shape (legacy: role_en / role_mr). */
export function normalizeLeaderRow(row: LeaderRowDb): LeaderRow {
  return {
    id: row.id,
    name: (row.name || row.role_en || "").trim() || "—",
    designation: (row.designation || row.role_mr || row.role_en || "").trim(),
    image_url: row.image_url ?? null,
    display_order: row.display_order ?? 0,
    is_active: row.is_active !== false,
    created_at: row.created_at ?? undefined,
  };
}

export function leaderPayloadForDb(form: {
  name: string;
  designation: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}) {
  return {
    name: form.name.trim(),
    designation: form.designation.trim(),
    role_en: form.name.trim(),
    role_mr: form.designation.trim(),
    image_url: form.image_url,
    display_order: form.display_order,
    is_active: form.is_active,
  };
}

/** Old tables that only have role_en / role_mr + image_url */
export function leaderLegacyPayloadForDb(form: {
  name: string;
  designation: string;
  image_url: string | null;
}) {
  return {
    role_en: form.name.trim(),
    role_mr: form.designation.trim(),
    image_url: form.image_url,
  };
}

export function isMissingColumnError(message: string, column: string): boolean {
  return message.includes(`'${column}'`) && message.includes("does not exist");
}
