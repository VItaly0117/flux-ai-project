"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef, ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export type UserRole = "user" | "admin";

export type Gender = "male" | "female" | "other";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  gender?: Gender;
  bio?: string;
  is_pro: boolean;
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
  gender: Gender | null;
  bio: string | null;
  is_pro: boolean | null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const hasRecovered = useRef(false);

  const ADMIN_EMAILS = ["admin@flux.com", "boss@flux.com"];

  const mapUser = useCallback(async (sbUser: SupabaseUser | null): Promise<User | null> => {
    if (!sbUser) return null;

    const isHardcodedAdmin = !!sbUser.email && ADMIN_EMAILS.includes(sbUser.email);

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, name, gender, bio, is_pro")
      .eq("id", sbUser.id)
      .maybeSingle<ProfileRow>();

    const role: UserRole = isHardcodedAdmin ? "admin" : (profile?.role === "admin" ? "admin" : "user");

    return {
      id: sbUser.id,
      email: sbUser.email ?? "",
      name: profile?.name ?? undefined,
      role,
      gender: (profile?.gender as Gender) ?? undefined,
      bio: profile?.bio ?? undefined,
      is_pro: !!profile?.is_pro,
    } satisfies User;
  }, [supabase]);

  // Main effect: init session + subscribe to auth events
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setIsLoading(true);

      // getUser() validates the token server-side (more reliable than getSession)
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      const mapped = await mapUser(sbUser ?? null);

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
          hasRecovered.current = false;
        }
        router.refresh();
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        const mapped = await mapUser(session?.user ?? null);
        if (mounted) {
          setUser(mapped);
          setIsLoading(false);
        }
        // Sync Server Components so they see the fresh session/role
        router.refresh();
        return;
      }

      // INITIAL_SESSION or any other event
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

  // One-shot recovery: if loading finished with no user, try getUser() once
  // This catches the case where cookies/localStorage have a session but
  // the initial getSession() returned null (e.g. after a hard refresh).
  useEffect(() => {
    if (isLoading || user || hasRecovered.current) return;
    hasRecovered.current = true;

    let cancelled = false;

    const recover = async () => {
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (cancelled || !sbUser) return;

        const mapped = await mapUser(sbUser);
        if (!cancelled && mapped) {
          setUser(mapped);
          router.refresh();
        }
      } catch {
        // no session to recover — ignore
      }
    };

    void recover();

    return () => { cancelled = true; };
  }, [isLoading, user, mapUser, router, supabase]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { ok: !error, error: error?.message ?? null };
  }, [supabase]);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
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
