"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface Rate { id: string; crop_mr: string; crop_en: string; price_inr: number; unit: string; }

export default function MarketRatesPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [price, setPrice] = useState(0);

  const load = async () => { const { data } = await supabase.from("market_rates").select("*").order("crop_en"); setRates(data || []); };
  useEffect(() => { load(); }, []);

  const update = async (id: string) => {
    await supabase.from("market_rates").update({ price_inr: price, updated_at: new Date().toISOString() }).eq("id", id);
    setEditId(null); load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1f6f43] mb-4">Market Rates</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left p-3">Crop</th><th className="text-left p-3">Price (₹)</th><th className="text-left p-3">Unit</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.crop_mr} / {r.crop_en}</td>
                <td className="p-3">
                  {editId === r.id ? <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} className="border rounded px-2 py-1 w-24 text-sm" /> : `₹${r.price_inr}`}
                </td>
                <td className="p-3">{r.unit}</td>
                <td className="p-3 text-center">
                  {editId === r.id ? (
                    <div className="flex gap-1 justify-center">
                      <Button size="sm" className="bg-[#1f6f43] text-white" onClick={() => update(r.id)}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { setEditId(r.id); setPrice(r.price_inr); }}>Edit</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
