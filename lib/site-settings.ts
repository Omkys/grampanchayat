/** Key-value site copy from public.settings (via /api/settings). */

export const DEFAULT_SITE_SETTINGS: Record<string, string> = {
  gp_name_mr: "ग्रामपंचायत बावी",
  gp_name_en: "Grampanchayat Bavi",
  gp_mobile: "",
  gp_email: "",
  population: "1082",
  total_works: "120",
  total_schemes: "45",
  total_facilities: "18",
  about_mr:
    "ग्रामपंचायत ही स्थानिक स्वराज्य संस्थेचा पाया आहे. ग्रामपंचायत गावाच्या सर्वांगीण विकासासाठी कार्यरत आहे. पाणीपुरवठा, रस्ते, स्वच्छता, शिक्षण व सामाजिक योजना राबविणे हे आमचे प्रमुख उद्दिष्ट आहे.",
  about_en:
    "Gram Panchayat ensures rural development. The Gram Panchayat works for the holistic development of the village. Key focus areas include water supply, roads, sanitation, education, and implementation of welfare schemes.",
  gp_officer_mr: "श्री. रफिक दस्तागिर तांबोळी",
  gp_officer_en: "Mr. Rafik Dastagir Tamboli",
  gp_admin_mr: "श्री महादेव पोपट कारंडे",
  gp_admin_en: "Mr. Mahadev Popat Karande",
};

export function mergeSiteSettings(fetched: Record<string, string> | null | undefined): Record<string, string> {
  return { ...DEFAULT_SITE_SETTINGS, ...fetched };
}

export function parseStat(raw: string | undefined, fallback: number): number {
  if (raw == null || raw.trim() === "") return fallback;
  const n = parseInt(String(raw).replace(/,/g, "").trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
