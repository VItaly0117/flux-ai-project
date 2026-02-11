"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, History, Upload, User, Shield, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";

const baseNavItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: History, label: "History", href: "/history" },
  { icon: Upload, label: "Upload Context", href: "/upload" },
  { icon: User, label: "Profile", href: "/settings" },
];

const MOBILE_BREAKPOINT = 1024;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isDesktop;
}

function NavLink({ item, isMobile = false }: { item: (typeof baseNavItems)[0]; isMobile?: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href === "/" && pathname === "/");
  const Icon = item.icon;

  const linkClass = `
    flex items-center gap-3 rounded-xl transition-all duration-200
    ${isMobile ? "flex-1 flex-col justify-center gap-1 py-2 px-3" : "px-4 py-3"}
    ${isActive ? "text-cyan-400 bg-blue-500/10 shadow-blue-500/20" : "text-zinc-400 hover:text-zinc-100 hover:bg-blue-500/5"}
  `;

  return (
    <Link href={item.href} className={linkClass}>
      <Icon className={`${isMobile ? "w-5 h-5" : "w-5 h-5"} flex-shrink-0`} />
      <span className={`font-medium ${isMobile ? "text-[10px]" : ""}`}>{item.label}</span>
    </Link>
  );
}

export function Navigation() {
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const adminItem = { icon: Shield, label: "Admin", href: "/admin/dashboard" as const };

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function loadRole() {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const sbUser = userData.user;
        if (!sbUser) {
          if (!cancelled) setIsAdmin(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", sbUser.id)
          .maybeSingle<{ role: string | null }>();

        const role = (profile?.role ?? "user").toString().toLowerCase();
        if (!cancelled) setIsAdmin(role === "admin");
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    }

    void loadRole();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const navItems = isAdmin ? [...baseNavItems, adminItem] : baseNavItems;

  const handleSignOut = async () => {
    if (user) {
      const ok = window.confirm("Sign out?");
      if (!ok) return;
      window.location.assign("/auth/signout");
      return;
    }

    router.replace("/login");
  };

  return (
    <>
      {/* Sidebar — desktop only */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex fixed left-0 top-0 h-screen w-64 z-40 flex-col backdrop-blur-2xl bg-blue-500/5 border-r border-white/10 shadow-lg shadow-blue-500/10"
      >
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/10">
              <span className="text-white font-bold text-sm">FLUX</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              FLUX
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-4 w-full flex items-center gap-3 rounded-xl transition-all duration-200 px-4 py-3 text-zinc-400 hover:text-zinc-100 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </motion.aside>

      {/* Bottom Tab Bar — mobile only (NO top hamburger) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden h-16 px-2 flex items-center justify-around gap-1 backdrop-blur-2xl bg-blue-500/5 border-t border-white/10 shadow-[0_-4px_24px_-4px_rgba(59,130,246,0.15)]">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} isMobile />
        ))}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex-1 flex flex-col justify-center items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 text-zinc-400 hover:text-zinc-100 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-[10px]">Sign out</span>
        </button>
      </nav>
    </>
  );
}
