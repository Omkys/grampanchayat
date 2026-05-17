"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface Scheme {
  id: string;
  name_mr: string;
  name_en: string;
  url: string;
  is_active: boolean;
  sort_order: number;
}

const empty: Omit<Scheme, "id"> = {
  name_mr: "",
  name_en: "",
  url: "",
  is_active: true,
  sort_order: 0,
};

function schemePayload(form: Omit<Scheme, "id">) {
  return {
    name_mr: form.name_mr.trim() || null,
    name_en: form.name_en.trim() || null,
    url: form.url.trim() || null,
    is_active: form.is_active,
    sort_order: Number(form.sort_order) || 0,
  };
}

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [editing, setEditing] = useState<Scheme | null>(null);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setListError(null);
    setLoading(true);
    const { data, error } = await supabase.from("schemes").select("*").order("sort_order", { ascending: true });
    setLoading(false);
    if (error) {
      setListError(error.message);
      setSchemes([]);
      return;
    }
    setSchemes((data as Scheme[]) || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const persistViaApi = async (payload: Record<string, unknown>, targetId: string | null) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch("/api/schemes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({
        action: targetId ? "update" : "insert",
        id: targetId ?? undefined,
        payload,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return typeof body.error === "string" ? body.error : "Save failed on server.";
    }
    return null;
  };

  const save = async () => {
    setSaveError(null);
    setSaveSuccess(null);

    if (!form.name_mr.trim() && !form.name_en.trim()) {
      setSaveError("Enter a scheme name in Marathi and/or English.");
      return;
    }

    const url = form.url.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      setSaveError("URL must start with http:// or https://");
      return;
    }

    setSaving(true);
    const payload = schemePayload(form);

    try {
      const targetId = editing?.id ?? null;
      const result = targetId
        ? await supabase.from("schemes").update(payload).eq("id", targetId)
        : await supabase.from("schemes").insert(payload);

      if (result.error) {
        const rls =
          result.error.message.includes("row-level security") || result.error.code === "42501";
        if (rls) {
          const apiErr = await persistViaApi(payload, targetId);
          if (apiErr) {
            setSaveError(apiErr + " Run supabase/full-setup.sql if the homepage still shows no schemes.");
            return;
          }
        } else {
          setSaveError(result.error.message);
          return;
        }
      }

      setSaveSuccess(editing ? "Scheme updated." : "Scheme added — it will appear on the homepage when Active is checked.");
      setShowForm(false);
      setEditing(null);
      setForm(empty);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this scheme?")) return;
    const { error } = await supabase.from("schemes").delete().eq("id", id);
    if (error) {
      setListError(error.message);
      return;
    }
    if (editing?.id === id) {
      setShowForm(false);
      setEditing(null);
      setForm(empty);
    }
    await load();
  };

  const startEdit = (s: Scheme) => {
    setEditing(s);
    setForm({
      name_mr: s.name_mr || "",
      name_en: s.name_en || "",
      url: s.url || "",
      is_active: s.is_active !== false,
      sort_order: Number(s.sort_order) || 0,
    });
    setShowForm(true);
    setSaveError(null);
    setSaveSuccess(null);
  };

  const startAdd = () => {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
    setSaveError(null);
    setSaveSuccess(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f6f43]">Government Schemes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Listed on the homepage under &quot;Maharashtra Government Schemes&quot;. Keep <strong>Active</strong> checked to show them publicly.
          </p>
        </div>
        <Button size="sm" className="bg-[#1f6f43] text-white shrink-0" onClick={startAdd} disabled={saving}>
          + Add Scheme
        </Button>
      </div>

      {listError && <p className="text-sm text-red-600 mb-3">{listError}</p>}
      {saveSuccess && <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3 mb-3">{saveSuccess}</p>}

      {showForm && (
        <div className="bg-white p-5 rounded-lg shadow-sm mb-6 space-y-3 border border-gray-100">
          <input
            placeholder="Name (English)"
            value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm"
            disabled={saving}
          />
          <input
            placeholder="नाव (मराठी)"
            value={form.name_mr}
            onChange={(e) => setForm({ ...form, name_mr: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm"
            disabled={saving}
          />
          <input
            placeholder="URL (https://...)"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm"
            disabled={saving}
          />
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="number"
              placeholder="Sort order"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })}
              className="border rounded-md px-3 py-2 text-sm w-32"
              disabled={saving}
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                disabled={saving}
              />
              Active (show on website)
            </label>
          </div>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex gap-2">
            <Button size="sm" className="bg-[#1f6f43] text-white" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : editing ? "Update" : "Add"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
                setSaveError(null);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading schemes…</p>
      ) : (
        <div className="space-y-2">
          {schemes.map((s) => (
            <div key={s.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-sm">
                  {s.name_en || s.name_mr || "—"}{" "}
                  {!s.is_active && <span className="text-xs text-red-500">(hidden on website)</span>}
                </p>
                {s.name_mr && s.name_en && <p className="text-xs text-gray-500">{s.name_mr}</p>}
                {s.url && (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                    {s.url}
                  </a>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => startEdit(s)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="text-red-500" onClick={() => void remove(s.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {schemes.length === 0 && (
            <p className="text-gray-500 text-sm">No schemes yet. Click + Add Scheme — at least one name (Marathi or English) is required.</p>
          )}
        </div>
      )}
    </div>
  );
}
