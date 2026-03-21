"use client";
import { motion } from "framer-motion";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

const villageLeaders = [
  { role: "Sarpanch", color: "border-[#f97316]" },
  { role: "D Sarpanch", color: "border-[#f97316]" },
  { role: "Sadasya", color: "border-[#f97316]" },
];

const govtLeaders = [
  { role: "CM", color: "border-[#1f6f43]" },
  { role: "DCM", color: "border-[#1f6f43]" },
  { role: "Minister", color: "border-[#1f6f43]" },
];

export default function LeadershipStrip() {
  return (
    <motion.section id="leadership" className="py-6 px-6 bg-white" {...anim}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center md:justify-start gap-10">
          {villageLeaders.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full ${item.color} border-2 bg-[#f97316]/10 flex items-center justify-center shadow-sm`}>
                <span className="text-2xl">👤</span>
              </div>
              <p className="text-xs font-medium mt-2 text-gray-700">{item.role}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center md:justify-end gap-10">
          {govtLeaders.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full ${item.color} border-2 bg-[#1f6f43]/10 flex items-center justify-center shadow-sm`}>
                <span className="text-2xl">👤</span>
              </div>
              <p className="text-xs font-medium mt-2 text-gray-700">{item.role}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
