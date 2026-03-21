"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface Notice { id: string; title_mr: string; title_en: string; body_mr: string; body_en: string; category: string; published_at: string; is_active: boolean; }

const empty = { title_mr: "", title_en: "", body_mr: "", body_en: "", category: "general" };

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const { data } = await supabase.from("notices").select("*").order("published_at", { ascending: false });
    setNotices(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setMsg("");
    if (!form.title_mr.trim()) { setMsg("Marathi title required"); return; }
    if (editId) {
      await supabase.from("notices").update(form).eq("id", editId);
    } else {
      await supabase.from("notices").insert({ ...form, published_at: new Date().toISOString().split("T")[0] });
    }
    setForm(empty); setEditId(null); load();
  };

  const del = async (id: string) => {
    await supabase.from("notices").delete().eq("id", id);
    load();
  };

  const edit = (n: Notice) => {
    setEditId(n.id);
    setForm({ title_mr: n.title_mr, title_en: n.title_en || "", body_mr: n.body_mr || "", body_en: n.body_en || "", category: n.category });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1f6f43] mb-4">Manage Notices</h1>
      <div className="bg-white p-4 rounded-xl shadow mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Title (Marathi)" value={form.title_mr} onChange={(e) => setForm({ ...form, title_mr: e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <input placeholder="Title (English)" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} className="border rounded px-3 py-2 text-sm" />
        </div>
        <textarea placeholder="Body (Marathi)" value={form.body_mr} onChange={(e) => setForm({ ...form, body_mr: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" rows={2} />
        <textarea placeholder="Body (English)" value={form.body_en} onChange={(e) => setForm({ ...form, body_en: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" rows={2} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border rounded px-3 py-2 text-sm">
          <option value="general">General</option><option value="gramsabha">Gramsabha</option><option value="pani">Water</option><option value="swachha">Cleanliness</option>
        </select>
        {msg && <p className="text-red-500 text-sm">{msg}</p>}
        <div className="flex gap-2">
          <Button className="bg-[#1f6f43] text-white" onClick={save}>{editId ? "Update" : "Add"} Notice</Button>
          {editId && <Button variant="outline" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</Button>}
        </div>
      </div>
      <div className="space-y-3">
        {notices.map((n) => (
          <div key={n.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-start">
            <div>
              <p className="font-semibold">{n.title_mr}</p>
              <p className="text-sm text-gray-500">{n.title_en} · {n.published_at} · {n.category}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => edit(n)}>Edit</Button>
              <Button size="sm" variant="outline" className="text-red-500" onClick={() => del(n.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
