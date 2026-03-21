"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";

interface Complaint { id: string; complaint_no: string; complaint_type: string; subject: string; status: string; submitted_at: string; response: string; }

const types = [
  { value: "water", label: "पाणीपुरवठा / Water Supply" },
  { value: "road", label: "रस्ते / Roads" },
  { value: "electricity", label: "वीज / Electricity" },
  { value: "sanitation", label: "स्वच्छता / Sanitation" },
  { value: "other", label: "इतर / Other" },
];

export default function MyComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ complaint_type: "water", subject: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; complaint_no?: string; error?: string } | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("complaints").select("*").eq("citizen_id", user.id).order("submitted_at", { ascending: false });
    setComplaints(data || []);
  };

  useEffect(() => { load(); }, [user]);

  const handleSubmit = async () => {
    if (!form.subject.trim()) { setResult({ success: false, error: "Subject is required" }); return; }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, citizen_id: user!.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, complaint_no: data.complaint_no });
        setForm({ complaint_type: "water", subject: "", description: "" });
        load();
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch {
      setResult({ success: false, error: "Network error" });
    }
    setSubmitting(false);
  };

  const statusColor = (s: string) => s === "resolved" ? "bg-green-100 text-green-700" : s === "closed" ? "bg-gray-100 text-gray-700" : s === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#1f6f43]">My Complaints</h1>
        <Button size="sm" className="bg-[#1f6f43] text-white" onClick={() => { setShowForm(!showForm); setResult(null); }}>
          {showForm ? "✕ Close" : "+ New Complaint"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
          {result?.success ? (
            <div className="text-center py-4">
              <p className="text-green-600 font-semibold text-lg mb-2">✅ Complaint Submitted!</p>
              <p className="text-sm text-gray-600">Complaint No:</p>
              <p className="text-lg font-bold text-[#1f6f43]">{result.complaint_no}</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => { setShowForm(false); setResult(null); }}>Close</Button>
            </div>
          ) : (
            <>
              {result?.error && <p className="text-red-500 text-sm mb-3">{result.error}</p>}
              <select value={form.complaint_type} onChange={(e) => setForm({ ...form, complaint_type: e.target.value })} className="w-full border rounded-md px-3 py-2 mb-3 text-sm">
                {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input placeholder="Subject / विषय" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border rounded-md px-3 py-2 mb-3 text-sm" />
              <textarea placeholder="Description / तपशील" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-md px-3 py-2 mb-3 text-sm" rows={3} />
              <Button className="bg-[#1f6f43] text-white" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Complaint / तक्रार सबमिट करा"}
              </Button>
            </>
          )}
        </div>
      )}

      {complaints.length === 0 ? (
        <p className="text-gray-500 text-sm">No complaints submitted yet.</p>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm">
              <p className="font-semibold">{c.complaint_no} <span className={`text-xs px-2 py-0.5 rounded ${statusColor(c.status)}`}>{c.status}</span></p>
              <p className="text-sm text-gray-500">{c.complaint_type} · {new Date(c.submitted_at).toLocaleDateString()}</p>
              <p className="text-sm mt-1">{c.subject}</p>
              {c.response && <p className="text-sm text-blue-600 mt-2">📩 Response: {c.response}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
