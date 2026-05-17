"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Megaphone, Hammer, CalendarDays, UserCheck, ClipboardList, Landmark, Settings, LayoutDashboard, MessageSquareWarning, BookOpen, ImageIcon } from "lucide-react";

const sidebarLinks = [
  { href: "/dashboard", label_mr: "विहंगावलोकन", label_en: "Overview", Icon: LayoutDashboard },
  { href: "/dashboard/notices", label_mr: "सूचना", label_en: "Notices", Icon: Megaphone },
  { href: "/dashboard/works", label_mr: "कामे", label_en: "Works", Icon: Hammer },
  { href: "/dashboard/events", label_mr: "कार्यक्रम", label_en: "Events", Icon: CalendarDays },
  { href: "/dashboard/officials", label_mr: "पदाधिकारी", label_en: "Officials", Icon: UserCheck },
  { href: "/dashboard/leaders", label_mr: "नेते / पदाधिकारी", label_en: "Leaders", Icon: ImageIcon },
  { href: "/dashboard/applications", label_mr: "अर्ज", label_en: "Applications", Icon: ClipboardList },
  { href: "/dashboard/complaints", label_mr: "तक्रारी", label_en: "Complaints", Icon: MessageSquareWarning },
  { href: "/dashboard/schemes", label_mr: "शासन योजना", label_en: "Schemes", Icon: BookOpen },
  { href: "/dashboard/market-rates", label_mr: "बाजारभाव", label_en: "Market Rates", Icon: Landmark },
  { href: "/dashboard/settings", label_mr: "सेटिंग्ज", label_en: "Settings", Icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  const [lang, setLang] = useState<"mr" | "en">("mr");

  const authorized = Boolean(user && (user.role === "admin" || user.role === "official"));

  // Never call router during render — it triggers "Router action dispatched before initialization" in Next.js 16+.
  useEffect(() => {
    if (loading) return;
    if (!authorized) {
      router.replace("/login");
    }
  }, [loading, authorized, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!authorized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Redirecting to sign in…
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] text-[#1f3d2b]">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#f97316]/30 via-white/70 to-[#1f6f43]/30 backdrop-blur-md shadow-md border-b border-white/30">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#f97316] via-white to-[#1f6f43]" />
        <div className="max-w-full mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="w-10 h-10" alt="Emblem" />
            <div>
              <p className="text-[11px] text-gray-600">Government of Maharashtra</p>
              <Link href="/" className="text-base font-semibold text-[#1f6f43]">
                {lang === "mr" ? "ग्रामपंचायत बावी" : "Grampanchayat Bavi"}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-[#1f6f43] text-white px-2 py-1 rounded">{user.role === "admin" ? "Admin" : "Official"}</span>
            <Button size="sm" variant={lang === "mr" ? "default" : "outline"} onClick={() => setLang("mr")}>मराठी</Button>
            <Button size="sm" variant={lang === "en" ? "default" : "outline"} onClick={() => setLang("en")}>EN</Button>
            <Link href="/">
              <Button size="sm" variant="outline">{lang === "mr" ? "मुख्यपृष्ठ" : "Home"}</Button>
            </Link>
            <span className="text-xs text-gray-500 hidden md:block">{user.email}</span>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              {lang === "mr" ? "लॉगआउट" : "Logout"}
            </Button>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="w-56 min-h-[calc(100vh-60px)] bg-white border-r shadow-sm p-3 space-y-1">
          {sidebarLinks.map((l) => (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${pathname === l.href ? "bg-[#1f6f43] text-white" : "text-gray-700 hover:bg-[#1f6f43]/10"}`}>
              <l.Icon size={16} />
              {lang === "mr" ? l.label_mr : l.label_en}
            </Link>
          ))}
        </aside>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
