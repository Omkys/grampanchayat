"use client";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

export default function AboutSection({
  language,
  aboutMr,
  aboutEn,
}: {
  language: "mr" | "en";
  aboutMr?: string;
  aboutEn?: string;
}) {
  const body =
    language === "mr"
      ? (aboutMr ||
        "ग्रामपंचायत ही स्थानिक स्वराज्य संस्थेचा पाया आहे. ग्रामपंचायत गावाच्या सर्वांगीण विकासासाठी कार्यरत आहे. पाणीपुरवठा, रस्ते, स्वच्छता, शिक्षण व सामाजिक योजना राबविणे हे आमचे प्रमुख उद्दिष्ट आहे.")
      : (aboutEn ||
        "Gram Panchayat ensures rural development. The Gram Panchayat works for the holistic development of the village. Key focus areas include water supply, roads, sanitation, education, and implementation of welfare schemes.");
  return (
    <motion.section id="about" className="py-14 px-6 bg-white" {...anim}>
      <div className="max-w-5xl mx-auto text-center">
        <h3 className="text-2xl font-semibold mb-6 text-[#1f6f43] flex items-center justify-center gap-2">
          <Info size={20} /> {language === "mr" ? "ग्रामपंचायत विषयी" : "About Gram Panchayat"}
        </h3>
        <p className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-line">{body}</p>
      </div>
    </motion.section>
  );
}
