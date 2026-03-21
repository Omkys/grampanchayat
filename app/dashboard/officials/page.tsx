"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface Official { id: string; name_mr: string; name_en: string; designation_mr: string; designation_en: string; category: string; sort_order: number; }

const empty = { name_mr: "", name_en: "", designation_mr: "", designation_en: "", category: "staff", sort_order: 0 };

export default function OfficialsPage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => { const { data } = await supabase.from("officials").select("*").order("sort_order"); setOfficials(data || []); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name_mr.trim() || !form.designation_mr.trim()) return;
    if (editId) { await supabase.from("officials").update(form).eq("id", editId); }
    else { await supabase.from("officials").insert(form); }
    setForm(empty); setEditId(null); load();
  };

  const del = async (id: string) => { await supabase.from("officials").delete().eq("id", id); load(); };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1f6f43] mb-4">Manage Officials</h1>
      <div className="bg-white p-4 rounded-xl shadow mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Name (Marathi)" value={form.name_mr} onChange={(e) => setForm({ ...form, name_mr: e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <input placeholder="Name (English)" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <input placeholder="Designation (Marathi)" value={form.designation_mr} onChange={(e) => setForm({ ...form, designation_mr: e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <input placeholder="Designation (English)" value={form.designation_en} onChange={(e) => setForm({ ...form, designation_en: e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border rounded px-3 py-2 text-sm">
            <option value="sarpanch">Sarpanch</option><option value="d_sarpanch">D Sarpanch</option><option value="sadasya">Sadasya</option><option value="staff">Staff</option>
          </select>
          <input type="number" placeholder="Sort Order" value={form.sort_order || ""} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} className="border rounded px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-2">
          <Button className="bg-[#1f6f43] text-white" onClick={save}>{editId ? "Update" : "Add"} Official</Button>
          {editId && <Button variant="outline" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</Button>}
        </div>
      </div>
      <div className="space-y-3">
        {officials.map((o) => (
          <div key={o.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-start">
            <div>
              <p className="font-semibold">{o.name_mr}</p>
              <p className="text-sm text-gray-500">{o.designation_mr} · {o.category}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditId(o.id); setForm(o); }}>Edit</Button>
              <Button size="sm" variant="outline" className="text-red-500" onClick={() => del(o.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
