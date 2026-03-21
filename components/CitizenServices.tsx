"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Landmark, Home, Droplets, AlertCircle, Building2, CreditCard, Briefcase, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

const services = [
  { icon: FileText, mr: "जन्म दाखला अर्ज", en: "Birth Certificate" },
  { icon: Landmark, mr: "मृत्यू दाखला अर्ज", en: "Death Certificate" },
  { icon: Home, mr: "घरपट्टी / मालमत्ता कर", en: "Property Tax" },
  { icon: Droplets, mr: "पाणीपुरवठा तक्रार", en: "Water Supply Complaint" },
  { icon: AlertCircle, mr: "तक्रार नोंदणी", en: "Grievance Registration" },
  { icon: Building2, mr: "बांधकाम परवानगी", en: "Building Permission" },
  { icon: CreditCard, mr: "कर व शुल्क भरणा", en: "Online Tax & Fee Payment" },
];

export default function CitizenServices({ language }: { language: "mr" | "en" }) {
  const [active, setActive] = useState<typeof services[0] | null>(null);
  const [formData, setFormData] = useState({ name: "", mobile: "", details: "" });

  return (
    <motion.section id="services" className="py-14 px-6 bg-[#fff7ed]" {...anim}>
      <h3 className="text-2xl font-semibold text-center mb-8 text-[#1f6f43] flex items-center justify-center gap-2">
        <Briefcase size={20} /> {language === "mr" ? "नागरिक सेवा" : "Citizen Services"}
      </h3>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {services.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="hover:shadow-md cursor-pointer transition" onClick={() => setActive(s)}>
              <CardContent className="p-6 text-center">
                <Icon className="w-8 h-8 text-[#f97316] mx-auto mb-3" />
                <h4 className="text-sm font-medium">{language === "mr" ? s.mr : s.en}</h4>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setActive(null)}>
            <motion.div className="bg-white p-6 rounded-xl w-[90%] max-w-md relative" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-3 right-3 cursor-pointer" onClick={() => setActive(null)}><X size={18} /></button>
              <h3 className="text-lg font-semibold mb-4 text-center text-[#1f6f43]">{language === "mr" ? active.mr : active.en}</h3>
              <input type="text" placeholder={language === "mr" ? "नाव" : "Full Name"} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-md px-3 py-2 mb-3" />
              <input type="text" placeholder={language === "mr" ? "मोबाईल क्रमांक" : "Mobile Number"} value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="w-full border rounded-md px-3 py-2 mb-3" />
              <textarea placeholder={language === "mr" ? "तपशील" : "Details"} value={formData.details} onChange={(e) => setFormData({ ...formData, details: e.target.value })} className="w-full border rounded-md px-3 py-2 mb-4" />
              <Button className="w-full bg-[#1f6f43] text-white">{language === "mr" ? "सबमिट" : "Submit"}</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
