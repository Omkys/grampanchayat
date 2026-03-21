"use client";
import { motion } from "framer-motion";
import { UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

export default function OfficialsGrid({ language }: { language: "mr" | "en" }) {
  return (
    <motion.section id="officials" className="py-14 px-6 bg-white" {...anim}>
      <h3 className="text-2xl font-semibold text-center mb-8 text-[#1f6f43] flex items-center justify-center gap-2">
        <UserCheck size={20} /> {language === "mr" ? "पदाधिकारी व कर्मचारी" : "Officials & Staff"}
      </h3>
      <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-[#1f6f43] mx-auto mb-4" />
              <h4 className="text-sm font-semibold">Official {i + 1}</h4>
              <p className="text-xs text-gray-600">Designation</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}
