"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface Complaint {
  id: string; complaint_no: string; complaint_type: string; subject: string;
  description: string; citizen_id: string; status: string; response: string;
  submitted_at: string;
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [response, setResponse] = useState("");
  const [filter, setFilter] = useState("all");

  const load = async () => {
    let q = supabase.from("complaints").select("*").order("submitted_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setComplaints(data || []);
  };

  useEffect(() => { load(); }, [filter]);

  const update = async (id: string) => {
    await supabase.from("complaints").update({ status, response, updated_at: new Date().toISOString() }).eq("id", id);
    setEditing(null);
    load();
  };

  const statusColor = (s: string) =>
    s === "resolved" ? "bg-green-100 text-green-700" :
    s === "closed" ? "bg-gray-100 text-gray-700" :
    s === "in_progress" ? "bg-blue-100 text-blue-700" :
    "bg-yellow-100 text-yellow-700";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#1f6f43]">Complaints</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-3 py-2 text-sm">
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="space-y-3">
        {complaints.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">
                  {c.complaint_no} <span className={`text-xs px-2 py-0.5 rounded ${statusColor(c.status)}`}>{c.status}</span>
                </p>
                <p className="text-sm text-gray-500">{c.complaint_type} · {new Date(c.submitted_at).toLocaleDateString()}</p>
                <p className="text-sm font-medium mt-1">{c.subject}</p>
                {c.description && <p className="text-sm text-gray-600 mt-1">{c.description}</p>}
                {c.response && <p className="text-sm text-blue-600 mt-2">Response: {c.response}</p>}
              </div>
              <Button size="sm" variant="outline" onClick={() => { setEditing(c.id); setStatus(c.status); setResponse(c.response || ""); }}>
                Update
              </Button>
            </div>
            {editing === c.id && (
              <div className="mt-3 flex gap-2 items-end">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-3 py-2 text-sm">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <input placeholder="Response to citizen" value={response} onChange={(e) => setResponse(e.target.value)} className="border rounded px-3 py-2 text-sm flex-1" />
                <Button size="sm" className="bg-[#1f6f43] text-white" onClick={() => update(c.id)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            )}
          </div>
        ))}
        {complaints.length === 0 && <p className="text-gray-500 text-sm">No complaints found.</p>}
      </div>
    </div>
  );
}
