"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface App { id: string; application_no: string; service_type: string; form_data: { name: string; mobile: string; details: string }; status: string; remarks: string; submitted_at: string; }

export default function ApplicationsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");

  const load = async () => { const { data } = await supabase.from("applications").select("*").order("submitted_at", { ascending: false }); setApps(data || []); };
  useEffect(() => { load(); }, []);

  const update = async (id: string) => {
    await supabase.from("applications").update({ status, remarks, updated_at: new Date().toISOString() }).eq("id", id);
    setUpdating(null); load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1f6f43] mb-4">Applications</h1>
      <div className="space-y-3">
        {apps.map((a) => (
          <div key={a.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{a.application_no} <span className={`text-xs px-2 py-0.5 rounded ${a.status === "approved" ? "bg-green-100 text-green-700" : a.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{a.status}</span></p>
                <p className="text-sm text-gray-500">{a.service_type} · {new Date(a.submitted_at).toLocaleDateString()}</p>
                <p className="text-sm mt-1">Name: {a.form_data.name} · Mobile: {a.form_data.mobile}</p>
                {a.form_data.details && <p className="text-sm text-gray-600">{a.form_data.details}</p>}
                {a.remarks && <p className="text-sm text-blue-600 mt-1">Remarks: {a.remarks}</p>}
              </div>
              <Button size="sm" variant="outline" onClick={() => { setUpdating(a.id); setStatus(a.status); setRemarks(a.remarks || ""); }}>Update</Button>
            </div>
            {updating === a.id && (
              <div className="mt-3 flex gap-2 items-end">
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-3 py-2 text-sm">
                  <option value="pending">Pending</option><option value="processing">Processing</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
                </select>
                <input placeholder="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="border rounded px-3 py-2 text-sm flex-1" />
                <Button size="sm" className="bg-[#1f6f43] text-white" onClick={() => update(a.id)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setUpdating(null)}>Cancel</Button>
              </div>
            )}
          </div>
        ))}
        {apps.length === 0 && <p className="text-gray-500 text-sm">No applications yet.</p>}
      </div>
    </div>
  );
}
