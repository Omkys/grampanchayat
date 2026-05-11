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
import { mergeSiteSettings } from "@/lib/site-settings";

const navIds = ["home", "notice", "about", "services", "works", "events", "officials"];

export default function HomePage() {
  const [language, setLanguage] = useState<"mr" | "en">("mr");
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("home");
  const [siteSettings, setSiteSettings] = useState(() => mergeSiteSettings({}));

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => setSiteSettings(mergeSiteSettings(data)))
      .catch(() => setSiteSettings(mergeSiteSettings({})));
  }, []);

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
      <Navbar
        language={language}
        setLanguage={setLanguage}
        activeSection={activeSection}
        gpNameMr={siteSettings.gp_name_mr}
        gpNameEn={siteSettings.gp_name_en}
      />
      <HeroSection language={language} heroIndex={heroIndex} setHeroIndex={setHeroIndex} settings={siteSettings} />
      <LeadershipStrip />
      <NoticeAndSchemes language={language} />
      <AboutSection language={language} aboutMr={siteSettings.about_mr} aboutEn={siteSettings.about_en} />
      <CitizenServices language={language} />
      <AgriSection language={language} />
      <WorksCarousel language={language} />
      <EventsCarousel language={language} />
      <OfficialsGrid language={language} />
      <Footer language={language} settings={siteSettings} />
    </div>
  );
}
