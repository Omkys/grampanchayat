"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AuthState {
  user: { id: string; email: string } | null;
  role: string | null;
  loading: boolean;
}

export function useAuth(requiredRoles?: string[]) {
  const [auth, setAuth] = useState<AuthState>({ user: null, role: null, loading: true });
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
      const role = profile?.role || "citizen";

      if (requiredRoles && !requiredRoles.includes(role)) {
        router.push("/login");
        return;
      }

      setAuth({ user: { id: session.user.id, email: session.user.email! }, role, loading: false });
    };
    check();
  }, []);

  return auth;
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "/login";
}
