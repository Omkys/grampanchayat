"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, X } from "lucide-react";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

const eventItems = Array.from({ length: 10 }, (_, i) => ({
  title: `Village Event ${i + 1}`,
  image: `https://source.unsplash.com/600x400/?village,event,india&sig=${i + 20}`,
  date: `0${(i % 9) + 1}/03/2026`,
  location: "Gram Panchayat Ground",
  description: `Detailed information about Village Event ${i + 1}. This event focuses on community development and public participation.`,
}));

export default function EventsCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<typeof eventItems[0] | null>(null);
  const scroll = (dir: "left" | "right") => ref.current?.scrollBy({ left: dir === "left" ? -350 : 350, behavior: "smooth" });

  return (
    <motion.section id="events" className="py-14 px-6 bg-[#fff7ed] relative" {...anim}>
      <h3 className="text-2xl font-semibold text-center mb-6 text-[#1f6f43] flex items-center justify-center gap-2">
        <CalendarDays size={20} /> कार्यक्रम / Events
      </h3>
      <div className="relative">
        <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10 cursor-pointer">‹</button>
        <div ref={ref} className="flex gap-6 overflow-x-auto scroll-smooth px-10" style={{ scrollbarWidth: "none" }}>
          {eventItems.map((e, i) => (
            <div key={i} onClick={() => setActive(e)} className="min-w-[300px] md:min-w-[350px] h-56 rounded-xl overflow-hidden relative shadow-md cursor-pointer hover:scale-[1.02] transition">
              <img src={e.image} className="w-full h-full object-cover" alt={e.title} />
              <div className="absolute inset-0 bg-black/40 flex items-end"><h4 className="text-white font-semibold p-4">{e.title}</h4></div>
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
              <h3 className="text-lg font-semibold mb-2 text-[#1f6f43]">{active.title}</h3>
              <p className="text-xs text-gray-500 mb-3">Date: {active.date}</p>
              <p className="text-sm mb-2"><strong>Location:</strong> {active.location}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{active.description}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
