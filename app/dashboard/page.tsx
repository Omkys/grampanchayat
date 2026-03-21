"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Megaphone, Hammer, CalendarDays, ClipboardList, MessageSquareWarning, Users } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ notices: 0, works: 0, events: 0, applications: 0, complaints: 0, officials: 0 });
  const [pendingApps, setPendingApps] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [n, w, e, a, c, o, pa, pc] = await Promise.all([
        supabase.from("notices").select("id", { count: "exact", head: true }),
        supabase.from("works").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("applications").select("id", { count: "exact", head: true }),
        supabase.from("complaints").select("id", { count: "exact", head: true }),
        supabase.from("officials").select("id", { count: "exact", head: true }),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("status", "open"),
      ]);
      setStats({
        notices: n.count || 0, works: w.count || 0, events: e.count || 0,
        applications: a.count || 0, complaints: c.count || 0, officials: o.count || 0,
      });
      setPendingApps(pa.count || 0);
      setPendingComplaints(pc.count || 0);
    };
    load();
  }, []);

  const cards = [
    { label: "Applications", value: stats.applications, pending: pendingApps, Icon: ClipboardList, href: "/dashboard/applications", accent: "border-l-[#f97316]" },
    { label: "Complaints", value: stats.complaints, pending: pendingComplaints, Icon: MessageSquareWarning, href: "/dashboard/complaints", accent: "border-l-red-500" },
    { label: "Notices", value: stats.notices, Icon: Megaphone, href: "/dashboard/notices", accent: "border-l-[#1f6f43]" },
    { label: "Works", value: stats.works, Icon: Hammer, href: "/dashboard/works", accent: "border-l-blue-500" },
    { label: "Events", value: stats.events, Icon: CalendarDays, href: "/dashboard/events", accent: "border-l-purple-500" },
    { label: "Officials", value: stats.officials, Icon: Users, href: "/dashboard/officials", accent: "border-l-gray-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1f3d2b] mb-6">Dashboard Overview</h1>

      {(pendingApps > 0 || pendingComplaints > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
          ⚠️ {pendingApps > 0 && <span><strong>{pendingApps}</strong> pending application{pendingApps > 1 ? "s" : ""}</span>}
          {pendingApps > 0 && pendingComplaints > 0 && " · "}
          {pendingComplaints > 0 && <span><strong>{pendingComplaints}</strong> pending complaint{pendingComplaints > 1 ? "s" : ""}</span>}
          {" — "}require your attention.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <div className={`bg-white rounded-lg border-l-4 ${c.accent} p-5 shadow-sm hover:shadow-md transition`}>
              <div className="flex items-center justify-between mb-3">
                <c.Icon size={20} className="text-gray-400" />
                {c.pending !== undefined && c.pending > 0 && (
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">{c.pending} pending</span>
                )}
              </div>
              <p className="text-2xl font-bold text-[#1f3d2b]">{c.value}</p>
              <p className="text-sm text-gray-500 mt-1">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
