"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, X } from "lucide-react";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

const workItems = Array.from({ length: 10 }, (_, i) => ({
  title: `Work Project ${i + 1}`,
  image: `https://source.unsplash.com/600x400/?village,road,construction&sig=${i}`,
  cost: `₹${(i + 1) * 2} Lakhs`,
  contractor: `Contractor ${i + 1}`,
  startDate: `01/01/202${i % 3}`,
  endDate: `30/06/202${i % 3}`,
  progress: `${(i + 1) * 8}%`,
}));

export default function WorksCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<typeof workItems[0] | null>(null);
  const scroll = (dir: "left" | "right") => ref.current?.scrollBy({ left: dir === "left" ? -350 : 350, behavior: "smooth" });

  return (
    <motion.section id="works" className="py-20 px-6 bg-white relative mt-16 border-t-4 border-[#f97316]" {...anim}>
      <h3 className="text-2xl font-semibold text-center mb-6 text-[#1f6f43] flex items-center justify-center gap-2">
        <Hammer size={20} /> कामांचे तपशील / Work Details
      </h3>
      <div className="relative">
        <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10 cursor-pointer">‹</button>
        <div ref={ref} className="flex gap-6 overflow-x-auto scroll-smooth px-10" style={{ scrollbarWidth: "none" }}>
          {workItems.map((w, i) => (
            <div key={i} onClick={() => setActive(w)} className="min-w-[300px] md:min-w-[350px] h-56 rounded-xl overflow-hidden relative shadow-md cursor-pointer hover:scale-[1.02] transition">
              <img src={w.image} className="w-full h-full object-cover" alt={w.title} />
              <div className="absolute inset-0 bg-black/40 flex items-end"><h4 className="text-white font-semibold p-4">{w.title}</h4></div>
            </div>
          ))}
        </div>
        <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10 cursor-pointer">›</button>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setActive(null)}>
            <motion.div className="bg-white p-6 rounded-xl w-[90%] max-w-lg relative" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-3 right-3 cursor-pointer" onClick={() => setActive(null)}><X size={18} /></button>
              <h3 className="text-lg font-semibold mb-4 text-[#1f6f43]">{active.title}</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Project Cost:</strong> {active.cost}</p>
                <p><strong>Contractor:</strong> {active.contractor}</p>
                <p><strong>Start Date:</strong> {active.startDate}</p>
                <p><strong>End Date:</strong> {active.endDate}</p>
                <p><strong>Progress:</strong> {active.progress}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
