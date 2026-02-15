"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  FileUp,
  Loader2,
  Lock,
  MessageCircle,
  MessageSquareText,
  Send,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { useAuth } from "@/context/AuthContext";
import type { Gender } from "@/context/AuthContext";

/* ───────── types ───────── */

type InputTab = "upload" | "paste" | "coach";
type DashPhase = "input" | "analyzing" | "results";

interface AnalysisData {
  interest_score: number;
  initiative_user: number;
  initiative_partner: number;
  sentiment_history: number[];
  advice: string[];
  summary: string;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

/* ───────── animation ───────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

/* ───────── Toggle Switch ───────── */

function Toggle({
  enabled,
  onToggle,
  label,
  locked,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between gap-4 w-full"
    >
      <span className="text-sm text-zinc-300 flex items-center gap-2">
        {label}
        {locked && <Lock className="w-3.5 h-3.5 text-amber-400" />}
        {locked && <span className="text-[10px] text-amber-400 font-semibold">PRO</span>}
      </span>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? "bg-cyan-500" : "bg-white/10"
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}

/* ───────── Gender Selector ───────── */

function GenderSelector({
  value,
  onChange,
  label,
}: {
  value: Gender;
  onChange: (g: Gender) => void;
  label: string;
}) {
  const opts: { val: Gender; lbl: string }[] = [
    { val: "male", lbl: "Male" },
    { val: "female", lbl: "Female" },
    { val: "other", lbl: "Other" },
  ];
  return (
    <div>
      <div className="text-xs font-medium text-zinc-500 mb-2">{label}</div>
      <div className="flex rounded-xl bg-white/5 border border-white/10 p-1">
        {opts.map((o) => (
          <button
            key={o.val}
            type="button"
            onClick={() => onChange(o.val)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              value === o.val
                ? "bg-blue-500/20 text-cyan-300 border border-blue-500/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {o.lbl}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────── Main Dashboard ───────── */

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const isPro = user?.is_pro ?? false;

  /* input state */
  const [inputTab, setInputTab] = useState<InputTab>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  /* options — pre-fill gender from profile */
  const [myGender, setMyGender] = useState<Gender>("male");
  const [partnerGender, setPartnerGender] = useState<Gender>("female");
  const [deepPsychology, setDeepPsychology] = useState(false);
  const [detectSarcasm, setDetectSarcasm] = useState(false);
  const [datingAdvice, setDatingAdvice] = useState(true);

  useEffect(() => {
    if (user?.gender) setMyGender(user.gender);
  }, [user?.gender]);

  /* analysis state */
  const [phase, setPhase] = useState<DashPhase>("input");
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [contextText, setContextText] = useState("");

  /* chat state */
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* file handlers */
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".json") || file.name.endsWith(".txt"))) {
        setUploadedFile(file);
        toast.success("File uploaded");
      } else if (file) {
        toast.error("Unsupported file. Please upload .txt or .json");
      }
    },
    [toast]
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && (file.name.endsWith(".json") || file.name.endsWith(".txt"))) {
        setUploadedFile(file);
        toast.success("File uploaded");
      } else if (file) {
        toast.error("Unsupported file. Please upload .txt or .json");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [toast]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const removeFile = () => setUploadedFile(null);

  const hasInput =
    inputTab === "upload" ? !!uploadedFile : inputTab === "paste" ? pastedText.trim().length > 0 : false;

  /* ── Pro gate helper ── */
  const handleProToggle = (current: boolean, setter: (v: boolean) => void) => {
    if (!current && !isPro) {
      toast.error("This is a Pro feature. Upgrade to unlock.");
      return;
    }
    setter(!current);
  };

  /* ── Run Analysis ── */
  const runAnalysis = async () => {
    if (!hasInput) {
      toast.error(
        inputTab === "upload"
          ? "Please upload a .txt or .json file first"
          : "Please paste your conversation text first"
      );
      return;
    }

    if ((deepPsychology || detectSarcasm) && !isPro) {
      toast.error("Pro features are enabled. Please upgrade or disable them.");
      return;
    }

    setPhase("analyzing");

    try {
      let chatText = "";
      if (inputTab === "upload" && uploadedFile) {
        chatText = await uploadedFile.text();
      } else {
        chatText = pastedText;
      }

      setContextText(chatText);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: chatText,
          my_gender: myGender,
          partner_gender: partnerGender,
          deep_psychology: deepPsychology,
          detect_sarcasm: detectSarcasm,
          dating_advice: datingAdvice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Analysis failed");
        setPhase("input");
        return;
      }

      setAnalysisData(data as AnalysisData);
      setPhase("results");
      toast.success("Analysis complete — powered by Gemini AI");
    } catch {
      toast.error("Network error. Please try again.");
      setPhase("input");
    }
  };

  /* ── Chat with AI ── */
  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;

    const newMessages: ChatMsg[] = [
      ...chatMessages,
      { role: "user", content: msg },
    ];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          contextText: contextText || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Chat failed");
      } else {
        setChatMessages([
          ...newMessages,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const reset = () => {
    setPhase("input");
    setAnalysisData(null);
    setUploadedFile(null);
    setPastedText("");
    setContextText("");
    setChatMessages([]);
  };

  /* derived data */
  const interestScore = analysisData?.interest_score ?? 0;
  const youFirst = analysisData?.initiative_user ?? 50;
  const partnerFirst = analysisData?.initiative_partner ?? 50;
  const tonePoints = analysisData?.sentiment_history ?? [];
  const advice = analysisData?.advice ?? [];
  const summary = analysisData?.summary ?? "";

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
    <div className="relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-24 left-8 h-[420px] w-[420px] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute top-48 right-8 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <section className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            {/* ════════ INPUT PHASE ════════ */}
            {phase === "input" && (
              <motion.div
                key="input"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="max-w-3xl"
              >
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100">
                  Chat Analyzer
                </h1>
                <p className="mt-3 text-zinc-400">
                  Upload or paste a conversation, configure options, and let Gemini AI analyze it.
                </p>

                {/* Gender selectors */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GenderSelector
                    value={myGender}
                    onChange={setMyGender}
                    label="My Gender"
                  />
                  <GenderSelector
                    value={partnerGender}
                    onChange={setPartnerGender}
                    label="Partner's Gender"
                  />
                </div>

                {/* Toggles */}
                <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4">
                  <Toggle
                    enabled={deepPsychology}
                    onToggle={() => handleProToggle(deepPsychology, setDeepPsychology)}
                    label="Deep Psychology Mode"
                    locked={!isPro}
                  />
                  <Toggle
                    enabled={detectSarcasm}
                    onToggle={() => handleProToggle(detectSarcasm, setDetectSarcasm)}
                    label="Detect Sarcasm"
                    locked={!isPro}
                  />
                  <Toggle
                    enabled={datingAdvice}
                    onToggle={() => setDatingAdvice(!datingAdvice)}
                    label="Include Dating Advice"
                  />
                  {!isPro && (
                    <Link href="/pricing" className="inline-flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors mt-1">
                      <Crown className="w-3.5 h-3.5" /> Upgrade to Pro to unlock all features
                    </Link>
                  )}
                </div>

                {/* Tab switcher — 3 modes */}
                <div className="mt-8 flex flex-wrap rounded-xl bg-white/5 border border-white/10 p-1 mb-4 w-fit gap-0">
                  <button
                    type="button"
                    onClick={() => setInputTab("upload")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      inputTab === "upload"
                        ? "bg-blue-500/20 text-cyan-300 border border-blue-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <FileUp className="w-4 h-4" />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputTab("paste")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      inputTab === "paste"
                        ? "bg-blue-500/20 text-cyan-300 border border-blue-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <MessageSquareText className="w-4 h-4" />
                    Paste Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputTab("coach")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      inputTab === "coach"
                        ? "bg-blue-500/20 text-cyan-300 border border-blue-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    AI Coach
                  </button>
                </div>

                {/* Upload zone */}
                {inputTab === "upload" && (
                  <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onClick={() =>
                      !uploadedFile && fileInputRef.current?.click()
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        fileInputRef.current?.click();
                    }}
                    className={
                      "rounded-2xl backdrop-blur-2xl border border-dashed transition-all duration-300 overflow-hidden cursor-pointer " +
                      (uploadedFile
                        ? "bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-500/10"
                        : isDragging
                          ? "bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/20"
                          : "bg-blue-500/5 border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5")
                    }
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.json"
                      onChange={onFileSelect}
                      className="hidden"
                    />
                    {uploadedFile ? (
                      <div className="p-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                            <Upload className="w-6 h-6 text-cyan-300" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-zinc-100 truncate">
                              {uploadedFile.name}
                            </div>
                            <div className="text-sm text-zinc-500">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          className="p-2 rounded-xl text-zinc-300 hover:text-zinc-100 hover:bg-white/10 transition-colors"
                          aria-label="Remove file"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="p-8 sm:p-10 text-center">
                        <Upload className="w-12 h-12 mx-auto text-blue-400/70 mb-3" />
                        <div className="text-zinc-200 font-semibold">
                          Drop your chat export here or click to browse
                        </div>
                        <div className="mt-1 text-sm text-zinc-500">
                          Supports .txt and .json from Telegram / WhatsApp
                          exports.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Paste zone */}
                {inputTab === "paste" && (
                  <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 overflow-hidden">
                    <textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder={
                        "Paste your conversation here...\n\nExample:\n[10:30] Alice: Hey, how are you?\n[10:31] Bob: I'm great!"
                      }
                      rows={8}
                      className="w-full bg-transparent text-zinc-100 placeholder-zinc-600 p-6 text-sm leading-relaxed focus:outline-none resize-y min-h-[160px] max-h-[400px]"
                    />
                    {pastedText.length > 0 && (
                      <div className="px-6 pb-4 flex items-center justify-between">
                        <span className="text-xs text-zinc-500">
                          {pastedText.length} characters
                        </span>
                        <button
                          type="button"
                          onClick={() => setPastedText("")}
                          className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Coach — standalone chat */}
                {inputTab === "coach" && (
                  <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 overflow-hidden">
                    <div className="p-5 border-b border-white/10">
                      <h3 className="text-lg font-bold text-zinc-100">AI Relationship Coach</h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        {contextText ? "Chatting with context from your last analysis." : "Ask any relationship or dating question."}
                      </p>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto p-5 space-y-4">
                      {chatMessages.length === 0 && (
                        <div className="text-center text-sm text-zinc-600 py-8">
                          Ask anything — &quot;How do I start a conversation?&quot;, &quot;Is double texting bad?&quot;
                        </div>
                      )}
                      {chatMessages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                            m.role === "user"
                              ? "bg-blue-500/20 text-zinc-100 border border-blue-500/30"
                              : "bg-white/5 text-zinc-300 border border-white/10"
                          }`}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                            <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t border-white/10">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                          placeholder="Ask the AI coach..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/40"
                        />
                        <button
                          type="button"
                          onClick={sendChat}
                          disabled={chatLoading || !chatInput.trim()}
                          className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white disabled:opacity-50 transition-opacity"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analyze button — only show for upload/paste tabs */}
                {inputTab !== "coach" && (
                  <div className="mt-5 flex flex-col sm:flex-row gap-3 sticky bottom-4 z-10">
                    <button
                      type="button"
                      onClick={runAnalysis}
                      disabled={!hasInput}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      Analyze
                      <ArrowRight className="h-5 w-5" />
                    </button>
                    <Link
                      href="/history"
                      className="inline-flex items-center justify-center rounded-2xl px-6 py-4 text-base font-semibold bg-white/5 border border-white/10 text-zinc-100 hover:bg-white/10 transition-all"
                    >
                      Past Reports
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* ════════ ANALYZING PHASE ════════ */}
            {phase === "analyzing" && (
              <motion.div
                key="analyzing"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mb-6" />
                <h2 className="text-2xl font-bold text-zinc-100">
                  Analyzing with AI...
                </h2>
                <p className="mt-2 text-zinc-500">
                  Gemini is reading your conversation. This takes 3-5 seconds.
                </p>
              </motion.div>
            )}

            {/* ════════ RESULTS PHASE ════════ */}
            {phase === "results" && analysisData && (
              <motion.div
                key="results"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
              >
                {/* Dashboard header */}
                <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-xl shadow-blue-500/20 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-100">
                        Analysis Dashboard
                      </h2>
                      <p className="mt-1 text-sm text-zinc-500">
                        Powered by Gemini AI
                      </p>
                      <span
                        className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          summary.toLowerCase().includes("high") ||
                          summary.toLowerCase().includes("mutual")
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : summary.toLowerCase().includes("cold") ||
                                summary.toLowerCase().includes("toxic")
                              ? "bg-red-500/15 text-red-300 border border-red-500/30"
                              : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {summary}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10 transition-all"
                    >
                      Analyze another chat
                    </button>
                  </div>

                  {/* Grid cards */}
                  <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Interest Score */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="rounded-2xl bg-white/5 border border-white/10 p-5"
                    >
                      <div className="text-sm font-semibold text-zinc-100">
                        Interest Score
                      </div>
                      <div className="mt-4 flex items-center gap-5">
                        <div className="relative w-28 h-28 flex-shrink-0">
                          <svg viewBox="0 0 120 120" className="w-28 h-28">
                            <circle
                              cx="60"
                              cy="60"
                              r="46"
                              stroke="rgba(255,255,255,0.10)"
                              strokeWidth="10"
                              fill="none"
                            />
                            <circle
                              cx="60"
                              cy="60"
                              r="46"
                              stroke="rgba(34,211,238,0.9)"
                              strokeWidth="10"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 46}`}
                              strokeDashoffset={`${2 * Math.PI * 46 * (1 - interestScore / 100)}`}
                              transform="rotate(-90 60 60)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-xl font-bold text-zinc-100">
                              {interestScore}%
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-zinc-400 leading-relaxed">
                          {interestScore >= 70
                            ? "High interest: fast replies, steady initiative, warm tone."
                            : interestScore >= 40
                              ? "Moderate interest. Some engagement but room to grow."
                              : "Low interest signals. Consider adjusting your approach."}
                        </div>
                      </div>
                    </motion.div>

                    {/* Initiative */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.05 }}
                      className="rounded-2xl bg-white/5 border border-white/10 p-5"
                    >
                      <div className="text-sm font-semibold text-zinc-100">
                        Who texts first?
                      </div>
                      <div className="mt-4 flex items-center gap-5">
                        <div className="relative w-28 h-28 flex-shrink-0">
                          <svg viewBox="0 0 120 120" className="w-28 h-28">
                            <circle
                              cx="60"
                              cy="60"
                              r="46"
                              fill="rgba(255,255,255,0.06)"
                            />
                            <circle
                              cx="60"
                              cy="60"
                              r="46"
                              fill="none"
                              stroke="rgba(99,102,241,0.85)"
                              strokeWidth="24"
                              strokeDasharray={`${2 * Math.PI * 46}`}
                              strokeDashoffset={`${2 * Math.PI * 46 * (1 - youFirst / 100)}`}
                              transform="rotate(-90 60 60)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-xs text-zinc-500">You</div>
                            <div className="text-lg font-bold text-zinc-100">
                              {youFirst}%
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-zinc-400">
                          <div className="flex items-center justify-between gap-6">
                            <span className="text-zinc-300">You</span>
                            <span className="text-indigo-200">{youFirst}%</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-6">
                            <span className="text-zinc-300">Partner</span>
                            <span className="text-cyan-200">
                              {partnerFirst}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Tone Timeline */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                      className="rounded-2xl bg-white/5 border border-white/10 p-5 lg:col-span-2"
                    >
                      <div className="text-sm font-semibold text-zinc-100">
                        Tone Timeline
                      </div>
                      <div className="mt-4 w-full rounded-2xl bg-black/20 border border-white/10 p-4">
                        <svg
                          viewBox="0 0 600 160"
                          className="w-full h-36"
                        >
                          <defs>
                            <linearGradient
                              id="tone"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              <stop
                                offset="0%"
                                stopColor="rgba(99,102,241,0.9)"
                              />
                              <stop
                                offset="100%"
                                stopColor="rgba(34,211,238,0.9)"
                              />
                            </linearGradient>
                          </defs>
                          {tonePoints.length > 0 && (
                            <>
                              <path
                                d={`M ${tonePoints
                                  .map(
                                    (v, i) =>
                                      `${20 + i * (560 / Math.max(tonePoints.length - 1, 1))} ${140 - v * 1.2}`
                                  )
                                  .join(" L ")}`}
                                fill="none"
                                stroke="url(#tone)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              {tonePoints.map((v, i) => (
                                <circle
                                  key={i}
                                  cx={
                                    20 +
                                    i *
                                      (560 /
                                        Math.max(tonePoints.length - 1, 1))
                                  }
                                  cy={140 - v * 1.2}
                                  r="5"
                                  fill="rgba(34,211,238,0.85)"
                                />
                              ))}
                            </>
                          )}
                        </svg>
                        <div className="mt-2 text-xs text-zinc-500">
                          Higher = warmer tone. Lower = colder tone.
                        </div>
                      </div>
                    </motion.div>

                    {/* AI Advice */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.15 }}
                      className="rounded-2xl bg-white/5 border border-white/10 p-5 lg:col-span-2"
                    >
                      <div className="text-sm font-semibold text-zinc-100">
                        AI Advice
                      </div>
                      <div className="mt-4 rounded-2xl bg-black/20 border border-white/10 p-4">
                        <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-300">
                          {advice.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* ── Chat with AI Assistant ── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="mt-6 rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 overflow-hidden"
                >
                  <div className="p-5 border-b border-white/10">
                    <h3 className="text-lg font-bold text-zinc-100">
                      Chat with AI Assistant
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Ask follow-up questions about the analyzed conversation.
                    </p>
                  </div>

                  {/* Messages */}
                  <div className="max-h-[360px] overflow-y-auto p-5 space-y-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-sm text-zinc-600 py-8">
                        Ask anything — &quot;How should I reply?&quot;, &quot;Is this a red
                        flag?&quot;, &quot;What should I do next?&quot;
                      </div>
                    )}
                    {chatMessages.map((m, i) => (
                      <div
                        key={i}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                            m.role === "user"
                              ? "bg-blue-500/20 text-zinc-100 border border-blue-500/30"
                              : "bg-white/5 text-zinc-300 border border-white/10"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                          <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendChat();
                          }
                        }}
                        placeholder="Ask about the conversation..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/40"
                      />
                      <button
                        type="button"
                        onClick={sendChat}
                        disabled={chatLoading || !chatInput.trim()}
                        className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white disabled:opacity-50 transition-opacity"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
