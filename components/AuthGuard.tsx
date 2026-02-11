"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_ROUTES = ["/login", "/signup", "/auth/callback"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = pathname === "/" || PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  if (isPublic) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn && !isPublic) {
      router.replace("/login");
    }
  }, [isLoading, isLoggedIn, isPublic, pathname, router]);

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn && !isPublic) {
    return null;
  }

  return <>{children}</>;
}
