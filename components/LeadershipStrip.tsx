"use client";
import { motion } from "framer-motion";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

export default function LeadershipStrip() {
  return (
    <motion.section id="leadership" className="py-6 px-6 bg-white" {...anim}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center md:justify-start gap-10">
          {["Sarpanch", "D Sarpanch", "Sadasya"].map((role, i) => (
            <div key={i} className="flex flex-col items-center">
              <img src={`https://source.unsplash.com/200x200/?indian,village,leader&sig=${i + 10}`} className="w-20 h-20 rounded-full object-cover border-2 border-[#f97316] shadow-sm" alt={role} />
              <p className="text-xs font-medium mt-2 text-gray-700">{role}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center md:justify-end gap-10">
          {[
            { role: "CM", src: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Devendra_Fadnavis_2022.jpg" },
            { role: "DCM", src: "https://source.unsplash.com/200x200/?indian,politician,portrait&sig=0" },
            { role: "Minister", src: "https://source.unsplash.com/200x200/?indian,politician,portrait&sig=1" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <img src={item.src} className="w-20 h-20 rounded-full object-cover border-2 border-[#1f6f43] shadow-sm" alt={item.role} />
              <p className="text-xs font-medium mt-2 text-gray-700">{item.role}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
