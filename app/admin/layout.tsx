"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (user?.role !== "admin") {
      router.replace("/");
    }
  }, [isLoading, isLoggedIn, user?.role, router]);

  if (isLoading) {
    return null;
  }

  if (!isLoggedIn || user?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
