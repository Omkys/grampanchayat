"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Landmark, ExternalLink, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

interface Notice { id: string; title_mr: string; title_en: string; date: string; description_mr: string; description_en: string; created_at: string; }
interface Scheme { id: string; name_mr: string; name_en: string; url: string; }

const fallbackNotices = {
  mr: [
    { title: "ग्रामसभा सूचना", date: "15 Feb 2026", description: "ग्रामसभा दिनांक १५ फेब्रुवारी २०२६ रोजी सकाळी ११ वाजता आयोजित करण्यात येणार आहे." },
    { title: "पाणीपुरवठा सूचना", date: "18 Feb 2026", description: "पाणीपुरवठा देखभालीसाठी १८ फेब्रुवारी रोजी सकाळी ८ ते दुपारी २ पर्यंत बंद राहील." },
    { title: "स्वच्छता अभियान", date: "20 Feb 2026", description: "गावात स्वच्छता अभियान राबविण्यात येणार आहे." },
  ],
  en: [
    { title: "Gram Sabha Notice", date: "15 Feb 2026", description: "Gram Sabha will be held on 15 Feb 2026 at 11 AM." },
    { title: "Water Supply Notice", date: "18 Feb 2026", description: "Water supply will remain closed on 18 Feb from 8 AM to 2 PM." },
    { title: "Cleanliness Drive", date: "20 Feb 2026", description: "A village cleanliness drive will be conducted." },
  ],
};

export default function NoticeAndSchemes({ language }: { language: "mr" | "en" }) {
  const [startIdx, setStartIdx] = useState(0);
  const [activeNotice, setActiveNotice] = useState<{ title: string; date: string; description: string } | null>(null);
  const [dbNotices, setDbNotices] = useState<Notice[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);

  useEffect(() => {
    supabase.from("notices").select("*").order("created_at", { ascending: false }).limit(10).then(({ data }) => setDbNotices(data || []));
    supabase.from("schemes").select("*").eq("is_active", true).order("sort_order", { ascending: true }).then(({ data }) => setSchemes(data || []));
  }, []);

  const notices = dbNotices.length > 0
    ? dbNotices.map((n) => ({ title: language === "mr" ? (n.title_mr || n.title_en) : (n.title_en || n.title_mr), date: new Date(n.date || n.created_at).toLocaleDateString(), description: language === "mr" ? (n.description_mr || n.description_en || "") : (n.description_en || n.description_mr || "") }))
    : fallbackNotices[language];

  return (
    <motion.section id="notice" className="py-14 px-6 bg-[#fff7ed]" {...anim}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10">
        <div>
          <h3 className="text-2xl font-semibold mb-6 text-[#1f6f43] flex items-center gap-2">
            <Megaphone size={20} /> {language === "mr" ? "सूचना फलक" : "Notice Board"}
          </h3>
          <div className="space-y-4 relative">
            {startIdx > 0 && (
              <button onClick={() => setStartIdx((p) => Math.max(p - 1, 0))} className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white shadow rounded-full px-3 py-1 text-sm cursor-pointer">↑</button>
            )}
            {notices.slice(startIdx, startIdx + 3).map((n, i) => (
              <div key={i} onClick={() => setActiveNotice(n)} className="bg-white border-l-4 border-[#f97316] p-5 shadow-sm rounded-md cursor-pointer hover:shadow-md transition">
                <p className="font-semibold text-base">{n.title}</p>
                <p className="text-xs text-gray-500 mt-2">{n.date}</p>
              </div>
            ))}
            {startIdx + 3 < notices.length && (
              <button onClick={() => setStartIdx((p) => Math.min(p + 1, notices.length - 3))} className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white shadow rounded-full px-3 py-1 text-sm cursor-pointer">↓</button>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-6 text-[#1f6f43] flex items-center gap-2">
            <Landmark size={18} /> {language === "mr" ? "महाराष्ट्र शासन योजना" : "Maharashtra Government Schemes"}
          </h3>
          <div className="bg-white rounded-xl shadow p-6 space-y-4 text-sm">
            {schemes.length > 0 ? schemes.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#f97316] transition group">
                <Landmark size={16} className="text-[#1f6f43] shrink-0" />
                <span>{language === "mr" ? (s.name_mr || s.name_en) : (s.name_en || s.name_mr)}</span>
                <ExternalLink size={14} className="ml-auto opacity-60 group-hover:opacity-100 shrink-0" />
              </a>
            )) : (
              <p className="text-gray-400 text-sm">No schemes available.</p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeNotice && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setActiveNotice(null)}>
            <motion.div className="bg-white p-6 rounded-xl w-[90%] max-w-lg relative" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-3 right-3 cursor-pointer" onClick={() => setActiveNotice(null)}><X size={18} /></button>
              <h3 className="text-lg font-semibold mb-2 text-[#1f6f43]">{activeNotice.title}</h3>
              <p className="text-xs text-gray-500 mb-4">{activeNotice.date}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{activeNotice.description}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
