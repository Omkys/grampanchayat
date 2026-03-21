"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface Work { id: string; title_mr: string; title_en: string; status: string; budget_inr: number; contractor: string; start_date: string; end_date: string; progress: number; }

const empty = { title_mr: "", title_en: "", status: "ongoing", budget_inr: 0, contractor: "", start_date: "", end_date: "", progress: 0 };

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => { const { data } = await supabase.from("works").select("*").order("created_at", { ascending: false }); setWorks(data || []); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title_mr.trim()) return;
    if (editId) { await supabase.from("works").update(form).eq("id", editId); }
    else { await supabase.from("works").insert(form); }
    setForm(empty); setEditId(null); load();
  };

  const del = async (id: string) => { await supabase.from("works").delete().eq("id", id); load(); };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1f6f43] mb-4">Manage Works</h1>
      <div className="bg-white p-4 rounded-xl shadow mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Title (Marathi)" value={form.title_mr} onChange={(e) => setForm({ ...form, title_mr: e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <input placeholder="Title (English)" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <input placeholder="Contractor" value={form.contractor} onChange={(e) => setForm({ ...form, contractor: e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <input type="number" placeholder="Budget (₹)" value={form.budget_inr || ""} onChange={(e) => setForm({ ...form, budget_inr: +e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <input type="number" placeholder="Progress %" value={form.progress || ""} onChange={(e) => setForm({ ...form, progress: +e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border rounded px-3 py-2 text-sm">
            <option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="planned">Planned</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button className="bg-[#1f6f43] text-white" onClick={save}>{editId ? "Update" : "Add"} Work</Button>
          {editId && <Button variant="outline" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</Button>}
        </div>
      </div>
      <div className="space-y-3">
        {works.map((w) => (
          <div key={w.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-start">
            <div>
              <p className="font-semibold">{w.title_mr}</p>
              <p className="text-sm text-gray-500">{w.status} · ₹{w.budget_inr} · {w.progress}%</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditId(w.id); setForm(w); }}>Edit</Button>
              <Button size="sm" variant="outline" className="text-red-500" onClick={() => del(w.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
