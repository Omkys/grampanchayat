"use client";
import { useState, useEffect } from "react";
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
      <Navbar language={language} setLanguage={setLanguage} activeSection={activeSection} />
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
    </div>
  );
}
