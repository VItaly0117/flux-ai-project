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
  const mountedRef = useRef(false);
  const recoveryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ADMIN_EMAILS = ["admin@flux.com", "boss@flux.com"];

  const mapUser = useCallback(async (sbUser: SupabaseUser | null): Promise<User | null> => {
    try {
      if (!sbUser) return null;

      const isHardcodedAdmin = !!sbUser.email && ADMIN_EMAILS.includes(sbUser.email);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, role, name, gender, bio, is_pro")
        .eq("id", sbUser.id)
        .maybeSingle<ProfileRow>();

      if (error) {
        console.log("[Auth] mapUser: profile fetch error", error.message);
      }

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
    } catch (err) {
      console.log("[Auth] mapUser: unexpected error", err);
      if (!sbUser) return null;
      return {
        id: sbUser.id,
        email: sbUser.email ?? "",
        role: "user",
        is_pro: false,
      } satisfies User;
    }
  }, [supabase]);

  // Main effect: init session + subscribe to auth events
  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      setIsLoading(true);
      try {
        // getUser() validates the token server-side (more reliable than getSession)
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.log("[Auth] init getUser error", error.message);
        }
        const mapped = await mapUser(data?.user ?? null);
        if (mountedRef.current) {
          setUser(mapped);
          setIsLoading(false);
        }
      } catch (err) {
        console.log("[Auth] init getUser unexpected error", err);
        if (mountedRef.current) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    void init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Auth] Event:", event);
      if (event === "SIGNED_OUT") {
        if (mountedRef.current) {
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
        try {
          const mapped = await mapUser(session?.user ?? null);
          if (mountedRef.current) {
            setUser(mapped);
            setIsLoading(false);
          }
        } catch (err) {
          console.log("[Auth] event mapUser error", err);
          if (mountedRef.current) {
            setUser(null);
            setIsLoading(false);
          }
        }
        // Sync Server Components so they see the fresh session/role
        router.refresh();
        return;
      }

      // INITIAL_SESSION or any other event
      try {
        const mapped = await mapUser(session?.user ?? null);
        if (mountedRef.current) {
          setUser(mapped);
          setIsLoading(false);
        }
      } catch (err) {
        console.log("[Auth] initial mapUser error", err);
        if (mountedRef.current) {
          setUser(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      mountedRef.current = false;
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
        recoveryTimeoutRef.current = null;
      }
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

    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = null;
    }

    const recover = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.log("[Auth] recover getUser error", error.message);
        }
        const sbUser = data?.user;
        if (cancelled || !sbUser) return;

        const mapped = await mapUser(sbUser);
        if (!cancelled && mountedRef.current && mapped) {
          setUser(mapped);
          router.refresh();
        }
      } catch (err) {
        console.log("[Auth] recover unexpected error", err);
      }
    };

    recoveryTimeoutRef.current = setTimeout(() => {
      void recover();
    }, 1000);

    return () => {
      cancelled = true;
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
        recoveryTimeoutRef.current = null;
      }
    };
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
