"use client";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, X } from "lucide-react";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=400&fit=crop",
];

function imageForId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h += id.charCodeAt(i);
  return PLACEHOLDER_IMAGES[h % PLACEHOLDER_IMAGES.length];
}

export interface EventRow {
  id: string;
  title_mr: string;
  title_en: string | null;
  event_date: string | null;
  description_mr: string | null;
  description_en: string | null;
  location: string | null;
}

export default function EventsCarousel({ language }: { language: "mr" | "en" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<EventRow | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: EventRow[]) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir: "left" | "right") => ref.current?.scrollBy({ left: dir === "left" ? -350 : 350, behavior: "smooth" });

  const title = (e: EventRow) => (language === "mr" ? (e.title_mr || e.title_en || "") : (e.title_en || e.title_mr || ""));
  const desc = (e: EventRow) =>
    language === "mr" ? (e.description_mr || e.description_en || "") : (e.description_en || e.description_mr || "");
  const heading = language === "mr" ? "कार्यक्रम" : "Events";
  const dateLabel = language === "mr" ? "दिनांक" : "Date";
  const locLabel = language === "mr" ? "ठिकाण" : "Location";
  const emptyMsg = language === "mr" ? "सध्या कोणतेही कार्यक्रम नाहीत." : "No events scheduled yet.";

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString(language === "mr" ? "mr-IN" : "en-IN", { dateStyle: "medium" });
    } catch {
      return d;
    }
  };

  return (
    <motion.section id="events" className="py-14 px-6 bg-[#fff7ed] relative" {...anim}>
      <h3 className="text-2xl font-semibold text-center mb-6 text-[#1f6f43] flex items-center justify-center gap-2">
        <CalendarDays size={20} /> {heading}
      </h3>
      {loading ? (
        <p className="text-center text-gray-500 text-sm py-8">{language === "mr" ? "लोड होत आहे…" : "Loading…"}</p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-8">{emptyMsg}</p>
      ) : (
        <div className="relative">
          <button type="button" onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10 cursor-pointer">‹</button>
          <div ref={ref} className="flex gap-6 overflow-x-auto scroll-smooth px-10" style={{ scrollbarWidth: "none" }}>
            {items.map((e) => (
              <div
                key={e.id}
                onClick={() => setActive(e)}
                className="min-w-[300px] md:min-w-[350px] h-56 rounded-xl overflow-hidden relative shadow-md cursor-pointer hover:scale-[1.02] transition"
              >
                <img src={imageForId(e.id)} className="w-full h-full object-cover" alt={title(e)} />
                <div className="absolute inset-0 bg-black/40 flex items-end">
                  <h4 className="text-white font-semibold p-4 line-clamp-2">{title(e)}</h4>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10 cursor-pointer">›</button>
        </div>
      )}

      <AnimatePresence>
        {active && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setActive(null)}>
            <motion.div
              className="bg-white p-6 rounded-xl w-[90%] max-w-lg relative max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(ev) => ev.stopPropagation()}
            >
              <button type="button" className="absolute top-3 right-3 cursor-pointer" onClick={() => setActive(null)}><X size={18} /></button>
              <h3 className="text-lg font-semibold mb-2 text-[#1f6f43]">{title(active)}</h3>
              <p className="text-xs text-gray-500 mb-3">{dateLabel}: {formatDate(active.event_date)}</p>
              {active.location ? (
                <p className="text-sm mb-2"><strong>{locLabel}:</strong> {active.location}</p>
              ) : null}
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{desc(active) || "—"}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
