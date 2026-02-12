"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Brain, LineChart, MessageCircle, Scale, Shield, Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const { user } = useAuth();
  const ctaHref = user ? "/dashboard" : "/login";

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-40 -left-20 h-[500px] w-[500px] rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute top-60 -right-20 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 mb-8">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              AI-Powered Relationship Intelligence
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-100 leading-[1.1]">
              Master Your<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Relationships with AI
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Upload any chat export and get instant analysis — interest levels, initiative balance,
              emotional tone, psychology insights, and personalized dating advice.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-white/10 hover:shadow-blue-500/40 transition-shadow"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10 transition-all"
              >
                See Features
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { val: "10k+", label: "Chats Analyzed" },
              { val: "95%", label: "Accuracy Rate" },
              { val: "3s", label: "Avg Analysis Time" },
              { val: "Free", label: "To Get Started" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
                <div className="text-2xl font-bold text-cyan-300">{s.val}</div>
                <div className="mt-1 text-xs text-zinc-500">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 text-center">
              Everything You Need to Understand Your Chats
            </h2>
            <p className="mt-4 text-zinc-400 text-center max-w-2xl mx-auto">
              Flux AI combines advanced NLP with relationship psychology to give you actionable insights.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[
              { icon: LineChart, color: "cyan", title: "Sentiment Timeline", desc: "Track emotional warmth and mood shifts message by message." },
              { icon: Scale, color: "indigo", title: "Initiative Balance", desc: "See who drives the conversation — who texts first, who asks questions." },
              { icon: Brain, color: "blue", title: "Deep Psychology", desc: "Detect attachment styles, red flags, and hidden communication patterns." },
              { icon: MessageCircle, color: "emerald", title: "AI Chat Assistant", desc: "Ask follow-up questions — 'How should I reply?' — with full context." },
              { icon: Shield, color: "amber", title: "Privacy First", desc: "Your chats are analyzed in real-time. Nothing is stored permanently." },
              { icon: Zap, color: "violet", title: "Instant Results", desc: "Get a full analysis dashboard in under 5 seconds, powered by Gemini." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-${f.color}-500/10 border border-${f.color}-500/20 flex items-center justify-center`}>
                    <f.icon className={`h-5 w-5 text-${f.color}-300`} />
                  </div>
                  <div className="font-semibold text-zinc-100">{f.title}</div>
                </div>
                <div className="mt-3 text-sm text-zinc-400">{f.desc}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 text-center">How It Works</h2>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { step: "01", title: "Upload or Paste", desc: "Drop a .txt or .json export, or paste your conversation directly." },
              { step: "02", title: "AI Analyzes", desc: "Gemini AI processes dynamics, tone, initiative, and psychology patterns." },
              { step: "03", title: "Get Insights", desc: "View your dashboard, read advice, and chat with the AI for follow-ups." },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
                <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{s.step}</div>
                <div className="mt-3 text-lg font-semibold text-zinc-100">{s.title}</div>
                <div className="mt-2 text-sm text-zinc-400">{s.desc}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100">Ready to Decode Your Conversations?</h2>
            <p className="mt-4 text-zinc-400">Start your first analysis in under 30 seconds. No credit card required.</p>
            <Link
              href={ctaHref}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 border border-white/10 hover:shadow-blue-500/40 transition-shadow"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
