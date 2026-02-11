"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

type AuthResult = {
  ok: boolean;
  error: string | null;
};

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  signup: (email: string, password: string, name?: string) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

type ProfileRow = {
  id: string;
  role: UserRole | null;
  name: string | null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const mapUser = useCallback(async (sbUser: SupabaseUser | null) => {
    if (!sbUser) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, name")
      .eq("id", sbUser.id)
      .maybeSingle<ProfileRow>();

    const role: UserRole = profile?.role === "admin" ? "admin" : "user";

    return {
      id: sbUser.id,
      email: sbUser.email ?? "",
      name: profile?.name ?? undefined,
      role,
    } satisfies User;
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      const sbUser = data.session?.user ?? null;
      const mapped = await mapUser(sbUser);
      if (mounted) {
        setUser(mapped);
        setIsLoading(false);
      }
    };

    void init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
        router.refresh();
        return;
      }

      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN" || event === "USER_UPDATED") {
        const mapped = await mapUser(session?.user ?? null);
        if (mounted) {
          setUser(mapped);
          setIsLoading(false);
        }
        router.refresh();
        return;
      }

      const mapped = await mapUser(session?.user ?? null);
      if (mounted) {
        setUser(mapped);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [mapUser, router, supabase]);

  useEffect(() => {
    let cancelled = false;

    const recover = async () => {
      if (isLoading) return;
      if (user) return;

      try {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        if (data.user) {
          const mapped = await mapUser(data.user);
          if (!cancelled) {
            setUser(mapped);
            router.refresh();
          }
        }
      } catch {
        // ignore
      }
    };

    void recover();

    return () => {
      cancelled = true;
    };
  }, [isLoading, mapUser, router, supabase, user]);

  useEffect(() => {
    if (user?.role === "admin") {
      router.refresh();
    }
  }, [router, user?.role]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { ok: !error, error: error?.message ?? null };
  }, [supabase]);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    return { ok: !error, error: error?.message ?? null };
  }, [supabase]);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { ok: false, error: error.message };

    const sbUser = data.user;
    if (sbUser) {
      await supabase.from("profiles").upsert({ id: sbUser.id, name: name ?? null });
    }

    return { ok: true, error: null };
  }, [supabase]);

  const logout = useCallback(() => {
    void supabase.auth.signOut();
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
