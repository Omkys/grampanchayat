"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [stats, setStats] = useState({ notices: 0, works: 0, events: 0, applications: 0 });

  useEffect(() => {
    const load = async () => {
      const [n, w, e, a] = await Promise.all([
        supabase.from("notices").select("id", { count: "exact", head: true }),
        supabase.from("works").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("applications").select("id", { count: "exact", head: true }),
      ]);
      setStats({ notices: n.count || 0, works: w.count || 0, events: e.count || 0, applications: a.count || 0 });
    };
    load();
  }, []);

  const cards = [
    { label: "Notices", value: stats.notices, color: "bg-orange-500" },
    { label: "Works", value: stats.works, color: "bg-green-600" },
    { label: "Events", value: stats.events, color: "bg-blue-500" },
    { label: "Applications", value: stats.applications, color: "bg-purple-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1f6f43] mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`${c.color} text-white rounded-xl p-6`}>
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-sm mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
