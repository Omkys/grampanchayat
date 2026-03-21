"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const settingKeys = [
  { key: "gp_name_mr", label: "GP Name (Marathi)" },
  { key: "gp_name_en", label: "GP Name (English)" },
  { key: "gp_mobile", label: "Mobile" },
  { key: "gp_email", label: "Email" },
  { key: "population", label: "Population" },
  { key: "total_works", label: "Total Works" },
  { key: "total_schemes", label: "Total Schemes" },
  { key: "total_facilities", label: "Total Facilities" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("settings").select("*");
      const s: Record<string, string> = {};
      data?.forEach((r) => { s[r.key] = r.value; });
      setSettings(s);
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true); setMsg("");
    for (const { key } of settingKeys) {
      if (settings[key] !== undefined) {
        await supabase.from("settings").upsert({ key, value: settings[key], updated_at: new Date().toISOString() });
      }
    }
    setSaving(false); setMsg("Settings saved!");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1f6f43] mb-4">Settings</h1>
      <div className="bg-white p-6 rounded-xl shadow space-y-4 max-w-lg">
        {settingKeys.map((s) => (
          <div key={s.key}>
            <label className="text-sm font-medium text-gray-700">{s.label}</label>
            <input value={settings[s.key] || ""} onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mt-1" />
          </div>
        ))}
        {msg && <p className="text-green-600 text-sm">{msg}</p>}
        <Button className="bg-[#1f6f43] text-white" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
      </div>
    </div>
  );
}
