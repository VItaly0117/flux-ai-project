"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface ReportRow {
  id: string;
  interest_score: number | null;
  summary: string | null;
  chat_preview: string | null;
  created_at: string | null;
}

export default function HistoryPage() {
  const { isLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("reports")
        .select("id, interest_score, summary, chat_preview, created_at")
        .order("created_at", { ascending: false });
      setReports((data as ReportRow[]) ?? []);
      setLoading(false);
    };
    void load();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-8 h-8 border-2 border-white/20 border-t-cyan-400 rounded-full inline-block"
          />
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">Reports</h1>
            <p className="text-zinc-500">Your past chat analysis reports.</p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 border border-white/10"
          >
            <Sparkles className="w-5 h-5" />
            New Analysis
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-12 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FileText className="w-7 h-7 text-zinc-300" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-zinc-100">No reports yet</h2>
            <p className="mt-1 text-sm text-zinc-500">Analyze your first conversation to see it here.</p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-100 hover:bg-white/10 transition-all"
            >
              Analyze First Chat
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((r) => {
              const summaryLabel = r.summary || "Analysis Complete";
              const isPositive = summaryLabel.toLowerCase().includes("high") || summaryLabel.toLowerCase().includes("mutual");
              return (
                <motion.div
                  key={r.id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                  className="group rounded-2xl overflow-hidden backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">
                          Score: {r.interest_score ?? "—"}%
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </div>
                      </div>
                      <span
                        className={
                          isPositive
                            ? "inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200"
                            : "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-200"
                        }
                      >
                        {summaryLabel}
                      </span>
                    </div>

                    <div className="mt-4 rounded-2xl bg-black/20 border border-white/10 p-4 text-sm text-zinc-400 line-clamp-3">
                      {r.chat_preview || "No preview available."}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}