"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

interface App { id: string; application_no: string; service_type: string; status: string; submitted_at: string; remarks: string; }

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState<App[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("applications").select("*").eq("citizen_id", user.id).order("submitted_at", { ascending: false });
      setApps(data || []);
    };
    load();
  }, [user]);

  const statusColor = (s: string) => s === "approved" ? "bg-green-100 text-green-700" : s === "rejected" ? "bg-red-100 text-red-700" : s === "processing" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700";

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1f6f43] mb-4">My Applications</h1>
      {apps.length === 0 ? (
        <p className="text-gray-500 text-sm">No applications submitted yet.</p>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a.id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{a.application_no} <span className={`text-xs px-2 py-0.5 rounded ${statusColor(a.status)}`}>{a.status}</span></p>
                  <p className="text-sm text-gray-500">{a.service_type} · {new Date(a.submitted_at).toLocaleDateString()}</p>
                </div>
              </div>
              {a.remarks && <p className="text-sm text-blue-600 mt-2">Remarks: {a.remarks}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
