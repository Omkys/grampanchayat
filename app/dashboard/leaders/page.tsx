"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import ImageUploadField from "@/components/ImageUploadField";
import StorageAvatar from "@/components/StorageAvatar";
import {
  LEADERS_STORAGE_BUCKET,
  type LeaderFormPayload,
  type LeaderRow,
  removeLeaderImageFromStorage,
  uploadLeaderImageToStorage,
} from "@/lib/leaders";
import {
  isMissingColumnError,
  leaderLegacyPayloadForDb,
  leaderPayloadForDb,
  normalizeLeaderRow,
  type LeaderRowDb,
} from "@/lib/leaders-normalize";
import PositionSelect from "@/components/PositionSelect";
import type { PositionOption } from "@/lib/position-options";

const emptyForm: LeaderFormPayload & { image_url: string | null } = {
  name: "",
  designation: "",
  image_url: null,
  display_order: 0,
  is_active: true,
};

export default function LeadersAdminPage() {
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [positionOptions, setPositionOptions] = useState<PositionOption[]>([]);

  const load = useCallback(async () => {
    setListError(null);
    setLoading(true);
    const { data, error } = await supabase.from("leaders").select("*");
    setLoading(false);
    if (error) {
      setListError(error.message);
      setRows([]);
      return;
    }
    const rows = ((data as LeaderRowDb[]) ?? []).map(normalizeLeaderRow);
    rows.sort((a, b) => a.display_order - b.display_order);
    setRows(rows);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    fetch("/api/positions")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.leaders?.all) setPositionOptions(data.leaders.all);
      })
      .catch(() => {});
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setFile(null);
    setFileError(null);
    setSaveError(null);
  };

  const save = async () => {
    setSaveError(null);
    if (!form.name.trim() || !form.designation.trim()) {
      setSaveError("Name and designation are required.");
      return;
    }
    if (!editId && !file && !form.image_url) {
      setSaveError("Please choose a profile image for a new leader.");
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
        const up = await uploadLeaderImageToStorage(supabase, file);
        if ("error" in up) {
          setSaveError(up.error);
          return;
        }
        imageUrl = up.publicUrl;
      }

      const legacy = leaderLegacyPayloadForDb({
        name: form.name,
        designation: form.designation,
        image_url: imageUrl || null,
      });
      const full = leaderPayloadForDb({
        name: form.name,
        designation: form.designation,
        image_url: imageUrl || null,
        display_order: Number(form.display_order) || 0,
        is_active: form.is_active,
      });

      // Try legacy columns first (role_en / role_mr) — common when name/designation columns not migrated yet.
      let savedId = editId;
      let result = editId
        ? await supabase.from("leaders").update(legacy).eq("id", editId).select("id").maybeSingle()
        : await supabase.from("leaders").insert(legacy).select("id").maybeSingle();
      let error = result.error;

      if (
        error &&
        !isMissingColumnError(error.message, "role_en") &&
        !isMissingColumnError(error.message, "role_mr")
      ) {
        result = editId
          ? await supabase.from("leaders").update(full).eq("id", editId).select("id").maybeSingle()
          : await supabase.from("leaders").insert(full).select("id").maybeSingle();
        error = result.error;
      }

      if (
        error &&
        (isMissingColumnError(error.message, "name") || isMissingColumnError(error.message, "designation"))
      ) {
        result = editId
          ? await supabase.from("leaders").update(legacy).eq("id", editId).select("id").maybeSingle()
          : await supabase.from("leaders").insert(legacy).select("id").maybeSingle();
        error = result.error;
      }

      if (!error && result.data?.id) savedId = result.data.id;

      // Apply is_active / display_order / name columns when they exist (legacy insert skips them).
      if (!error && savedId) {
        const { error: patchError } = await supabase
          .from("leaders")
          .update({
            name: form.name.trim(),
            designation: form.designation.trim(),
            image_url: imageUrl || null,
            display_order: Number(form.display_order) || 0,
            is_active: form.is_active,
          })
          .eq("id", savedId);
        if (
          patchError &&
          !isMissingColumnError(patchError.message, "name") &&
          !isMissingColumnError(patchError.message, "is_active")
        ) {
          error = patchError;
        }
      }

      if (error) {
        const rlsHint =
          error.message.includes("row-level security") || error.code === "42501"
            ? " Run supabase/full-setup.sql in Supabase and ensure your user has role admin or official in profiles."
            : "";
        const schemaHint = isMissingColumnError(error.message, "name")
          ? " Run supabase/leaders-add-name-columns.sql in Supabase SQL Editor."
          : "";
        setSaveError(error.message + rlsHint + schemaHint);
        return;
      }

      if (file && previousImageUrl && previousImageUrl !== imageUrl) {
        await removeLeaderImageFromStorage(supabase, previousImageUrl);
      }

      if (!imageUrl) {
        setSaveError("Photo uploaded but URL missing — please try saving again.");
        return;
      }

      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const del = async (row: LeaderRow) => {
    if (!confirm(`Delete "${row.name}"?`)) return;
    setDeletingId(row.id);
    try {
      await removeLeaderImageFromStorage(supabase, row.image_url);
      const { error } = await supabase.from("leaders").delete().eq("id", row.id);
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
      <h1 className="text-2xl font-bold text-[#1f6f43] mb-2">Manage Leaders</h1>
      <p className="text-sm text-gray-600 mb-4">
        Images upload to bucket <code className="rounded bg-gray-100 px-1">{LEADERS_STORAGE_BUCKET}</code>; the home
        page loads active leaders via <code className="rounded bg-gray-100 px-1">/api/leaders</code>.
      </p>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-[#1f6f43]"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            disabled={saving}
          />
          <span>
            <span className="block text-sm font-semibold text-[#1f6f43]">Show on public homepage</span>
            <span className="block text-xs text-gray-600 mt-0.5">
              When checked, this leader appears in the leadership strip on the home page. Checked by default — no need
              to edit Supabase manually.
            </span>
          </span>
        </label>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-6 space-y-3 border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded px-3 py-2 text-sm"
            disabled={saving}
          />
          <PositionSelect
            label="Leader type / designation"
            value={form.designation}
            options={positionOptions}
            disabled={saving}
            required
            onChange={(designation, option) =>
              setForm({
                ...form,
                designation,
                display_order: option?.displayOrder ?? form.display_order,
              })
            }
          />
          <input
            type="number"
            placeholder="Display order"
            value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: +e.target.value })}
            className="border rounded px-3 py-2 text-sm"
            disabled={saving}
          />
          <div className="sm:col-span-2">
            <ImageUploadField
              label="Leader photo"
              currentUrl={form.image_url}
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
            {saving ? "Saving…" : editId ? "Update leader" : "Add leader"}
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
        <p className="text-sm text-gray-500">Loading leaders…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto border border-gray-100">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Photo</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Designation</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Order</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">On homepage</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-2">
                    <StorageAvatar src={o.image_url} alt={o.name} size={40} />
                  </td>
                  <td className="px-4 py-2">{o.name}</td>
                  <td className="px-4 py-2 text-gray-600">{o.designation}</td>
                  <td className="px-4 py-2 text-gray-600">{o.display_order}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        o.is_active
                          ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                          : "inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                      }
                    >
                      {o.is_active ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingId === o.id}
                        onClick={() => {
                          setEditId(o.id);
                          setForm({
                            name: o.name,
                            designation: o.designation,
                            image_url: o.image_url,
                            display_order: o.display_order,
                            is_active: o.is_active,
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
          {rows.length === 0 && (
            <p className="p-4 text-sm text-gray-500 text-center">No leaders yet. Add one above.</p>
          )}
        </div>
      )}
    </div>
  );
}
