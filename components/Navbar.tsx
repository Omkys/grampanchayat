"use client";
import { useEffect, useState } from "react";
import { LogIn, User, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthContext } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface NavbarProps {
  language: "mr" | "en";
  setLanguage: (l: "mr" | "en") => void;
  activeSection: string;
  gpNameMr?: string;
  gpNameEn?: string;
}

export default function Navbar({ language, setLanguage, activeSection, gpNameMr, gpNameEn }: NavbarProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nav = language === "mr"
    ? [
        { label: "मुख्यपृष्ठ", id: "home" },
        { label: "सूचना", id: "notice" },
        { label: "आमच्याविषयी", id: "about" },
        { label: "सेवा", id: "services" },
        { label: "कामे", id: "works" },
        { label: "कार्यक्रम", id: "events" },
        { label: "पदाधिकारी", id: "officials" },
      ]
    : [
        { label: "Home", id: "home" },
        { label: "Notice", id: "notice" },
        { label: "About", id: "about" },
        { label: "Services", id: "services" },
        { label: "Works", id: "works" },
        { label: "Events", id: "events" },
        { label: "Officials", id: "officials" },
      ];

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const dashboardLink = user?.role === "admin" || user?.role === "official" ? "/dashboard" : "/citizen";

  return (
    <header
      suppressHydrationWarning
      className="sticky top-0 z-50 bg-gradient-to-r from-[#f97316]/30 via-white/70 to-[#1f6f43]/30 backdrop-blur-md shadow-md border-b border-white/30"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-[#f97316] via-white to-[#1f6f43]" />
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="w-12 h-12" alt="Emblem" />
          <div>
            <p className="text-[11px] text-gray-600">Government of Maharashtra</p>
            <h1 className="text-base font-semibold text-[#1f6f43]">
              {language === "mr" ? (gpNameMr || "ग्रामपंचायत बावी") : (gpNameEn || "Grampanchayat Bavi")}
            </h1>
          </div>
        </div>
        <nav className="hidden md:flex gap-3 text-sm font-medium">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`px-3 py-2 rounded-md transition-all duration-200 cursor-pointer ${
                activeSection === item.id
                  ? "bg-[#1f6f43] text-white shadow-sm"
                  : "hover:bg-[#f97316]/20 hover:text-[#f97316]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button size="sm" variant={language === "mr" ? "default" : "outline"} onClick={() => setLanguage("mr")}>मराठी</Button>
          <Button size="sm" variant={language === "en" ? "default" : "outline"} onClick={() => setLanguage("en")}>EN</Button>

          {!mounted || loading ? (
            <div className="h-8 w-24 rounded-md bg-gray-100/80 animate-pulse" aria-hidden />
          ) : user ? (
            <>
              <div className="hidden md:flex flex-col items-end text-xs leading-tight">
                <span className="font-medium text-[#1f6f43]">{user.full_name || user.email}</span>
                {user.full_name && <span className="text-gray-400">{user.email}</span>}
              </div>
              <Link href={dashboardLink}>
                <Button size="sm" variant="outline" className="gap-1">
                  <LayoutDashboard size={14} />
                  {user.role === "admin" || user.role === "official"
                    ? (language === "mr" ? "डॅशबोर्ड" : "Dashboard")
                    : (language === "mr" ? "माझे खाते" : "My Account")}
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={handleLogout} className="gap-1">
                <User size={14} />
                {language === "mr" ? "लॉगआउट" : "Logout"}
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-[#1f6f43] text-white">
                <LogIn size={14} /> {language === "mr" ? "लॉगिन" : "Login"}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
