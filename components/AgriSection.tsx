"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { CloudSun, Landmark } from "lucide-react";
import { formatInr } from "@/lib/site-settings";
import { useLivePoll } from "@/lib/use-live-poll";
import { sectionAnim } from "@/lib/section-anim";

const forecast = [
  { day: "Mon", icon: "☀️", temp: "33°C" }, { day: "Tue", icon: "⛅", temp: "31°C" },
  { day: "Wed", icon: "🌧️", temp: "29°C" }, { day: "Thu", icon: "☀️", temp: "34°C" },
  { day: "Fri", icon: "🌤️", temp: "32°C" }, { day: "Sat", icon: "🌧️", temp: "28°C" },
  { day: "Sun", icon: "☀️", temp: "35°C" },
];

interface RateRow {
  id: string;
  crop_mr: string | null;
  crop_en: string | null;
  price_inr: number | string | null;
  unit: string | null;
}

async function fetchMarketRates(search: string): Promise<{ rates: RateRow[]; error: string | null }> {
  const qs = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  const res = await fetch(`/api/market-rates${qs}`, { cache: "no-store" });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = body && typeof body === "object" && "error" in body && typeof body.error === "string" ? body.error : "Failed to load market rates";
    return { rates: [], error: msg };
  }
  if (!Array.isArray(body)) {
    return { rates: [], error: "Invalid market rates response" };
  }
  return { rates: body as RateRow[], error: null };
}

export default function AgriSection({ language }: { language: "mr" | "en" }) {
  const [search, setSearch] = useState("");
  const [startIdx, setStartIdx] = useState(0);
  const [rates, setRates] = useState<RateRow[]>([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState<string | null>(null);

  const searchRef = useRef(search);
  searchRef.current = search;

  const loadRates = useCallback(async (term: string, silent = false) => {
    if (!silent) {
      setRatesLoading(true);
      setRatesError(null);
    }
    const { rates: data, error } = await fetchMarketRates(term);
    setRates(data);
    setRatesError(error);
    if (!silent) {
      setRatesLoading(false);
      setStartIdx(0);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadRates(search, false);
    }, 300);
    return () => clearTimeout(t);
  }, [search, loadRates]);

  useLivePoll(() => loadRates(searchRef.current, true), { runOnMount: false });

  const rowLabel = (r: RateRow) => {
    const mr = r.crop_mr?.trim();
    const en = r.crop_en?.trim();
    if (language === "mr") {
      if (mr && en) return `${mr} / ${en}`;
      return mr || en || "—";
    }
    if (en && mr) return `${en} / ${mr}`;
    return en || mr || "—";
  };

  const rowPrice = (r: RateRow) => {
    const p = Number(r.price_inr) || 0;
    const u = (r.unit || "quintal").toLowerCase();
    const unitMr = u === "quintal" ? "क्विंटल" : u;
    const unitEn = u;
    return `${formatInr(p)}${language === "mr" ? ` / ${unitMr}` : ` / ${unitEn}`}`;
  };

  const page = rates.slice(startIdx, startIdx + 5);

  return (
    <motion.section id="agri" className="py-24 px-6 bg-[#f8fafc] border-t-4 border-[#1f6f43] shadow-inner" {...sectionAnim}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10">
        <div>
          <h3 className="text-xl font-semibold mb-6 text-[#1f6f43] flex items-center gap-2">
            <CloudSun size={18} /> {language === "mr" ? "थेट हवामान माहिती" : "Live Weather"}
          </h3>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-lg font-semibold mb-2">{language === "mr" ? "तापमान:" : "Temperature:"} 32°C</p>
            <p className="text-sm">{language === "mr" ? "हवामान:" : "Condition:"} Sunny</p>
            <p className="text-sm mt-2">{language === "mr" ? "वाऱ्याचा वेग:" : "Wind Speed:"} 12 km/h</p>
            <p className="text-sm">{language === "mr" ? "आर्द्रता:" : "Humidity:"} 60%</p>
            <p className="text-xs text-gray-500 mt-4">{language === "mr" ? "शेवटचे अद्यतन: आज" : "Last updated: Today"}</p>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mt-6">
            {forecast.map((f, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-3 text-center">
                <p className="text-xs font-medium text-gray-600">{f.day}</p>
                <p className="text-xl my-1">{f.icon}</p>
                <p className="text-xs font-semibold">{f.temp}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-6 text-[#1f6f43] flex items-center gap-2">
            <Landmark size={18} /> {language === "mr" ? "आजचा बाजारभाव" : "Today's Market Rates"}
          </h3>
          <div className="bg-white rounded-xl shadow p-6 relative min-h-[200px]">
            <div className="flex mb-4 gap-2">
              <input
                type="text"
                suppressHydrationWarning
                placeholder={language === "mr" ? "पिक शोधा..." : "Search crop..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 border rounded-md px-3 py-2 text-sm"
              />
              <span className="bg-[#1f6f43] text-white px-3 rounded-md text-sm flex items-center" aria-hidden>
                🔍
              </span>
            </div>

            {ratesError && <p className="text-sm text-red-600 mb-3">{ratesError}</p>}

            {ratesLoading ? (
              <p className="text-sm text-gray-500 py-4">{language === "mr" ? "भाव लोड होत आहेत…" : "Loading rates…"}</p>
            ) : rates.length === 0 && !ratesError ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                {language === "mr"
                  ? "अद्याप बाजारभाव उपलब्ध नाहीत. प्रशासन पटलावरून जोडा."
                  : "No market rates yet. Add them from the admin dashboard."}
              </p>
            ) : (
              <>
                {startIdx > 0 && (
                  <button
                    type="button"
                    onClick={() => setStartIdx((p) => Math.max(p - 1, 0))}
                    className="absolute top-14 left-1/2 -translate-x-1/2 bg-white shadow rounded-full px-3 py-1 text-sm cursor-pointer z-10"
                    aria-label={language === "mr" ? "वर" : "Previous"}
                  >
                    ↑
                  </button>
                )}
                <table className="w-full text-sm">
                  <tbody>
                    {page.map((r) => (
                      <tr key={r.id} className="border-b last:border-none">
                        <td className="py-2 pr-2">{rowLabel(r)}</td>
                        <td className="text-right whitespace-nowrap">{rowPrice(r)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {startIdx + 5 < rates.length && (
                  <button
                    type="button"
                    onClick={() => setStartIdx((p) => Math.min(p + 1, Math.max(0, rates.length - 5)))}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white shadow rounded-full px-3 py-1 text-sm cursor-pointer z-10"
                    aria-label={language === "mr" ? "खाली" : "Next"}
                  >
                    ↓
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
