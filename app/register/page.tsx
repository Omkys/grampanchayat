"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Name, email and password are required");
      return;
    }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    const { data, error: authErr } = await supabase.auth.signUp({ email: form.email, password: form.password });

    if (authErr) { setError(authErr.message); setLoading(false); return; }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: form.name,
        mobile: form.mobile || null,
        role: "citizen",
      });
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#fdfaf5] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center">
          <p className="text-green-600 font-semibold text-lg mb-2">✅ Registration Successful!</p>
          <p className="text-sm text-gray-600 mb-4">Check your email to confirm your account.</p>
          <Button className="bg-[#1f6f43] text-white" onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf5] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center text-[#1f6f43] mb-6">नवीन नोंदणी / Register</h2>
        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
        <input type="text" placeholder="नाव / Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-md px-3 py-2 mb-3 text-sm" />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-md px-3 py-2 mb-3 text-sm" />
        <input type="text" placeholder="मोबाईल / Mobile (optional)" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="w-full border rounded-md px-3 py-2 mb-3 text-sm" />
        <input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded-md px-3 py-2 mb-4 text-sm" />
        <Button className="w-full bg-[#1f6f43] text-white" onClick={handleRegister} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </Button>
        <p className="text-center text-sm mt-4 text-gray-600">
          Already registered? <Link href="/login" className="text-[#1f6f43] font-medium underline">Login</Link>
        </p>
        <p className="text-center text-sm mt-2">
          <Link href="/" className="text-gray-500 underline">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
