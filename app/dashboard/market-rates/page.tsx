"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface Rate {
  id: string;
  crop_mr: string;
  crop_en: string;
  price_inr: number;
  unit: string;
}

const emptyForm = {
  crop_mr: "",
  crop_en: "",
  price_inr: 0,
  unit: "quintal",
};

export default function MarketRatesPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setListError(null);
    setLoading(true);
    const { data, error } = await supabase.from("market_rates").select("*").order("crop_en");
    setLoading(false);
    if (error) {
      setListError(error.message);
      setRates([]);
      return;
    }
    setRates(
      ((data as Rate[]) ?? []).map((r) => ({
        ...r,
        price_inr: Number(r.price_inr) || 0,
        unit: r.unit || "quintal",
      }))
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      const role = profile?.role ?? "unknown";
      if (role !== "admin" && role !== "official") {
        setListError(
          `Your account role is "${role}". Dashboard edits need admin or official. In Supabase SQL Editor run supabase/full-setup.sql and set your email to admin (section 8).`
        );
      }
    })();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
    setSaveError(null);
  };

  const startAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
    setSaveError(null);
  };

  const startEdit = (r: Rate) => {
    setEditId(r.id);
    setForm({
      crop_mr: r.crop_mr || "",
      crop_en: r.crop_en || "",
      price_inr: Number(r.price_inr) || 0,
      unit: r.unit || "quintal",
    });
    setShowForm(true);
    setSaveError(null);
  };

  const save = async () => {
    setSaveError(null);
    if (!form.crop_mr.trim() || !form.crop_en.trim()) {
      setSaveError("Crop name in Marathi and English are required.");
      return;
    }
    if (form.price_inr < 0) {
      setSaveError("Price cannot be negative.");
      return;
    }

    setSaving(true);
    const payload = {
      crop_mr: form.crop_mr.trim(),
      crop_en: form.crop_en.trim(),
      price_inr: Number(form.price_inr) || 0,
      unit: form.unit.trim() || "quintal",
      updated_at: new Date().toISOString(),
    };

    const { error } = editId
      ? await supabase.from("market_rates").update(payload).eq("id", editId)
      : await supabase.from("market_rates").insert(payload);

    setSaving(false);

    if (error) {
      const rlsHint =
        error.message.includes("row-level security") || error.code === "42501"
          ? " Run supabase/full-setup.sql in Supabase SQL Editor and set your login email to admin (section 8)."
          : "";
      setSaveError(error.message + rlsHint);
      return;
    }

    resetForm();
    await load();
  };

  const del = async (id: string, label: string) => {
    if (!confirm(`Delete market rate for "${label}"?`)) return;
    setListError(null);
    const { error } = await supabase.from("market_rates").delete().eq("id", id);
    if (error) {
      setListError(error.message);
      return;
    }
    if (editId === id) resetForm();
    await load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1f6f43]">Market Rates</h1>
          <p className="text-sm text-gray-600 mt-1">
            Crops saved here appear on the home page under &quot;Today&apos;s Market Rates&quot;.
          </p>
        </div>
        <Button size="sm" className="bg-[#1f6f43] text-white shrink-0" onClick={startAdd} disabled={saving}>
          + Add crop rate
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="पिक (मराठी)"
              value={form.crop_mr}
              onChange={(e) => setForm({ ...form, crop_mr: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            />
            <input
              placeholder="Crop (English)"
              value={form.crop_en}
              onChange={(e) => setForm({ ...form, crop_en: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            />
            <input
              type="number"
              min={0}
              placeholder="Price (₹)"
              value={form.price_inr || ""}
              onChange={(e) => setForm({ ...form, price_inr: +e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            />
            <input
              placeholder="Unit (e.g. quintal)"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="border rounded-md px-3 py-2 text-sm"
              disabled={saving}
            />
          </div>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <div className="flex gap-2 flex-wrap">
            <Button className="bg-[#1f6f43] text-white" size="sm" onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : editId ? "Update rate" : "Add rate"}
            </Button>
            <Button size="sm" variant="outline" onClick={resetForm} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {listError && <p className="text-sm text-red-600 mb-3">{listError}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading market rates…</p>
      ) : rates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-600 mb-3">No crop rates yet.</p>
          <Button size="sm" className="bg-[#1f6f43] text-white" onClick={startAdd}>
            Add your first crop rate
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto border border-gray-100">
          <table className="w-full text-sm min-w-[520px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700">Crop (MR / EN)</th>
                <th className="text-left p-3 font-semibold text-gray-700">Price (₹)</th>
                <th className="text-left p-3 font-semibold text-gray-700">Unit</th>
                <th className="p-3 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">
                    {r.crop_mr} / {r.crop_en}
                  </td>
                  <td className="p-3">₹{Number(r.price_inr).toLocaleString("en-IN")}</td>
                  <td className="p-3">{r.unit}</td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => void del(r.id, r.crop_en)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
