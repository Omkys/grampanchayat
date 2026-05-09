"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refresh } = useAuthContext();

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Email and password required"); return; }
    setLoading(true);
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) { setError(authErr.message); setLoading(false); return; }

    await refresh();

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    const role = profile?.role || "citizen";

    if (role === "admin" || role === "official") {
      router.push("/dashboard");
    } else {
      router.push("/citizen");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="w-16 h-16" alt="Emblem" />
        </div>
        <h2 className="text-xl font-semibold text-center text-[#1f6f43] mb-1">ग्रामपंचायत बावी</h2>
        <p className="text-center text-sm text-gray-500 mb-6">लॉगिन / Login</p>
        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2 mb-3 text-sm" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2 mb-4 text-sm" onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
        <Button className="w-full bg-[#1f6f43] text-white" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "लॉगिन / Login"}
        </Button>
        <p className="text-center text-sm mt-4 text-gray-600">
          नवीन नोंदणी / New here? <Link href="/register" className="text-[#1f6f43] font-medium underline">Register</Link>
        </p>
        <p className="text-center text-sm mt-2">
          <Link href="/" className="text-gray-500 underline">← मुख्यपृष्ठ / Home</Link>
        </p>
      </div>
    </div>
  );
}
