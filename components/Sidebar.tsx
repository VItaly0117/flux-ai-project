"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FolderOpen, label: "Projects", href: "/projects" },
  { icon: Sparkles, label: "New Project", href: "/new" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const MOBILE_BREAKPOINT = 1024; // lg

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

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useIsDesktop();

  const closeMobile = () => setMobileOpen(false);

  // На десктопе drawer всегда закрыт (сайдбар виден), на мобильном — управляется кнопкой
  const isDrawerVisible = isDesktop || mobileOpen;

  return (
    <>
      {/* Mobile header — бургер-бар, только на малых экранах */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 lg:hidden h-14 px-4 flex items-center justify-between backdrop-blur-2xl bg-zinc-950/40 border-b border-white/10 shadow-lg shadow-black/20"
      >
        <Link href="/" className="flex items-center gap-2" onClick={closeMobile}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25 ring-1 ring-white/10">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Regie
          </span>
        </Link>
        <motion.button
          onClick={() => setMobileOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-xl text-zinc-300 hover:text-zinc-100 backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/30 transition-all duration-200 shadow-lg shadow-black/10"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </motion.button>
      </motion.header>

      {/* Overlay — при открытом drawer на мобильном */}
      <AnimatePresence>
        {mobileOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobile}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar / Drawer — скрыт на мобильном, виден на десктопе или при открытом меню */}
      <motion.aside
        initial={false}
        animate={{
          x: isDrawerVisible ? 0 : -280,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`
          fixed left-0 top-0 h-screen w-64 z-40 flex flex-col
          backdrop-blur-2xl bg-zinc-950/60 border-r border-white/10
          shadow-2xl shadow-black/30
          lg:translate-x-0 lg:shadow-none
        `}
        style={{
          // Лёгкий градиент по краю для «мощного» вида
          boxShadow: isDrawerVisible && !isDesktop
            ? "4px 0 40px -10px rgba(139, 92, 246, 0.15), 4px 0 80px -20px rgba(6, 182, 212, 0.1)"
            : undefined,
        }}
      >
        {/* Кнопка закрытия — только на мобильном */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-white/10">
          <span className="font-semibold text-zinc-100">Меню</span>
          <motion.button
            onClick={closeMobile}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Лого — только на десктопе */}
        <div className="hidden lg:block p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow ring-1 ring-white/10">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Regie
            </span>
          </Link>
        </div>

        {/* Навигация */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * index, duration: 0.2 }}
            >
              <Link
                href={item.href}
                onClick={closeMobile}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 active:bg-white/10 transition-all duration-200 group"
              >
                <item.icon className="w-5 h-5 group-hover:text-violet-400 transition-colors flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Нижний акцент */}
        <div className="p-4 border-t border-white/10">
          <div className="h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
        </div>
      </motion.aside>
    </>
  );
}
