"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const linksData = {
  mr: [
    { href: "/citizen", label: "माझे खाते" },
    { href: "/citizen/applications", label: "माझे अर्ज" },
    { href: "/citizen/complaints", label: "माझ्या तक्रारी" },
  ],
  en: [
    { href: "/citizen", label: "My Account" },
    { href: "/citizen/applications", label: "My Applications" },
    { href: "/citizen/complaints", label: "My Complaints" },
  ],
};

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  const [lang, setLang] = useState<"mr" | "en">("mr");

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) { router.push("/login"); return null; }

  const links = linksData[lang];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] text-[#1f3d2b]">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#f97316]/30 via-white/70 to-[#1f6f43]/30 backdrop-blur-md shadow-md border-b border-white/30">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#f97316] via-white to-[#1f6f43]" />
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="w-10 h-10" alt="Emblem" />
            <div>
              <p className="text-[11px] text-gray-600">Government of Maharashtra</p>
              <Link href="/" className="text-base font-semibold text-[#1f6f43]">
                {lang === "mr" ? "ग्रामपंचायत बावी" : "Gram Panchayat Bavi"}
              </Link>
            </div>
          </div>
          <nav className="hidden md:flex gap-2 text-sm font-medium">
            <Link href="/" className="px-3 py-2 rounded-md hover:bg-[#f97316]/20 hover:text-[#f97316] transition">
              {lang === "mr" ? "मुख्यपृष्ठ" : "Home"}
            </Link>
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className={`px-3 py-2 rounded-md transition ${pathname === l.href ? "bg-[#1f6f43] text-white shadow-sm" : "hover:bg-[#f97316]/20 hover:text-[#f97316]"}`}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button size="sm" variant={lang === "mr" ? "default" : "outline"} onClick={() => setLang("mr")}>मराठी</Button>
            <Button size="sm" variant={lang === "en" ? "default" : "outline"} onClick={() => setLang("en")}>EN</Button>
            <span className="text-xs text-gray-500 hidden md:block">{user.email}</span>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              {lang === "mr" ? "लॉगआउट" : "Logout"}
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
