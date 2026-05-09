"use client";
import { motion } from "framer-motion";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

export default function Footer({ language }: { language: "mr" | "en" }) {
  const title = language === "mr" ? "ग्रामपंचायत बावी" : "Gram Panchayat Bavi";
  return (
    <motion.footer className="bg-[#1f6f43] text-white py-10 mt-10" {...anim}>
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <h4 className="font-semibold mb-3">{language === "mr" ? "संपर्क तपशील" : "Contact Details"}</h4>
          <p>{title}</p>
          <p>Mobile: 9876543210</p>
          <p>Email: gp.bavi@gov.in</p>
          <p className="mt-3 font-semibold">
            {language === "mr" ? "ग्रामपंचायत अधिकारी" : "Gram Panchayat Officer"}
          </p>
          <p>
            {language === "mr"
              ? "श्री. रफिक दस्तागिर तांबोळी"
              : "Mr. Rafik Dastagir Tamboli"}
          </p>
          <p className="mt-2 font-semibold">
            {language === "mr" ? "प्रशासक" : "Administrator"}
          </p>
          <p>
            {language === "mr"
              ? "श्री महादेव पोपट कारंडे"
              : "Mr. Mahadev Popat Karande"}
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">{language === "mr" ? "सोशल मीडिया" : "Social Media"}</h4>
          <ul className="space-y-2"><li>Facebook</li><li>Instagram</li><li>Twitter / X</li><li>YouTube</li></ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">{language === "mr" ? "उपयुक्त दुवे" : "Useful Links"}</h4>
          <ul className="space-y-2"><li>Maharashtra Government</li><li>Rural Development Dept.</li><li>eGramSwaraj</li><li>RTI / Transparency</li></ul>
        </div>
      </div>
      <div className="text-center text-xs mt-8 border-t border-white/20 pt-4">© {new Date().getFullYear()} {title}</div>
    </motion.footer>
  );
}
