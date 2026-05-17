"use client";
import { motion } from "framer-motion";
import { Users, Hammer, ClipboardList, School } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import { parseStat } from "@/lib/site-settings";
import { sectionAnim } from "@/lib/section-anim";

const heroImages = [
  "https://images.pexels.com/photos/33872281/pexels-photo-33872281.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/5111999/pexels-photo-5111999.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/2909066/pexels-photo-2909066.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/30860914/pexels-photo-30860914.jpeg?auto=compress&cs=tinysrgb&w=1600",
];

interface Props {
  language: "mr" | "en";
  heroIndex: number;
  setHeroIndex: (fn: (p: number) => number) => void;
  settings: Record<string, string>;
}

export default function HeroSection({ language, heroIndex, setHeroIndex, settings }: Props) {
  const title = language === "mr" ? settings.gp_name_mr : settings.gp_name_en;
  const population = parseStat(settings.population, 1082);
  const totalWorks = parseStat(settings.total_works, 120);
  const totalSchemes = parseStat(settings.total_schemes, 45);
  const totalFacilities = parseStat(settings.total_facilities, 18);
  return (
    <motion.section
      id="home"
      className="relative min-h-[500px] flex flex-col items-center justify-center text-white overflow-hidden"
      style={{ backgroundImage: `url(${heroImages[heroIndex]})`, backgroundSize: "cover", backgroundPosition: "center" }}
      {...sectionAnim}
    >
      <div className="absolute inset-0 bg-black/50" />
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setHeroIndex((p) => (p === 0 ? heroImages.length - 1 : p - 1))}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-3 rounded-full shadow z-20 cursor-pointer"
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setHeroIndex((p) => (p + 1) % heroImages.length)}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-3 rounded-full shadow z-20 cursor-pointer"
        aria-label="Next slide"
      >
        ›
      </button>
      <div className="relative z-10 text-center px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-10 drop-shadow-lg">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl mx-auto">
          <AnimatedCounter key={`pop-${population}`} value={population} label={language === "mr" ? "लोकसंख्या" : "Population"} Icon={Users} />
          <AnimatedCounter key={`tw-${totalWorks}`} value={totalWorks} label={language === "mr" ? "एकूण कामे" : "Total Works"} Icon={Hammer} />
          <AnimatedCounter key={`ts-${totalSchemes}`} value={totalSchemes} label={language === "mr" ? "योजना" : "Schemes"} Icon={ClipboardList} />
          <AnimatedCounter key={`tf-${totalFacilities}`} value={totalFacilities} label={language === "mr" ? "सुविधा" : "Facilities"} Icon={School} />
        </div>
      </div>
    </motion.section>
  );
}
