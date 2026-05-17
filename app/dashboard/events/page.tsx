"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import ImageUploadField from "@/components/ImageUploadField";
import {
  EVENTS_STORAGE_BUCKET,
  removeEventImageFromStorage,
  uploadEventImageToStorage,
} from "@/lib/events-storage";
import {
  eventLegacyPayloadForDb,
  eventPayloadForDb,
  isMissingColumnError,
  type EventDbPayload,
} from "@/lib/events-normalize";
import { validateEventForm } from "@/lib/validate-event";

interface EventRow {
  id: string;
  title_mr: string;
  title_en: string | null;
  event_date: string;
  description_mr: string | null;
  description_en: string | null;
  location: string | null;
  image_url: string | null;
  sort_order: number;
  registration_open: boolean;
  is_active: boolean;
  event_registrations?: { count: number }[];
}

interface Registration {
  id: string;
  full_name: string;
  mobile: string;
  email: string | null;
  registered_at: string;
}

const emptyForm = {
  title_mr: "",
  title_en: "",
  event_date: "",
  description_mr: "",
  description_en: "",
  location: "",
  image_url: null as string | null,
  sort_order: 0,
  registration_open: true,
  is_active: true,
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [registrationsFor, setRegistrationsFor] = useState<EventRow | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setListError(null);
    setLoading(true);

    const ordered = () =>
      supabase.from("events").select("*").order("sort_order", { ascending: true }).order("event_date", { ascending: false });

    let { data, error } = await supabase
      .from("events")
      .select("*, event_registrations(count)")
      .order("sort_order", { ascending: true })
      .order("event_date", { ascending: false });

    if (error) {
      const fallback = await ordered();
      data = fallback.data;
      error = fallback.error;
    }

    setLoading(false);
    if (error) {
      setListError(error.message);
      setEvents([]);
      return;
    }
    setEvents((data as EventRow[]) || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const registrationCount = (e: EventRow) => e.event_registrations?.[0]?.count ?? 0;

  const openRegistrations = async (event: EventRow) => {
    setRegistrationsFor(event);
    setRegistrations([]);
    setRegError(null);
    setRegLoading(true);
    const { data, error } = await supabase
      .from("event_registrations")
      .select("id, full_name, mobile, email, registered_at")
      .eq("event_id", event.id)
      .order("registered_at", { ascending: false });
    setRegLoading(false);
    if (error) {
      setRegError(error.message);
      return;
    }
    setRegistrations((data as Registration[]) || []);
  };

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

  const startEdit = (e: EventRow) => {
    setEditId(e.id);
    setForm({
      title_mr: e.title_mr || "",
      title_en: e.title_en || "",
      event_date: e.event_date || "",
      description_mr: e.description_mr || "",
      description_en: e.description_en || "",
      location: e.location || "",
      image_url: e.image_url,
      sort_order: Number(e.sort_order) || 0,
      registration_open: e.registration_open !== false,
      is_active: e.is_active !== false,
    });
    setFile(null);
    setFileError(null);
    setShowForm(true);
    setSaveError(null);
    setSaveSuccess(null);
  };

  const persistViaApi = async (payload: Record<string, unknown>, targetId: string | null) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch("/api/events", {
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

  const persistToDb = async (payload: EventDbPayload, targetId: string | null) => {
    const full = eventPayloadForDb(payload);
    const legacy = eventLegacyPayloadForDb(payload);

    let result = targetId
      ? await supabase.from("events").update(full).eq("id", targetId)
      : await supabase.from("events").insert(full).select("id").maybeSingle();

    let usedLegacy = false;
    if (
      result.error &&
      (isMissingColumnError(result.error.message, "image_url") ||
        isMissingColumnError(result.error.message, "registration_open") ||
        isMissingColumnError(result.error.message, "sort_order"))
    ) {
      usedLegacy = true;
      result = targetId
        ? await supabase.from("events").update(legacy).eq("id", targetId)
        : await supabase.from("events").insert(legacy).select("id").maybeSingle();
    }

    if (!result.error && usedLegacy && payload.image_url) {
      const rowId = targetId ?? (result.data as { id?: string } | null)?.id;
      if (rowId) {
        await supabase.from("events").update({ image_url: payload.image_url }).eq("id", rowId);
      }
    }

    if (result.error) {
      const rls =
        result.error.message.includes("row-level security") || result.error.code === "42501";
      if (rls) {
        const apiErr = await persistViaApi(full as unknown as Record<string, unknown>, targetId);
        return apiErr;
      }
      const rlsHint = rls ? " Run supabase/full-setup.sql and ensure your user is admin." : "";
      const colHint = result.error.message.includes("image_url")
        ? " Run supabase/full-setup.sql in Supabase SQL Editor."
        : "";
      return result.error.message + rlsHint + colHint;
    }

    return null;
  };

  const save = async () => {
    setSaveError(null);
    setSaveSuccess(null);

    const validationError = validateEventForm({
      title_mr: form.title_mr,
      event_date: form.event_date,
      image_url: form.image_url,
      hasPendingFile: !!file,
      isNew: !editId,
    });
    if (validationError) {
      setSaveError(validationError);
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
        const up = await uploadEventImageToStorage(supabase, file);
        if ("error" in up) {
          setSaveError(
            up.error +
              (up.error.includes("Bucket") || up.error.includes("bucket")
                ? ` Create a public Storage bucket named "${EVENTS_STORAGE_BUCKET}" and run supabase/full-setup.sql.`
                : "")
          );
          return;
        }
        imageUrl = up.publicUrl;
      }

      if (!imageUrl && !editId) {
        setSaveError("Photo upload failed — no image URL. Try again.");
        return;
      }

      const payload: EventDbPayload = {
        title_mr: form.title_mr.trim(),
        title_en: form.title_en.trim() || null,
        event_date: form.event_date,
        description_mr: form.description_mr.trim() || null,
        description_en: form.description_en.trim() || null,
        location: form.location.trim() || null,
        image_url: imageUrl,
        sort_order: Number(form.sort_order) || 0,
        registration_open: form.registration_open,
        is_active: form.is_active,
      };

      const dbError = await persistToDb(payload, editId);
      if (dbError) {
        setSaveError(dbError);
        return;
      }

      if (file && previousImageUrl && previousImageUrl !== imageUrl) {
        await removeEventImageFromStorage(supabase, previousImageUrl);
      }

      setSaveSuccess(editId ? "Event updated." : "Event added successfully.");
      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const del = async (e: EventRow) => {
    if (!confirm(`Delete event "${e.title_mr}"? All registrations will be removed.`)) return;
    await removeEventImageFromStorage(supabase, e.image_url);
    const { error } = await supabase.from("events").delete().eq("id", e.id);
    if (error) {
      setListError(error.message);
      return;
    }
    if (editId === e.id) resetForm();
    if (registrationsFor?.id === e.id) setRegistrationsFor(null);
    await load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f6f43]">Manage Events</h1>
          <p className="text-sm text-gray-600 mt-1">
            Photos → bucket <code className="rounded bg-gray-100 px-1">{EVENTS_STORAGE_BUCKET}</code>. Click an event
            name to view registrations.
          </p>
        </div>
        <Button size="sm" className="bg-[#1f6f43] text-white shrink-0" onClick={startAdd} disabled={saving}>
          + Add event
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
            <input
              type="date"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
              required
            />
            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            />
            <input
              type="number"
              placeholder="Display order"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: +e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            />
            <label className="flex items-center gap-2 text-sm border rounded-md px-3 py-2">
              <input
                type="checkbox"
                checked={form.registration_open}
                onChange={(e) => setForm({ ...form, registration_open: e.target.checked })}
                disabled={saving}
              />
              Registration open
            </label>
            <label className="flex items-center gap-2 text-sm border rounded-md px-3 py-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                disabled={saving}
              />
              Show on homepage
            </label>
          </div>
          <textarea
            placeholder="Description (Marathi)"
            value={form.description_mr}
            onChange={(e) => setForm({ ...form, description_mr: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm min-h-[72px]"
            disabled={saving}
          />
          <textarea
            placeholder="Description (English)"
            value={form.description_en}
            onChange={(e) => setForm({ ...form, description_en: e.target.value })}
            className="w-full border rounded-md px-3 py-2 text-sm min-h-[72px]"
            disabled={saving}
          />
          <ImageUploadField
            label="Event photo *"
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
          {saveSuccess && <p className="text-sm text-green-700">{saveSuccess}</p>}
          <div className="flex gap-2 flex-wrap">
            <Button className="bg-[#1f6f43] text-white" size="sm" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : editId ? "Update event" : "Add event"}
            </Button>
            <Button size="sm" variant="outline" onClick={resetForm} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {listError && <p className="text-sm text-red-600 mb-3">{listError}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading events…</p>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-600 mb-3">No events yet.</p>
          <Button size="sm" className="bg-[#1f6f43] text-white" onClick={startAdd}>
            Add your first event
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div
              key={e.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between"
            >
              <div className="flex gap-3 min-w-0">
                {e.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.image_url}
                    alt={e.title_mr}
                    className="h-20 w-28 rounded-lg object-cover shrink-0 border border-gray-200"
                  />
                ) : (
                  <div className="h-20 w-28 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center text-xs text-gray-400">
                    No photo
                  </div>
                )}
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => void openRegistrations(e)}
                    className="font-semibold text-left text-[#1f6f43] hover:underline truncate block max-w-full"
                  >
                    {e.title_mr}
                  </button>
                  {e.title_en && <p className="text-sm text-gray-500 truncate">{e.title_en}</p>}
                  <p className="text-sm text-gray-500 mt-1">
                    {e.event_date}
                    {e.location ? ` · ${e.location}` : ""}
                    {!e.is_active && <span className="text-red-500 ml-1">(hidden)</span>}
                    {!e.registration_open && <span className="text-amber-600 ml-1">(reg. closed)</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {registrationCount(e)} registered — click title to view list
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => startEdit(e)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="text-red-600" onClick={() => void del(e)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {registrationsFor && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setRegistrationsFor(null)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-start gap-2">
              <div>
                <h2 className="text-lg font-semibold text-[#1f6f43]">Registrations</h2>
                <p className="text-sm text-gray-600">{registrationsFor.title_mr}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setRegistrationsFor(null)}>
                Close
              </Button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {regLoading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : regError ? (
                <p className="text-sm text-red-600">{regError}</p>
              ) : registrations.length === 0 ? (
                <p className="text-sm text-gray-500">No registrations yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="pb-2 pr-2">Name</th>
                      <th className="pb-2 pr-2">Mobile</th>
                      <th className="pb-2">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="py-2 pr-2">{r.full_name}</td>
                        <td className="py-2 pr-2 whitespace-nowrap">{r.mobile}</td>
                        <td className="py-2 text-xs text-gray-500">
                          {new Date(r.registered_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
