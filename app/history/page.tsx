import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";

const MOCK_REPORTS = [
  { id: "r1", name: "Elena", analyzedOn: "Feb 10", summary: "High Interest" as const },
  { id: "r2", name: "Mia", analyzedOn: "Feb 09", summary: "Cold" as const },
  { id: "r3", name: "Sofia", analyzedOn: "Feb 07", summary: "High Interest" as const },
  { id: "r4", name: "Anna", analyzedOn: "Feb 05", summary: "Cold" as const },
  { id: "r5", name: "Katya", analyzedOn: "Feb 03", summary: "High Interest" as const },
  { id: "r6", name: "Daria", analyzedOn: "Feb 01", summary: "Cold" as const },
];

export default function HistoryPage() {
  const reports = MOCK_REPORTS;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">Reports</h1>
            <p className="text-zinc-500">Past chat analysis reports (mock data for now).</p>
          </div>

          <Link
            href="/upload"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 border border-white/10"
            style={{ animation: "gradient-shift 3s ease infinite" }}
          >
            <Sparkles className="w-5 h-5" />
            Generate
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-12 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FileText className="w-7 h-7 text-zinc-300" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-zinc-100">No history yet</h2>
            <p className="mt-1 text-sm text-zinc-500">Create your first generation to see it here.</p>
            <Link
              href="/upload"
              className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-100 hover:bg-white/10 transition-all"
            >
              Analyze First Chat
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((r) => (
              <motion.div
                key={r.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="group rounded-2xl overflow-hidden backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-zinc-100">Chat with {r.name}</div>
                      <div className="mt-1 text-xs text-zinc-500">Analyzed on {r.analyzedOn}</div>
                    </div>
                    <span
                      className={
                        r.summary === "High Interest"
                          ? "inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200"
                          : "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-200"
                      }
                    >
                      {r.summary}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl bg-black/20 border border-white/10 p-4 text-sm text-zinc-300">
                    Mock summary: initiative is slightly imbalanced, tone improves after playful topics.
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
