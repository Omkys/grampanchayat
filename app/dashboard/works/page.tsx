"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import ImageUploadField from "@/components/ImageUploadField";
import {
  WORKS_STORAGE_BUCKET,
  removeWorkImageFromStorage,
  uploadWorkImageToStorage,
} from "@/lib/works-storage";

interface Work {
  id: string;
  title_mr: string;
  title_en: string;
  description_mr: string | null;
  description_en: string | null;
  image_url: string | null;
  status: string;
  budget_inr: number;
  contractor: string;
  start_date: string;
  end_date: string;
  progress: number;
  sort_order: number;
  is_active: boolean;
}

const emptyForm = {
  title_mr: "",
  title_en: "",
  description_mr: "",
  description_en: "",
  image_url: null as string | null,
  status: "ongoing",
  budget_inr: 0,
  contractor: "",
  start_date: "",
  end_date: "",
  progress: 0,
  sort_order: 0,
  is_active: true,
};

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setListError(null);
    setLoading(true);
    const { data, error } = await supabase
      .from("works")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      setListError(error.message);
      setWorks([]);
      return;
    }
    setWorks((data as Work[]) || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
    setFile(null);
    setFileError(null);
    setSaveError(null);
  };

  const startAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
    setSaveError(null);
  };

  const startEdit = (w: Work) => {
    setEditId(w.id);
    setForm({
      title_mr: w.title_mr || "",
      title_en: w.title_en || "",
      description_mr: w.description_mr || "",
      description_en: w.description_en || "",
      image_url: w.image_url,
      status: w.status || "ongoing",
      budget_inr: Number(w.budget_inr) || 0,
      contractor: w.contractor || "",
      start_date: w.start_date || "",
      end_date: w.end_date || "",
      progress: Number(w.progress) || 0,
      sort_order: Number(w.sort_order) || 0,
      is_active: w.is_active !== false,
    });
    setFile(null);
    setFileError(null);
    setShowForm(true);
    setSaveError(null);
  };

  const save = async () => {
    setSaveError(null);
    if (!form.title_mr.trim()) {
      setSaveError("Marathi title is required.");
      return;
    }
    if (!editId && !file && !form.image_url) {
      setSaveError("Please upload a work photo.");
      return;
    }
    if (file && fileError) {
      setSaveError(fileError);
      return;
    }

    setSaving(true);
    const previousImageUrl = editId ? form.image_url : null;

    try {
      let imageUrl = form.image_url;

      if (file) {
        const up = await uploadWorkImageToStorage(supabase, file);
        if ("error" in up) {
          setSaveError(up.error);
          return;
        }
        imageUrl = up.publicUrl;
      }

      const payload = {
        title_mr: form.title_mr.trim(),
        title_en: form.title_en.trim() || null,
        description_mr: form.description_mr.trim() || null,
        description_en: form.description_en.trim() || null,
        image_url: imageUrl,
        status: form.status,
        budget_inr: Number(form.budget_inr) || 0,
        contractor: form.contractor.trim() || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        progress: Math.min(100, Math.max(0, Number(form.progress) || 0)),
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };

      const { error } = editId
        ? await supabase.from("works").update(payload).eq("id", editId)
        : await supabase.from("works").insert(payload);

      if (error) {
        const rlsHint =
          error.message.includes("row-level security") || error.code === "42501"
            ? " Run supabase/works-images-setup.sql and set your user role to admin."
            : "";
        const colHint = error.message.includes("image_url")
          ? " Run supabase/works-images-setup.sql to add image_url column."
          : "";
        setSaveError(error.message + rlsHint + colHint);
        return;
      }

      if (file && previousImageUrl && previousImageUrl !== imageUrl) {
        await removeWorkImageFromStorage(supabase, previousImageUrl);
      }

      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const del = async (w: Work) => {
    if (!confirm(`Delete work "${w.title_mr}"?`)) return;
    await removeWorkImageFromStorage(supabase, w.image_url);
    const { error } = await supabase.from("works").delete().eq("id", w.id);
    if (error) {
      setListError(error.message);
      return;
    }
    if (editId === w.id) resetForm();
    await load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f6f43]">Manage Works</h1>
          <p className="text-sm text-gray-600 mt-1">
            Photos upload to bucket <code className="rounded bg-gray-100 px-1">{WORKS_STORAGE_BUCKET}</code>; active
            works appear on the home page carousel.
          </p>
        </div>
        <Button size="sm" className="bg-[#1f6f43] text-white shrink-0" onClick={startAdd} disabled={saving}>
          + Add work
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Title (Marathi) *"
              value={form.title_mr}
              onChange={(e) => setForm({ ...form, title_mr: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            />
            <input
              placeholder="Title (English)"
              value={form.title_en}
              onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            />
            <textarea
              placeholder="Description (Marathi)"
              value={form.description_mr}
              onChange={(e) => setForm({ ...form, description_mr: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm sm:col-span-2 min-h-[72px]"
              disabled={saving}
            />
            <textarea
              placeholder="Description (English)"
              value={form.description_en}
              onChange={(e) => setForm({ ...form, description_en: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm sm:col-span-2 min-h-[72px]"
              disabled={saving}
            />
            <input
              placeholder="Contractor"
              value={form.contractor}
              onChange={(e) => setForm({ ...form, contractor: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            />
            <input
              type="number"
              min={0}
              placeholder="Budget (₹)"
              value={form.budget_inr || ""}
              onChange={(e) => setForm({ ...form, budget_inr: +e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            />
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            />
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            />
            <input
              type="number"
              min={0}
              max={100}
              placeholder="Progress %"
              value={form.progress || ""}
              onChange={(e) => setForm({ ...form, progress: +e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="planned">Planned</option>
            </select>
            <input
              type="number"
              placeholder="Display order (lower = first)"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: +e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            />
            <label className="flex items-center gap-2 text-sm border rounded-md px-3 py-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                disabled={saving}
              />
              Show on homepage
            </label>
          </div>
          <ImageUploadField
            label="Work photo *"
            currentUrl={form.image_url}
            file={file}
            fileError={fileError}
            disabled={saving}
            previewClassName="h-32 w-full max-w-sm rounded-lg object-cover border-2 border-[#1f6f43]/50"
            onFileChange={(f, err) => {
              setFile(f);
              setFileError(err);
            }}
          />
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex gap-2 flex-wrap">
            <Button className="bg-[#1f6f43] text-white" size="sm" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : editId ? "Update work" : "Add work"}
            </Button>
            <Button size="sm" variant="outline" onClick={resetForm} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {listError && <p className="text-sm text-red-600 mb-3">{listError}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading works…</p>
      ) : works.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-600 mb-3">No works yet.</p>
          <Button size="sm" className="bg-[#1f6f43] text-white" onClick={startAdd}>
            Add your first work
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {works.map((w) => (
            <div
              key={w.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between"
            >
              <div className="flex gap-3 min-w-0">
                {w.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={w.image_url}
                    alt={w.title_mr}
                    className="h-20 w-28 rounded-lg object-cover shrink-0 border border-gray-200"
                  />
                ) : (
                  <div className="h-20 w-28 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-xs text-gray-400">
                    No photo
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold truncate">{w.title_mr}</p>
                  {w.title_en && <p className="text-sm text-gray-500 truncate">{w.title_en}</p>}
                  <p className="text-sm text-gray-500 mt-1">
                    {w.status} · ₹{Number(w.budget_inr).toLocaleString("en-IN")} · {w.progress}%
                    {!w.is_active && <span className="text-red-500 ml-1">(hidden)</span>}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => startEdit(w)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="text-red-600" onClick={() => void del(w)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
