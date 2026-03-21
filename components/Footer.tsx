"use client";
import { motion } from "framer-motion";

const anim = { initial: { opacity: 0, y: 60 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, viewport: { once: true } };

export default function Footer({ language }: { language: "mr" | "en" }) {
  const title = language === "mr" ? "ग्रामपंचायत- जावळके" : "Gram Panchayat - Jawalke";
  return (
    <motion.footer className="bg-[#1f6f43] text-white py-10 mt-10" {...anim}>
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <h4 className="font-semibold mb-3">{language === "mr" ? "संपर्क तपशील" : "Contact Details"}</h4>
          <p>ग्रामपंचायत- जावळके</p>
          <p>प.स- जामखेड</p>
          <p>जि.प- अहिल्यानगर</p>
          <p>Mobile: 9876543210</p>
          <p>Email: gp.jawalke@gov.in</p>
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
