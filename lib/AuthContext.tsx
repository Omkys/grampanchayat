"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface AuthUser {
  id: string;
  email: string;
  role: string;
  full_name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refresh: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setUser(null); setLoading(false); return; }

    const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", session.user.id).single();

    setUser({
      id: session.user.id,
      email: session.user.email!,
      role: profile?.role || "citizen",
      full_name: profile?.full_name || "",
    });
    setLoading(false);
  };

  useEffect(() => {
    refresh();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
