"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LeadershipStrip from "@/components/LeadershipStrip";
import NoticeAndSchemes from "@/components/NoticeAndSchemes";
import AboutSection from "@/components/AboutSection";
import CitizenServices from "@/components/CitizenServices";
import AgriSection from "@/components/AgriSection";
import WorksCarousel from "@/components/WorksCarousel";
import EventsCarousel from "@/components/EventsCarousel";
import OfficialsGrid from "@/components/OfficialsGrid";
import Footer from "@/components/Footer";

const navIds = ["home", "notice", "about", "services", "works", "events", "officials"];

export default function HomePage() {
  const [language, setLanguage] = useState<"mr" | "en">("mr");
  const [showLogin, setShowLogin] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 150;
      for (const id of navIds) {
        const el = document.getElementById(id);
        if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
          setActiveSection(id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [language]);

  return (
    <div className="min-h-screen bg-[#fdfaf5] text-[#1f3d2b]">
      <Navbar language={language} setLanguage={setLanguage} activeSection={activeSection} setShowLogin={setShowLogin} />
      <HeroSection language={language} heroIndex={heroIndex} setHeroIndex={setHeroIndex} />
      <LeadershipStrip />
      <NoticeAndSchemes language={language} />
      <AboutSection language={language} />
      <CitizenServices language={language} />
      <AgriSection language={language} />
      <WorksCarousel />
      <EventsCarousel />
      <OfficialsGrid language={language} />
      <Footer language={language} />

      <AnimatePresence>
        {showLogin && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowLogin(false)}>
            <motion.div className="bg-white p-6 rounded-xl w-[90%] max-w-sm relative" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-3 right-3 cursor-pointer" onClick={() => setShowLogin(false)}><X size={18} /></button>
              <h3 className="text-lg font-semibold mb-4 text-center text-[#1f6f43]">{language === "mr" ? "लॉगिन" : "Login"}</h3>
              <input type="text" placeholder="Username" className="w-full border rounded-md px-3 py-2 mb-3" />
              <input type="password" placeholder="Password" className="w-full border rounded-md px-3 py-2 mb-4" />
              <Button className="w-full bg-[#1f6f43] text-white">{language === "mr" ? "लॉगिन" : "Login"}</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
