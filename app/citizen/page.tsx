"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";

export default function CitizenPage() {
  const { user } = useAuth();
  const [appCount, setAppCount] = useState(0);
  const [compCount, setCompCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [a, c] = await Promise.all([
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("citizen_id", user.id),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("citizen_id", user.id),
      ]);
      setAppCount(a.count || 0);
      setCompCount(c.count || 0);
    };
    load();
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1f6f43] mb-6">Welcome, Citizen</h1>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Link href="/citizen/applications" className="bg-white p-6 rounded-xl shadow text-center hover:shadow-md transition">
          <p className="text-3xl font-bold text-[#1f6f43]">{appCount}</p>
          <p className="text-sm text-gray-600 mt-1">My Applications</p>
        </Link>
        <Link href="/citizen/complaints" className="bg-white p-6 rounded-xl shadow text-center hover:shadow-md transition">
          <p className="text-3xl font-bold text-[#f97316]">{compCount}</p>
          <p className="text-sm text-gray-600 mt-1">My Complaints</p>
        </Link>
      </div>
    </div>
  );
}
