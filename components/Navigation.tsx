"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Home, History, Upload, User, Shield, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
  const router = useRouter();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const adminItem = { icon: Shield, label: "Admin", href: "/admin/dashboard" as const };
  const pathname = usePathname();

  // Derive admin state directly from AuthContext — always fresh, no stale cache
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

      <div className="lg:hidden fixed top-4 left-4 z-40" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
          className="h-12 w-12 rounded-2xl backdrop-blur-2xl bg-blue-500/10 border border-white/10 shadow-lg shadow-blue-500/10 flex items-center justify-center text-zinc-100"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50"
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/70"
            />

            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="relative h-full w-[84vw] max-w-[320px] backdrop-blur-2xl bg-blue-500/5 border-r border-white/10 shadow-2xl shadow-blue-500/20"
              style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
            >
              <div className="px-5 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/10">
                    <span className="text-white font-bold text-sm">FLUX</span>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    FLUX
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 px-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href === "/" && pathname === "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-base font-medium transition-all ${
                        isActive
                          ? "text-cyan-300 bg-blue-500/15 border border-blue-400/20"
                          : "text-zinc-200 hover:bg-white/5 border border-transparent hover:border-white/10"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="absolute left-0 right-0 bottom-0 px-5">
                <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-4 w-full flex items-center gap-3 rounded-2xl px-4 py-4 text-base font-medium text-zinc-200 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign out</span>
                </button>
                <div className="h-4" />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
