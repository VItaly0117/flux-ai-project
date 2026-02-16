"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/auth",
  "/pricing",
  "/privacy",
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic =
    pathname === "/" ||
    PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn && !isPublic) {
      router.replace("/login");
    }
  }, [isLoading, isLoggedIn, isPublic, pathname, router]);

  // Public routes — always render immediately
  if (isPublic) {
    return <>{children}</>;
  }

  // Protected routes — show loading spinner while auth resolves
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in — will redirect via useEffect; show nothing
  if (!isLoggedIn) {
    return null;
  }

  return <>{children}</>;
}
