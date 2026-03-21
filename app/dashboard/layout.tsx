"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, logout } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/notices", label: "Notices" },
  { href: "/dashboard/works", label: "Works" },
  { href: "/dashboard/events", label: "Events" },
  { href: "/dashboard/officials", label: "Officials" },
  { href: "/dashboard/applications", label: "Applications" },
  { href: "/dashboard/market-rates", label: "Market Rates" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth(["admin", "official"]);
  const pathname = usePathname();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-[#1f6f43] text-white flex flex-col">
        <div className="p-4 border-b border-white/20">
          <h2 className="font-semibold text-sm">GP Jawalke</h2>
          <p className="text-xs text-white/70">{role} panel</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`block px-3 py-2 rounded text-sm transition ${pathname === l.href ? "bg-white/20 font-medium" : "hover:bg-white/10"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/20">
          <p className="text-xs text-white/70 mb-2">{user?.email}</p>
          <Button size="sm" variant="outline" className="w-full text-white border-white/30 hover:bg-white/10" onClick={logout}>Logout</Button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
