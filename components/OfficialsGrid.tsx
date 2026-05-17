"use client";

import { useCallback, useEffect, useState } from "react";
import { useLivePoll } from "@/lib/use-live-poll";
import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import StorageAvatar from "@/components/StorageAvatar";
import { sectionAnim } from "@/lib/section-anim";

interface Official {
  id: string;
  name_mr: string;
  name_en: string;
  designation_mr: string;
  designation_en: string;
  photo_url: string | null;
  mobile?: string;
  is_active?: boolean | null;
}

export default function OfficialsGrid({ language }: { language: "mr" | "en" }) {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOfficials = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    const { data, error: qErr } = await supabase.from("officials").select("*").order("sort_order", {
      ascending: true,
    });
    if (qErr) {
      setError(qErr.message);
      setOfficials([]);
    } else {
      const rows = (data as Official[]) || [];
      setOfficials(rows.filter((o) => o.is_active !== false));
    }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    void loadOfficials(false);
  }, [loadOfficials]);

  useLivePoll(() => loadOfficials(true), { runOnMount: false });

  return (
    <motion.section id="officials" className="py-14 px-6 bg-white" {...sectionAnim}>
      <h3 className="text-2xl font-semibold text-center mb-8 text-[#1f6f43] flex items-center justify-center gap-2">
        <UserCheck size={20} /> {language === "mr" ? "पदाधिकारी व कर्मचारी" : "Officials & Staff"}
      </h3>
      {error && <p className="text-center text-sm text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p className="text-center text-sm text-gray-500">Loading officials…</p>
      ) : officials.length > 0 ? (
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto place-items-center w-full">
            {officials.map((o) => (
              <Card
                key={o.id}
                className="w-full max-w-xs bg-white border border-[#1f6f43]/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-out"
              >
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <StorageAvatar
                    src={o.photo_url}
                    alt={language === "mr" ? o.name_mr : o.name_en}
                    size={80}
                  />
                  <h4 className="text-sm font-semibold mt-4">
                    {language === "mr" ? o.name_mr || o.name_en : o.name_en || o.name_mr}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {language === "mr" ? o.designation_mr || o.designation_en : o.designation_en || o.designation_mr}
                  </p>
                  {o.mobile && <p className="text-xs text-gray-400 mt-1">📞 {o.mobile}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500">
          {language === "mr" ? "अधिकृत व कर्मचारी माहिती लवकरच उपलब्ध होईल." : "Officials & staff details will be available soon."}
        </p>
      )}
    </motion.section>
  );
}
