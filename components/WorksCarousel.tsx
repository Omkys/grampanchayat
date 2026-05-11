"use client";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, X } from "lucide-react";
import { formatInr } from "@/lib/site-settings";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1590644368357-23a4cffd0340?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop",
];

function imageForId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h += id.charCodeAt(i);
  return PLACEHOLDER_IMAGES[h % PLACEHOLDER_IMAGES.length];
}

export interface WorkRow {
  id: string;
  title_mr: string;
  title_en: string | null;
  status: string;
  budget_inr: number | string | null;
  contractor: string | null;
  start_date: string | null;
  end_date: string | null;
  progress: number | null;
}

export default function WorksCarousel({ language }: { language: "mr" | "en" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<WorkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<WorkRow | null>(null);

  useEffect(() => {
    fetch("/api/works")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: WorkRow[]) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir: "left" | "right") => ref.current?.scrollBy({ left: dir === "left" ? -350 : 350, behavior: "smooth" });

  const title = (w: WorkRow) => (language === "mr" ? (w.title_mr || w.title_en || "") : (w.title_en || w.title_mr || ""));
  const budgetLabel = language === "mr" ? "अंदाजे खर्च" : "Estimated budget";
  const contractorLabel = language === "mr" ? "कंत्राटदार" : "Contractor";
  const startLabel = language === "mr" ? "सुरुवात" : "Start";
  const endLabel = language === "mr" ? "शेवट" : "End";
  const progressLabel = language === "mr" ? "प्रगती" : "Progress";
  const statusLabel = language === "mr" ? "स्थिती" : "Status";
  const heading = language === "mr" ? "कामांचे तपशील" : "Work details";
  const emptyMsg = language === "mr" ? "सध्या प्रदर्शित करण्यासाठी कोणतीही कामे नाहीत." : "No works to display yet.";

  return (
    <motion.section id="works" className="py-20 px-6 bg-white relative mt-16 border-t-4 border-[#f97316]" {...anim}>
      <h3 className="text-2xl font-semibold text-center mb-6 text-[#1f6f43] flex items-center justify-center gap-2">
        <Hammer size={20} /> {heading}
      </h3>
      {loading ? (
        <p className="text-center text-gray-500 text-sm py-8">{language === "mr" ? "लोड होत आहे…" : "Loading…"}</p>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-8">{emptyMsg}</p>
      ) : (
        <div className="relative">
          <button type="button" onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10 cursor-pointer">‹</button>
          <div ref={ref} className="flex gap-6 overflow-x-auto scroll-smooth px-10" style={{ scrollbarWidth: "none" }}>
            {items.map((w) => (
              <div
                key={w.id}
                onClick={() => setActive(w)}
                className="min-w-[300px] md:min-w-[350px] h-56 rounded-xl overflow-hidden relative shadow-md cursor-pointer hover:scale-[1.02] transition"
              >
                <img src={imageForId(w.id)} className="w-full h-full object-cover" alt={title(w)} />
                <div className="absolute inset-0 bg-black/40 flex items-end">
                  <h4 className="text-white font-semibold p-4 line-clamp-2">{title(w)}</h4>
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
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="absolute top-3 right-3 cursor-pointer" onClick={() => setActive(null)}><X size={18} /></button>
              <h3 className="text-lg font-semibold mb-4 text-[#1f6f43] pr-8">{title(active)}</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>{statusLabel}:</strong> {active.status}</p>
                <p><strong>{budgetLabel}:</strong> {formatInr(Number(active.budget_inr) || 0)}</p>
                {active.contractor ? <p><strong>{contractorLabel}:</strong> {active.contractor}</p> : null}
                {active.start_date ? <p><strong>{startLabel}:</strong> {active.start_date}</p> : null}
                {active.end_date ? <p><strong>{endLabel}:</strong> {active.end_date}</p> : null}
                <p><strong>{progressLabel}:</strong> {active.progress ?? 0}%</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
