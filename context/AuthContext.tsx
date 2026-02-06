"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock admin user for testing: admin@flux.app / any password
const MOCK_ADMIN = { id: "1", email: "admin@flux.app", role: "admin" as UserRole };
const MOCK_USER = { id: "2", email: "user@flux.app", role: "user" as UserRole };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    // Mock: admin@flux.app -> admin, anything else -> user
    await new Promise((r) => setTimeout(r, 500));
    if (email.toLowerCase() === "admin@flux.app") {
      setUser(MOCK_ADMIN);
    } else {
      setUser({ ...MOCK_USER, email });
    }
    return true;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 500));
    setUser(MOCK_USER);
    return true;
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    await new Promise((r) => setTimeout(r, 500));
    setUser({ id: crypto.randomUUID(), email, name, role: "user" });
    return true;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
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
