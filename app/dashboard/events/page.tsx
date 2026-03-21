"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface Event { id: string; title_mr: string; title_en: string; event_date: string; description_mr: string; description_en: string; location: string; }

const empty = { title_mr: "", title_en: "", event_date: "", description_mr: "", description_en: "", location: "" };

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => { const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false }); setEvents(data || []); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title_mr.trim() || !form.event_date) return;
    if (editId) { await supabase.from("events").update(form).eq("id", editId); }
    else { await supabase.from("events").insert(form); }
    setForm(empty); setEditId(null); load();
  };

  const del = async (id: string) => { await supabase.from("events").delete().eq("id", id); load(); };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1f6f43] mb-4">Manage Events</h1>
      <div className="bg-white p-4 rounded-xl shadow mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Title (Marathi)" value={form.title_mr} onChange={(e) => setForm({ ...form, title_mr: e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <input placeholder="Title (English)" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="border rounded px-3 py-2 text-sm" />
          <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="border rounded px-3 py-2 text-sm" />
        </div>
        <textarea placeholder="Description (Marathi)" value={form.description_mr} onChange={(e) => setForm({ ...form, description_mr: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" rows={2} />
        <textarea placeholder="Description (English)" value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" rows={2} />
        <div className="flex gap-2">
          <Button className="bg-[#1f6f43] text-white" onClick={save}>{editId ? "Update" : "Add"} Event</Button>
          {editId && <Button variant="outline" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</Button>}
        </div>
      </div>
      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-start">
            <div>
              <p className="font-semibold">{e.title_mr}</p>
              <p className="text-sm text-gray-500">{e.title_en} · {e.event_date}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditId(e.id); setForm({ title_mr: e.title_mr, title_en: e.title_en, event_date: e.event_date, description_mr: e.description_mr || '', description_en: e.description_en || '', location: e.location || '' }); }}>Edit</Button>
              <Button size="sm" variant="outline" className="text-red-500" onClick={() => del(e.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
