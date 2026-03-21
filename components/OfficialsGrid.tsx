"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

interface Official { id: string; name_mr: string; name_en: string; designation_mr: string; designation_en: string; photo_url: string; mobile: string; }

export default function OfficialsGrid({ language }: { language: "mr" | "en" }) {
  const [officials, setOfficials] = useState<Official[]>([]);

  useEffect(() => {
    supabase.from("officials").select("*").order("sort_order", { ascending: true }).then(({ data }) => setOfficials(data || []));
  }, []);

  return (
    <motion.section id="officials" className="py-14 px-6 bg-white" {...anim}>
      <h3 className="text-2xl font-semibold text-center mb-8 text-[#1f6f43] flex items-center justify-center gap-2">
        <UserCheck size={20} /> {language === "mr" ? "पदाधिकारी व कर्मचारी" : "Officials & Staff"}
      </h3>
      <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {officials.length > 0 ? officials.map((o) => (
          <Card key={o.id}>
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden bg-[#1f6f43]/10 flex items-center justify-center border-2 border-[#1f6f43]">
                {o.photo_url ? (
                  <img src={o.photo_url} alt={o.name_en} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">👤</span>'; }} />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <h4 className="text-sm font-semibold">{language === "mr" ? (o.name_mr || o.name_en) : (o.name_en || o.name_mr)}</h4>
              <p className="text-xs text-gray-600">{language === "mr" ? (o.designation_mr || o.designation_en) : (o.designation_en || o.designation_mr)}</p>
              {o.mobile && <p className="text-xs text-gray-400 mt-1">📞 {o.mobile}</p>}
            </CardContent>
          </Card>
        )) : (
          [...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-[#1f6f43]/10 mx-auto mb-4 flex items-center justify-center border-2 border-[#1f6f43]">
                  <span className="text-2xl">👤</span>
                </div>
                <h4 className="text-sm font-semibold text-gray-400">—</h4>
                <p className="text-xs text-gray-400">—</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </motion.section>
  );
}
