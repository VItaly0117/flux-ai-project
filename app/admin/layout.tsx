"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (user?.role !== "admin") {
      router.replace("/");
    }
  }, [isLoggedIn, user?.role, router]);

  if (!isLoggedIn || user?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
