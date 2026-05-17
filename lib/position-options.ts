/**
 * Preset positions for the leadership strip and officials section.
 * The public homepage does NOT hardcode these — it renders `designation` from Supabase.
 * This file is the single source of truth for admin dropdown labels (same roles as typical GP sites).
 */

export type PositionOption = {
  id: string;
  labelEn: string;
  labelMr: string;
  /** Suggested homepage sort order when this role is picked */
  displayOrder: number;
  group: "village" | "state" | "staff";
};

/** Leadership strip roles (village + state) */
export const LEADER_POSITION_OPTIONS: PositionOption[] = [
  { id: "sarpanch", labelEn: "Sarpanch", labelMr: "सरपंच", displayOrder: 1, group: "village" },
  { id: "dy_sarpanch", labelEn: "Deputy Sarpanch", labelMr: "उपसरपंच", displayOrder: 2, group: "village" },
  { id: "member", labelEn: "Member", labelMr: "सदस्य", displayOrder: 3, group: "village" },
  { id: "cm", labelEn: "Chief Minister", labelMr: "मुख्यमंत्री", displayOrder: 10, group: "state" },
  { id: "dy_cm", labelEn: "Deputy Chief Minister", labelMr: "उपमुख्यमंत्री", displayOrder: 11, group: "state" },
];

/** Officials: category + default bilingual designation */
export type OfficialCategoryOption = PositionOption & {
  designationEn: string;
  designationMr: string;
};

export const OFFICIAL_CATEGORY_OPTIONS: OfficialCategoryOption[] = [
  {
    id: "sarpanch",
    labelEn: "Sarpanch",
    labelMr: "सरपंच",
    designationEn: "Sarpanch",
    designationMr: "सरपंच",
    displayOrder: 1,
    group: "village",
  },
  {
    id: "d_sarpanch",
    labelEn: "Deputy Sarpanch",
    labelMr: "उपसरपंच",
    designationEn: "Deputy Sarpanch",
    designationMr: "उपसरपंच",
    displayOrder: 2,
    group: "village",
  },
  {
    id: "sadasya",
    labelEn: "Gram Panchayat Member",
    labelMr: "ग्रामपंचायत सदस्य",
    designationEn: "Member",
    designationMr: "सदस्य",
    displayOrder: 3,
    group: "village",
  },
  {
    id: "gram_sevak",
    labelEn: "Gram Sevak",
    labelMr: "ग्रामसेवक",
    designationEn: "Gram Sevak",
    designationMr: "ग्रामसेवक",
    displayOrder: 4,
    group: "staff",
  },
  {
    id: "clerk",
    labelEn: "Clerk",
    labelMr: "लिपिक",
    designationEn: "Clerk",
    designationMr: "लिपिक",
    displayOrder: 5,
    group: "staff",
  },
  {
    id: "staff",
    labelEn: "Staff",
    labelMr: "कर्मचारी",
    designationEn: "Staff",
    designationMr: "कर्मचारी",
    displayOrder: 6,
    group: "staff",
  },
];

export const CUSTOM_POSITION_VALUE = "__custom__";

/** Match a stored DB designation string back to a preset (if possible). */
export function matchLeaderPreset(designation: string, extras: PositionOption[] = []): PositionOption | null {
  const all = [...LEADER_POSITION_OPTIONS, ...extras];
  const norm = designation.trim().toLowerCase();
  return (
    all.find(
      (o) =>
        o.labelEn.toLowerCase() === norm ||
        o.labelMr === designation.trim() ||
        o.id === norm
    ) ?? null
  );
}

export function matchOfficialCategory(
  category: string,
  designationEn: string,
  designationMr: string
): string {
  const byCat = OFFICIAL_CATEGORY_OPTIONS.find((o) => o.id === category);
  if (byCat) return byCat.id;
  const normEn = designationEn.trim().toLowerCase();
  const found = OFFICIAL_CATEGORY_OPTIONS.find((o) => o.designationEn.toLowerCase() === normEn);
  if (found) return found.id;
  if (designationMr.trim()) {
    const byMr = OFFICIAL_CATEGORY_OPTIONS.find((o) => o.designationMr === designationMr.trim());
    if (byMr) return byMr.id;
  }
  return CUSTOM_POSITION_VALUE;
}

/** Build extra dropdown entries from values already on the live site (database). */
export function uniqueLeaderOptionsFromDb(designations: string[]): PositionOption[] {
  const known = new Set(LEADER_POSITION_OPTIONS.flatMap((o) => [o.labelEn.toLowerCase(), o.labelMr]));
  return designations
    .map((d) => d.trim())
    .filter(Boolean)
    .filter((d) => !known.has(d.toLowerCase()) && !known.has(d))
    .map((d, i) => ({
      id: `db_${i}_${d.slice(0, 20)}`,
      labelEn: d,
      labelMr: d,
      displayOrder: 50 + i,
      group: "village" as const,
    }));
}
