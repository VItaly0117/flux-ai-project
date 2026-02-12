"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-blue-500/5 backdrop-blur-2xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-zinc-100">FLUX AI</div>
            <div className="mt-1 text-sm text-zinc-500">AI-powered chat analysis workspace.</div>
          </div>

          <nav className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-zinc-100 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              Home
            </Link>
            <Link
              href="/history"
              className="px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-zinc-100 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              Past Reports
            </Link>
            <Link
              href="/privacy"
              className="px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-zinc-100 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>

        <div className="mt-8 text-xs text-zinc-600">© {new Date().getFullYear()} FLUX. All rights reserved.</div>
      </div>
    </footer>
  );
}
