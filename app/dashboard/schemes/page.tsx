"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface Scheme { id: string; name_mr: string; name_en: string; url: string; is_active: boolean; sort_order: number; }

const empty: Omit<Scheme, "id"> = { name_mr: "", name_en: "", url: "", is_active: true, sort_order: 0 };

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [editing, setEditing] = useState<Scheme | null>(null);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("schemes").select("*").order("sort_order", { ascending: true });
    setSchemes(data || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name_en.trim()) return;
    if (editing) {
      await supabase.from("schemes").update(form).eq("id", editing.id);
    } else {
      await supabase.from("schemes").insert(form);
    }
    setShowForm(false); setEditing(null); setForm(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this scheme?")) return;
    await supabase.from("schemes").delete().eq("id", id);
    load();
  };

  const startEdit = (s: Scheme) => {
    setEditing(s);
    setForm({ name_mr: s.name_mr, name_en: s.name_en, url: s.url, is_active: s.is_active, sort_order: s.sort_order });
    setShowForm(true);
  };

  const startAdd = () => { setEditing(null); setForm(empty); setShowForm(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#1f6f43]">Government Schemes</h1>
        <Button size="sm" className="bg-[#1f6f43] text-white" onClick={startAdd}>+ Add Scheme</Button>
      </div>

      {showForm && (
        <div className="bg-white p-5 rounded-lg shadow-sm mb-6 space-y-3">
          <input placeholder="Name (English)" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
          <input placeholder="नाव (मराठी)" value={form.name_mr} onChange={(e) => setForm({ ...form, name_mr: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
          <input placeholder="URL (https://...)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm" />
          <div className="flex gap-4 items-center">
            <input type="number" placeholder="Sort Order" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="border rounded-md px-3 py-2 text-sm w-32" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active
            </label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-[#1f6f43] text-white" onClick={save}>{editing ? "Update" : "Add"}</Button>
            <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {schemes.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{s.name_en} {!s.is_active && <span className="text-xs text-red-500">(inactive)</span>}</p>
              {s.name_mr && <p className="text-xs text-gray-500">{s.name_mr}</p>}
              {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">{s.url}</a>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(s)}>Edit</Button>
              <Button size="sm" variant="outline" className="text-red-500" onClick={() => remove(s.id)}>Delete</Button>
            </div>
          </div>
        ))}
        {schemes.length === 0 && <p className="text-gray-500 text-sm">No schemes added yet.</p>}
      </div>
    </div>
  );
}
