"use client";
import { motion } from "framer-motion";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

const villageLeaders = [
  { role_mr: "सरपंच", role_en: "Sarpanch", color: "border-[#f97316]", bg: "bg-[#f97316]/10", img: "/images/leaders/sarpanch.jpeg" },
  { role_mr: "उपसरपंच", role_en: "Dy. Sarpanch", color: "border-[#f97316]", bg: "bg-[#f97316]/10", img: "/images/leaders/dsarpanch.jpeg" },
  { role_mr: "सदस्य", role_en: "Member", color: "border-[#f97316]", bg: "bg-[#f97316]/10", img: "/images/leaders/sadasya.jpeg" },
];

const govtLeaders = [
  { role_mr: "मुख्यमंत्री", role_en: "Chief Minister", color: "border-[#1f6f43]", bg: "bg-[#1f6f43]/10", img: "/images/leaders/cm.jpg" },
  { role_mr: "उपमुख्यमंत्री", role_en: "Dy. CM", color: "border-[#1f6f43]", bg: "bg-[#1f6f43]/10", img: "/images/leaders/dcm.jpg" },
];

function LeaderAvatar({ item }: { item: typeof villageLeaders[0] }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-20 h-20 rounded-full ${item.color} border-2 overflow-hidden ${item.bg} flex items-center justify-center shadow-sm`}>
        <img
          src={item.img}
          alt={item.role_en}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">👤</span>'; }}
        />
      </div>
      <p className="text-xs font-medium mt-2 text-gray-700">{item.role_en}</p>
    </div>
  );
}

export default function LeadershipStrip({ language }: { language?: "mr" | "en" }) {
  const lang = language || "mr";
  return (
    <motion.section id="leadership" className="py-6 px-6 bg-white" {...anim}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center md:justify-start gap-10">
          {villageLeaders.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full ${item.color} border-2 overflow-hidden ${item.bg} flex items-center justify-center shadow-sm`}>
                <img
                  src={item.img}
                  alt={lang === "mr" ? item.role_mr : item.role_en}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">👤</span>'; }}
                />
              </div>
              <p className="text-xs font-medium mt-2 text-gray-700">{lang === "mr" ? item.role_mr : item.role_en}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center md:justify-end gap-10">
          {govtLeaders.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full ${item.color} border-2 overflow-hidden ${item.bg} flex items-center justify-center shadow-sm`}>
                <img
                  src={item.img}
                  alt={lang === "mr" ? item.role_mr : item.role_en}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">👤</span>'; }}
                />
              </div>
              <p className="text-xs font-medium mt-2 text-gray-700">{lang === "mr" ? item.role_mr : item.role_en}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
