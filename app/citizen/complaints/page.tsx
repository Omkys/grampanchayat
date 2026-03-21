"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

interface Complaint { id: string; complaint_no: string; complaint_type: string; subject: string; status: string; submitted_at: string; response: string; }

export default function MyComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("complaints").select("*").eq("citizen_id", user.id).order("submitted_at", { ascending: false });
      setComplaints(data || []);
    };
    load();
  }, [user]);

  const statusColor = (s: string) => s === "resolved" ? "bg-green-100 text-green-700" : s === "closed" ? "bg-gray-100 text-gray-700" : s === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700";

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1f6f43] mb-4">My Complaints</h1>
      {complaints.length === 0 ? (
        <p className="text-gray-500 text-sm">No complaints submitted yet.</p>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm">
              <p className="font-semibold">{c.complaint_no} <span className={`text-xs px-2 py-0.5 rounded ${statusColor(c.status)}`}>{c.status}</span></p>
              <p className="text-sm text-gray-500">{c.complaint_type} · {new Date(c.submitted_at).toLocaleDateString()}</p>
              <p className="text-sm mt-1">{c.subject}</p>
              {c.response && <p className="text-sm text-blue-600 mt-2">Response: {c.response}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
