"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  TrendingUp,
  Heart,
  Brain,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface ReportRow {
  id: string;
  interest_score: number | null;
  summary: string | null;
  chat_preview: string | null;
  created_at: string | null;
  // Extended fields for detail view
  initiative_ratio: string | null;
  sentiment_timeline: string | null;
  advice: string | null;
  deep_psychology: string | null;
  sarcasm: string | null;
  dating_advice: string | null;
  my_gender: string | null;
  partner_gender: string | null;
  chat_messages: unknown[] | null;
}

export default function HistoryPage() {
  const { isLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("reports")
        .select("*")
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
          <div className="w-8 h-8 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin inline-block" />
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
            <p className="text-zinc-500">
              Your past chat analysis reports. Click to expand details.
            </p>
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
            <h2 className="mt-4 text-lg font-semibold text-zinc-100">
              No reports yet
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Analyze your first conversation to see it here.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-100 hover:bg-white/10 transition-all"
            >
              Analyze First Chat
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => {
              const isExpanded = expandedId === r.id;
              const summaryLabel = r.summary || "Analysis Complete";
              const isPositive =
                summaryLabel.toLowerCase().includes("high") ||
                summaryLabel.toLowerCase().includes("mutual");

              return (
                <motion.div
                  key={r.id}
                  layout
                  className="rounded-2xl overflow-hidden backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10"
                >
                  {/* Card Header — click to expand */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : r.id)
                    }
                    className="w-full text-left p-5 flex items-start justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-semibold text-zinc-100">
                          Score: {r.interest_score ?? "—"}%
                        </span>
                        <span
                          className={
                            isPositive
                              ? "inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-200"
                              : "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-zinc-300"
                          }
                        >
                          {summaryLabel}
                        </span>
                        {r.my_gender && (
                          <span className="text-xs text-zinc-600">
                            {r.my_gender} → {r.partner_gender}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                          : "—"}
                      </div>
                      <div className="mt-3 text-sm text-zinc-400 line-clamp-2">
                        {r.chat_preview || "No preview available."}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-1" />
                    )}
                  </button>

                  {/* Expanded Detail View */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/10 p-5 space-y-6">
                          {/* Metrics Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <MetricCard
                              icon={
                                <Heart className="w-4 h-4 text-pink-400" />
                              }
                              label="Interest Score"
                              value={`${r.interest_score ?? "—"}%`}
                            />
                            <MetricCard
                              icon={
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                              }
                              label="Initiative Ratio"
                              value={r.initiative_ratio || "—"}
                            />
                            <MetricCard
                              icon={
                                <MessageCircle className="w-4 h-4 text-cyan-400" />
                              }
                              label="Sentiment"
                              value={r.sentiment_timeline || "—"}
                            />
                          </div>

                          {/* Advice */}
                          {r.advice && (
                            <DetailSection title="💡 Advice" content={r.advice} />
                          )}

                          {/* Deep Psychology */}
                          {r.deep_psychology && (
                            <DetailSection
                              title="🧠 Deep Psychology"
                              content={r.deep_psychology}
                              icon={<Brain className="w-4 h-4" />}
                            />
                          )}

                          {/* Sarcasm */}
                          {r.sarcasm && (
                            <DetailSection
                              title="😏 Sarcasm Detection"
                              content={r.sarcasm}
                            />
                          )}

                          {/* Dating Advice */}
                          {r.dating_advice && (
                            <DetailSection
                              title="💕 Dating Advice"
                              content={r.dating_advice}
                            />
                          )}

                          {/* Chat Messages */}
                          {r.chat_messages &&
                            Array.isArray(r.chat_messages) &&
                            r.chat_messages.length > 0 && (
                              <div>
                                <h3 className="text-sm font-semibold text-zinc-200 mb-3">
                                  💬 Chat History
                                </h3>
                                <div className="rounded-xl bg-black/20 border border-white/10 p-4 max-h-64 overflow-y-auto space-y-2">
                                  {(
                                    r.chat_messages as {
                                      role: string;
                                      text: string;
                                    }[]
                                  ).map((msg, i) => (
                                    <div
                                      key={i}
                                      className={`text-sm px-3 py-2 rounded-lg ${msg.role === "user"
                                          ? "bg-blue-500/10 text-blue-200 ml-8"
                                          : "bg-white/5 text-zinc-300 mr-8"
                                        }`}
                                    >
                                      <span className="text-xs text-zinc-500 block mb-0.5">
                                        {msg.role === "user"
                                          ? "You"
                                          : "AI Coach"}
                                      </span>
                                      {msg.text}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <div className="text-sm font-semibold text-zinc-100 line-clamp-2">
        {value}
      </div>
    </div>
  );
}

function DetailSection({
  title,
  content,
  icon,
}: {
  title: string;
  content: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-200 mb-2 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="rounded-xl bg-black/20 border border-white/10 p-4 text-sm text-zinc-300 whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}