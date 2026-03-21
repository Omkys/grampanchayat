"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, logout } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/citizen", label: "Overview" },
  { href: "/citizen/applications", label: "My Applications" },
  { href: "/citizen/complaints", label: "My Complaints" },
];

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#fdfaf5]">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-[#1f6f43] font-semibold">GP Jawalke</Link>
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={`text-sm ${pathname === l.href ? "text-[#1f6f43] font-medium" : "text-gray-600 hover:text-[#1f6f43]"}`}>{l.label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{user?.email}</span>
            <Button size="sm" variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
