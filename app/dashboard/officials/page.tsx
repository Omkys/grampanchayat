"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import ImageUploadField from "@/components/ImageUploadField";
import StorageAvatar from "@/components/StorageAvatar";
import {
  OFFICIALS_STORAGE_BUCKET,
  removeOfficialPhotoFromStorage,
  uploadOfficialPhotoToStorage,
} from "@/lib/officials-storage";
import OfficialTypeSelect from "@/components/OfficialTypeSelect";

interface Official {
  id: string;
  name_mr: string;
  name_en: string;
  designation_mr: string;
  designation_en: string;
  category: string;
  sort_order: number;
  photo_url?: string | null;
  is_active?: boolean;
}

const empty: Omit<Official, "id"> = {
  name_mr: "",
  name_en: "",
  designation_mr: "",
  designation_en: "",
  category: "staff",
  sort_order: 0,
  photo_url: null,
};

export default function OfficialsPage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setListError(null);
    setLoading(true);
    const { data, error } = await supabase.from("officials").select("*").order("sort_order");
    setLoading(false);
    if (error) {
      setListError(error.message);
      setOfficials([]);
      return;
    }
    setOfficials((data as Official[]) || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setForm(empty);
    setEditId(null);
    setFile(null);
    setFileError(null);
    setSaveError(null);
  };

  const save = async () => {
    setSaveError(null);
    if (!form.name_mr.trim() || !form.designation_mr.trim() || !form.designation_en.trim()) {
      setSaveError("Name, designation (MR/EN), and official type are required.");
      return;
    }
    if (!form.category) {
      setSaveError("Please select an official type from the dropdown.");
      return;
    }
    if (!editId && !file && !form.photo_url) {
      setSaveError("Please choose a profile photo for a new official.");
      return;
    }
    if (file && fileError) {
      setSaveError(fileError);
      return;
    }

    setSaving(true);
    const previousPhotoUrl = editId ? form.photo_url : null;

    try {
      let photoUrl = form.photo_url ?? null;

      if (file) {
        const up = await uploadOfficialPhotoToStorage(supabase, file);
        if ("error" in up) {
          setSaveError(up.error);
          return;
        }
        photoUrl = up.publicUrl;
      }

      const payload = {
        name_mr: form.name_mr.trim(),
        name_en: form.name_en.trim(),
        designation_mr: form.designation_mr.trim(),
        designation_en: form.designation_en.trim(),
        category: form.category,
        sort_order: Number(form.sort_order) || 0,
        photo_url: photoUrl,
      };

      const { error } = editId
        ? await supabase.from("officials").update(payload).eq("id", editId)
        : await supabase.from("officials").insert(payload);

      if (error) {
        const rlsHint =
          error.message.includes("row-level security") || error.code === "42501"
            ? " Run supabase/full-setup.sql in Supabase and ensure your user has role admin or official in the profiles table."
            : "";
        setSaveError(error.message + rlsHint);
        return;
      }

      if (file && previousPhotoUrl && previousPhotoUrl !== photoUrl) {
        await removeOfficialPhotoFromStorage(supabase, previousPhotoUrl);
      }

      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const del = async (row: Official) => {
    if (!confirm(`Delete ${row.name_mr || row.name_en}?`)) return;
    setDeletingId(row.id);
    try {
      await removeOfficialPhotoFromStorage(supabase, row.photo_url);
      const { error } = await supabase.from("officials").delete().eq("id", row.id);
      if (error) {
        setListError(error.message);
        return;
      }
      if (editId === row.id) resetForm();
      await load();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1f6f43] mb-2">Manage Officials</h1>
      <p className="text-sm text-gray-600 mb-4">
        Photos upload to bucket <code className="rounded bg-gray-100 px-1">{OFFICIALS_STORAGE_BUCKET}</code>; the
        homepage officials section reads from the <code className="rounded bg-gray-100 px-1">officials</code> table.
      </p>

      <div className="bg-white p-4 rounded-xl shadow mb-6 space-y-3 border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            placeholder="Name (Marathi)"
            value={form.name_mr}
            onChange={(e) => setForm({ ...form, name_mr: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
            disabled={saving}
          />
          <input
            placeholder="Name (English)"
            value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
            disabled={saving}
          />
          <OfficialTypeSelect
            category={form.category}
            designationMr={form.designation_mr}
            designationEn={form.designation_en}
            disabled={saving}
            onChange={({ category, designationMr, designationEn, sortOrder }) =>
              setForm({
                ...form,
                category,
                designation_mr: designationMr,
                designation_en: designationEn,
                sort_order: sortOrder,
              })
            }
          />
          <input
            type="number"
            placeholder="Sort order"
            value={form.sort_order || ""}
            onChange={(e) => setForm({ ...form, sort_order: +e.target.value })}
            className="border rounded px-3 py-2 text-sm"
            disabled={saving}
          />
          <div className="sm:col-span-2">
            <ImageUploadField
              label="Official photo"
              currentUrl={form.photo_url}
              file={file}
              fileError={fileError}
              disabled={saving}
              onFileChange={(f, err) => {
                setFile(f);
                setFileError(err);
              }}
            />
          </div>
        </div>
        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
        <div className="flex gap-2 flex-wrap">
          <Button className="bg-[#1f6f43] text-white" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : editId ? "Update official" : "Add official"}
          </Button>
          {editId && (
            <Button variant="outline" onClick={resetForm} disabled={saving}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {listError && <p className="text-sm text-red-600 mb-3">{listError}</p>}
      {loading ? (
        <p className="text-sm text-gray-500">Loading officials…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Photo</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Name (MR)</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Designation</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Category</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Sort</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {officials.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-2">
                    <StorageAvatar src={o.photo_url} alt={o.name_mr || o.name_en} size={40} />
                  </td>
                  <td className="px-4 py-2">{o.name_mr}</td>
                  <td className="px-4 py-2 text-gray-600">{o.designation_mr}</td>
                  <td className="px-4 py-2 text-gray-600">{o.category}</td>
                  <td className="px-4 py-2 text-gray-600">{o.sort_order}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingId === o.id}
                        onClick={() => {
                          setEditId(o.id);
                          setForm({
                            name_mr: o.name_mr,
                            name_en: o.name_en,
                            designation_mr: o.designation_mr,
                            designation_en: o.designation_en,
                            category: o.category,
                            sort_order: o.sort_order,
                            photo_url: o.photo_url ?? null,
                          });
                          setFile(null);
                          setFileError(null);
                          setSaveError(null);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        disabled={deletingId === o.id}
                        onClick={() => void del(o)}
                      >
                        {deletingId === o.id ? "…" : "Delete"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {officials.length === 0 && (
            <p className="p-4 text-sm text-gray-500 text-center">No officials yet. Add one above.</p>
          )}
        </div>
      )}
    </div>
  );
}
