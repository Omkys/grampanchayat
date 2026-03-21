"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Landmark, Users, CreditCard, Droplets, Hammer, Building2, Home, ClipboardList, ExternalLink, X } from "lucide-react";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

const noticesData = {
  mr: [
    { title: "ग्रामसभा सूचना", date: "15 Feb 2026", description: "ग्रामसभा दिनांक १५ फेब्रुवारी २०२६ रोजी सकाळी ११ वाजता आयोजित करण्यात येणार आहे. सर्व नागरिकांनी उपस्थित राहावे." },
    { title: "पाणीपुरवठा सूचना", date: "18 Feb 2026", description: "पाणीपुरवठा देखभालीसाठी १८ फेब्रुवारी रोजी सकाळी ८ ते दुपारी २ पर्यंत बंद राहील." },
    { title: "स्वच्छता अभियान", date: "20 Feb 2026", description: "गावात स्वच्छता अभियान राबविण्यात येणार आहे. सर्वांनी सहभाग घ्यावा." },
    { title: "वीजपुरवठा सूचना", date: "25 Feb 2026", description: "वीज देखभाल कामामुळे २५ फेब्रुवारी रोजी सकाळी १० ते दुपारी १ पर्यंत वीजपुरवठा बंद राहील." },
  ],
  en: [
    { title: "Gram Sabha Notice", date: "15 Feb 2026", description: "Gram Sabha will be held on 15 Feb 2026 at 11 AM. All citizens are requested to attend." },
    { title: "Water Supply Notice", date: "18 Feb 2026", description: "Water supply will remain closed on 18 Feb from 8 AM to 2 PM for maintenance." },
    { title: "Cleanliness Drive", date: "20 Feb 2026", description: "A village cleanliness drive will be conducted. All villagers are encouraged to participate." },
    { title: "Electricity Maintenance Notice", date: "25 Feb 2026", description: "Due to maintenance work, electricity supply will remain closed on 25 Feb from 10 AM to 1 PM." },
  ],
};

const schemes = [
  { Icon: Users, label: "PM Kisan Samman Nidhi / पंतप्रधान किसान सन्मान निधी", url: "https://pmkisan.gov.in/" },
  { Icon: CreditCard, label: "MahaDBT Farmer Schemes / महाडीबीटी शेतकरी योजना", url: "https://mahadbt.maharashtra.gov.in/" },
  { Icon: Droplets, label: "Agriculture Dept / कृषी विभाग योजना", url: "https://agricoop.nic.in/" },
  { Icon: Hammer, label: "MGNREGA / मनरेगा", url: "https://nrega.nic.in/" },
  { Icon: Building2, label: "Rural Development / ग्रामविकास विभाग", url: "https://rdd.maharashtra.gov.in/" },
  { Icon: Home, label: "Maharashtra Housing / महाराष्ट्र गृहनिर्माण योजना", url: "https://housing.maharashtra.gov.in/" },
  { Icon: ClipboardList, label: "PDS / सार्वजनिक वितरण प्रणाली", url: "https://mahafood.gov.in/" },
];

export default function NoticeAndSchemes({ language }: { language: "mr" | "en" }) {
  const [startIdx, setStartIdx] = useState(0);
  const [activeNotice, setActiveNotice] = useState<{ title: string; date: string; description: string } | null>(null);
  const notices = noticesData[language];

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
            {schemes.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#f97316] transition group">
                <s.Icon size={16} className="text-[#1f6f43]" />
                <span>{s.label}</span>
                <ExternalLink size={14} className="ml-auto opacity-60 group-hover:opacity-100" />
              </a>
            ))}
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
