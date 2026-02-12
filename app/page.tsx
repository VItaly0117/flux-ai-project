"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Brain, FileUp, LineChart, MessageSquareText, Scale, Sparkles, Upload, X } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

type InputMode = "upload" | "paste";

export default function HomePage() {
  const [inputMode, setInputMode] = useState<InputMode>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".json") || file.name.endsWith(".txt"))) {
      setUploadedFile(file);
      toast.success("File uploaded");
    } else if (file) {
      toast.error("Unsupported file. Please upload .txt or .json");
    }
  }, [toast]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith(".json") || file.name.endsWith(".txt"))) {
      setUploadedFile(file);
      toast.success("File uploaded");
    } else if (file) {
      toast.error("Unsupported file. Please upload .txt or .json");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [toast]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const removeFile = () => setUploadedFile(null);

  const hasInput = inputMode === "upload" ? !!uploadedFile : pastedText.trim().length > 0;

  const runMockAnalysis = async () => {
    if (!hasInput) {
      toast.error(
        inputMode === "upload"
          ? "Please upload a .txt or .json file first"
          : "Please paste your conversation text first"
      );
      return;
    }

    try {
      if (inputMode === "upload" && uploadedFile) {
        if (uploadedFile.name.endsWith(".json")) {
          const text = await uploadedFile.text();
          JSON.parse(text);
        }
      }

      setHasAnalyzed(true);
      toast.success("Analysis complete");
    } catch {
      toast.error("Error parsing file");
    }
  };

  const reset = () => {
    setHasAnalyzed(false);
    setUploadedFile(null);
    setPastedText("");
  };

  const interestScore = 78;
  const youFirst = 62;
  const partnerFirst = 38;
  const tonePoints = [18, 24, 14, 32, 28, 42, 34, 48, 40, 56];

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-24 left-8 h-[420px] w-[420px] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute top-48 right-8 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <section className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Flux AI — communication analysis
            </div>

            <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-100">
              Decode Your Conversations
            </h1>
            <p className="mt-5 text-base sm:text-lg text-zinc-300 leading-relaxed">
              AI-powered analysis of your chat history. Detect hidden signals, initiative balance, and emotional tone.
            </p>

            <div className="mt-10">
              {/* Tab switcher */}
              <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-4 w-fit">
                <button
                  type="button"
                  onClick={() => setInputMode("upload")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    inputMode === "upload"
                      ? "bg-blue-500/20 text-cyan-300 border border-blue-500/30 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <FileUp className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("paste")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    inputMode === "paste"
                      ? "bg-blue-500/20 text-cyan-300 border border-blue-500/30 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <MessageSquareText className="w-4 h-4" />
                  Paste Text
                </button>
              </div>

              {/* Upload File mode */}
              {inputMode === "upload" && (
                <>
                  <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onClick={() => !uploadedFile && fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
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
                            <div className="font-medium text-zinc-100 truncate">{uploadedFile.name}</div>
                            <div className="text-sm text-zinc-500">{(uploadedFile.size / 1024).toFixed(1)} KB</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(); }}
                          className="p-2 rounded-xl text-zinc-300 hover:text-zinc-100 hover:bg-white/10 transition-colors"
                          aria-label="Remove file"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="p-8 sm:p-10 text-center">
                        <Upload className="w-12 h-12 mx-auto text-blue-400/70 mb-3" />
                        <div className="text-zinc-200 font-semibold">Drop your chat export here or click to browse</div>
                        <div className="mt-1 text-sm text-zinc-500">
                          Supports .txt and .json from Telegram / WhatsApp exports.
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Paste Text mode */}
              {inputMode === "paste" && (
                <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 overflow-hidden">
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={"Paste your conversation here...\n\nExample:\n[10:30] Alice: Hey, how are you?\n[10:31] Bob: I'm great! Just got back from a run."}
                    rows={8}
                    className="w-full bg-transparent text-zinc-100 placeholder-zinc-600 p-6 text-sm leading-relaxed focus:outline-none resize-y min-h-[160px] max-h-[400px]"
                  />
                  {pastedText.length > 0 && (
                    <div className="px-6 pb-4 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">{pastedText.length} characters</span>
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

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={runMockAnalysis}
                  disabled={!hasInput}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{ animation: "gradient-shift 3s ease infinite" }}
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
            </div>
          </motion.div>

          {hasAnalyzed ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
              className="mt-10"
            >
              <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-xl shadow-blue-500/20 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-100">Analysis Dashboard</h2>
                    <p className="mt-1 text-sm text-zinc-500">Mock results — real analysis will be plugged in later.</p>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10 transition-all"
                  >
                    Analyze another chat
                  </button>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-2xl bg-white/5 border border-white/10 p-5"
                  >
                    <div className="text-sm font-semibold text-zinc-100">Interest Score</div>
                    <div className="mt-4 flex items-center gap-5">
                      <div className="relative w-28 h-28">
                        <svg viewBox="0 0 120 120" className="w-28 h-28">
                          <circle cx="60" cy="60" r="46" stroke="rgba(255,255,255,0.10)" strokeWidth="10" fill="none" />
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
                          <div className="text-xl font-bold text-zinc-100">{interestScore}%</div>
                        </div>
                      </div>
                      <div className="text-sm text-zinc-400 leading-relaxed">
                        High interest indicators: fast replies, steady initiative, and warm tone.
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 }}
                    className="rounded-2xl bg-white/5 border border-white/10 p-5"
                  >
                    <div className="text-sm font-semibold text-zinc-100">Who texts first?</div>
                    <div className="mt-4 flex items-center gap-5">
                      <div className="relative w-28 h-28">
                        <svg viewBox="0 0 120 120" className="w-28 h-28">
                          <circle cx="60" cy="60" r="46" fill="rgba(255,255,255,0.06)" />
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
                          <circle
                            cx="60"
                            cy="60"
                            r="46"
                            fill="none"
                            stroke="rgba(34,211,238,0.75)"
                            strokeWidth="24"
                            strokeDasharray={`${2 * Math.PI * 46}`}
                            strokeDashoffset={`${2 * Math.PI * 46}`}
                            transform={`rotate(${(youFirst / 100) * 360 - 90} 60 60)`}
                            opacity="0"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-xs text-zinc-500">You</div>
                          <div className="text-lg font-bold text-zinc-100">{youFirst}%</div>
                        </div>
                      </div>

                      <div className="text-sm text-zinc-400">
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-zinc-300">You</span>
                          <span className="text-indigo-200">{youFirst}%</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-6">
                          <span className="text-zinc-300">Partner</span>
                          <span className="text-cyan-200">{partnerFirst}%</span>
                        </div>
                        <div className="mt-3 text-xs text-zinc-500">(Mock pie representation)</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="rounded-2xl bg-white/5 border border-white/10 p-5 lg:col-span-2"
                  >
                    <div className="text-sm font-semibold text-zinc-100">Tone Timeline</div>
                    <div className="mt-4">
                      <div className="w-full rounded-2xl bg-black/20 border border-white/10 p-4">
                        <svg viewBox="0 0 600 160" className="w-full h-36">
                          <defs>
                            <linearGradient id="tone" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="rgba(99,102,241,0.9)" />
                              <stop offset="100%" stopColor="rgba(34,211,238,0.9)" />
                            </linearGradient>
                          </defs>
                          <path
                            d={`M 20 ${140 - tonePoints[0]} ${tonePoints
                              .map((v, i) => `L ${20 + i * 60} ${140 - v}`)
                              .join(" ")}`}
                            fill="none"
                            stroke="url(#tone)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {tonePoints.map((v, i) => (
                            <circle key={i} cx={20 + i * 60} cy={140 - v} r="5" fill="rgba(34,211,238,0.85)" />
                          ))}
                        </svg>
                        <div className="mt-2 text-xs text-zinc-500">
                          Higher = warmer tone. Lower = colder tone. (Mock sentiment)
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="rounded-2xl bg-white/5 border border-white/10 p-5 lg:col-span-2"
                  >
                    <div className="text-sm font-semibold text-zinc-100">AI Advice</div>
                    <div className="mt-4 rounded-2xl bg-black/20 border border-white/10 p-4">
                      <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-300">
                        <li>You are asking too many questions in a row — add statements and playful hooks.</li>
                        <li>Partner responds with shorter answers when the topic becomes logistical.</li>
                        <li>Try matching their response length for 3–5 messages and see if engagement improves.</li>
                        <li>When they use emojis, your best-performing replies mirror tone + timing.</li>
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : null}

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
            className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <LineChart className="h-5 w-5 text-cyan-300" />
                </div>
                <div className="font-semibold text-zinc-100">Sentiment Analysis</div>
              </div>
              <div className="mt-3 text-sm text-zinc-400">Track emotional tone shifts and intensity over time.</div>
            </div>
            <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-indigo-300" />
                </div>
                <div className="font-semibold text-zinc-100">Initiative Balance</div>
              </div>
              <div className="mt-3 text-sm text-zinc-400">See who leads the conversation and when it flips.</div>
            </div>
            <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-blue-300" />
                </div>
                <div className="font-semibold text-zinc-100">Psychological Insights</div>
              </div>
              <div className="mt-3 text-sm text-zinc-400">Red flags, attachment cues, and communication patterns.</div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100">What does it analyze?</h2>
              <p className="mt-4 text-zinc-300 leading-relaxed">
                Flux AI helps you understand your conversation dynamics from exported chat history. It’s designed to
                highlight emotional tone, initiative balance, and subtle signals you might miss.
              </p>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Upload a .txt or .json export and get a structured report you can revisit later.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <div className="text-sm font-semibold text-zinc-100">Tone tracking</div>
                <div className="mt-2 text-sm text-zinc-400">Spot mood swings and emotional spikes.</div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <div className="text-sm font-semibold text-zinc-100">Initiative insights</div>
                <div className="mt-2 text-sm text-zinc-400">Who starts, who sustains, who fades.</div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <div className="text-sm font-semibold text-zinc-100">Red flags</div>
                <div className="mt-2 text-sm text-zinc-400">Surface patterns that may signal problems.</div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <div className="text-sm font-semibold text-zinc-100">Mobile-first UX</div>
                <div className="mt-2 text-sm text-zinc-400">Safe-area padding, big buttons, smooth navigation.</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
