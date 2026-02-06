"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const PUBLIC_ROUTES = ["/login", "/signup"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    if (!isLoggedIn && !isPublic) {
      router.replace("/login");
    }
  }, [isLoggedIn, isPublic, pathname, router]);

  if (!isLoggedIn && !isPublic) {
    return null;
  }

  return <>{children}</>;
}
