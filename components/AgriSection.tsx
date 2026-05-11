"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CloudSun, Landmark } from "lucide-react";
import { formatInr } from "@/lib/site-settings";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

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

const FALLBACK_RATES: RateRow[] = [
  { id: "f1", crop_mr: "गहू", crop_en: "Wheat", price_inr: 2250, unit: "quintal" },
  { id: "f2", crop_mr: "ज्वारी", crop_en: "Jowar", price_inr: 2800, unit: "quintal" },
  { id: "f3", crop_mr: "बाजरी", crop_en: "Bajra", price_inr: 2400, unit: "quintal" },
];

export default function AgriSection({ language }: { language: "mr" | "en" }) {
  const [search, setSearch] = useState("");
  const [startIdx, setStartIdx] = useState(0);
  const [rates, setRates] = useState<RateRow[]>([]);
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    fetch("/api/market-rates")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: RateRow[]) => {
        if (Array.isArray(data) && data.length > 0) setRates(data);
        else setRates(FALLBACK_RATES);
      })
      .catch(() => setRates(FALLBACK_RATES))
      .finally(() => setRatesLoading(false));
  }, []);

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

  const filtered = rates.filter((r) => rowLabel(r).toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.section id="agri" className="py-24 px-6 bg-[#f8fafc] border-t-4 border-[#1f6f43] shadow-inner" {...anim}>
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
          <div className="bg-white rounded-xl shadow p-6 relative">
            {ratesLoading ? (
              <p className="text-sm text-gray-500 py-4">{language === "mr" ? "भाव लोड होत आहेत…" : "Loading rates…"}</p>
            ) : (
              <>
            <div className="flex mb-4 gap-2">
              <input type="text" placeholder={language === "mr" ? "पिक शोधा..." : "Search crop..."} value={search} onChange={(e) => { setSearch(e.target.value); setStartIdx(0); }} className="flex-1 border rounded-md px-3 py-2 text-sm" />
              <span className="bg-[#1f6f43] text-white px-3 rounded-md text-sm flex items-center" aria-hidden>🔍</span>
            </div>
            {startIdx > 0 && <button type="button" onClick={() => setStartIdx((p) => Math.max(p - 1, 0))} className="absolute top-2 left-1/2 -translate-x-1/2 bg-white shadow rounded-full px-3 py-1 text-sm cursor-pointer">↑</button>}
            <table className="w-full text-sm">
              <tbody>
                {filtered.slice(startIdx, startIdx + 5).map((r) => (
                  <tr key={r.id} className="border-b last:border-none">
                    <td className="py-2">{rowLabel(r)}</td>
                    <td className="text-right">{rowPrice(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {startIdx + 5 < filtered.length && (
              <button type="button" onClick={() => setStartIdx((p) => Math.min(p + 1, Math.max(0, filtered.length - 5)))} className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white shadow rounded-full px-3 py-1 text-sm cursor-pointer">↓</button>
            )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
