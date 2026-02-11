"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // noop
  }, [error]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Profile</h1>
        <p className="text-zinc-500 mb-8">Manage your FLUX account.</p>

        <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6 space-y-4">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 whitespace-pre-wrap">
            {error.message}
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-zinc-100 hover:bg-white/10 transition-all"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
