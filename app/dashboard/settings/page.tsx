"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const settingKeys = [
  { key: "gp_name_mr", label: "GP Name (Marathi)", multiline: false },
  { key: "gp_name_en", label: "GP Name (English)", multiline: false },
  { key: "gp_mobile", label: "Mobile", multiline: false },
  { key: "gp_email", label: "Email", multiline: false },
  { key: "population", label: "Population (hero counter)", multiline: false },
  { key: "total_works", label: "Total Works (hero counter)", multiline: false },
  { key: "total_schemes", label: "Total Schemes (hero counter)", multiline: false },
  { key: "total_facilities", label: "Total Facilities (hero counter)", multiline: false },
  { key: "about_mr", label: "About paragraph (Marathi)", multiline: true },
  { key: "about_en", label: "About paragraph (English)", multiline: true },
  { key: "gp_officer_mr", label: "GP Officer name (Marathi)", multiline: false },
  { key: "gp_officer_en", label: "GP Officer name (English)", multiline: false },
  { key: "gp_admin_mr", label: "Administrator / Sarpanch (Marathi)", multiline: false },
  { key: "gp_admin_en", label: "Administrator / Sarpanch (English)", multiline: false },
] as const;

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
      const v = settings[key];
      if (v !== undefined) {
        await supabase.from("settings").upsert({ key, value: v, updated_at: new Date().toISOString() });
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
            {s.multiline ? (
              <textarea value={settings[s.key] || ""} onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mt-1" rows={3} />
            ) : (
              <input value={settings[s.key] || ""} onChange={(e) => setSettings({ ...settings, [s.key]: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mt-1" />
            )}
          </div>
        ))}
        {msg && <p className="text-green-600 text-sm">{msg}</p>}
        <Button className="bg-[#1f6f43] text-white" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Button>
      </div>
    </div>
  );
}
