"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

const FREE_FEATURES = [
  "Basic Analysis",
  "3 reports per day",
  "Sentiment timeline",
  "Initiative balance",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Deep Psychology Mode",
  "Sarcasm Detection",
  "Unlimited Reports",
  "Priority AI Chat",
  "Dating Advice Engine",
];

export default function PricingPage() {
  const { user, isLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const toast = useToast();
  const [upgrading, setUpgrading] = useState(false);

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

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("Please log in first.");
      return;
    }
    setUpgrading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_pro: true })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Upgraded to Pro! Refresh to see changes.");
    } catch {
      toast.error("Upgrade failed. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  const isPro = user?.is_pro;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100">Choose Your Plan</h1>
          <p className="mt-3 text-zinc-400">Unlock the full power of AI relationship analysis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl backdrop-blur-2xl bg-white/5 border border-white/10 p-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-zinc-400" />
              <h2 className="text-xl font-bold text-zinc-100">Free</h2>
            </div>
            <div className="mt-2">
              <span className="text-4xl font-extrabold text-zinc-100">$0</span>
              <span className="text-zinc-500 ml-1">/month</span>
            </div>
            <ul className="mt-6 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-medium text-center text-sm">
                Current Plan
              </div>
            </div>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-blue-500/30 shadow-lg shadow-blue-500/10 p-8 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs font-semibold text-cyan-300">
              POPULAR
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-zinc-100">Pro</h2>
            </div>
            <div className="mt-2">
              <span className="text-4xl font-extrabold text-zinc-100">$9.99</span>
              <span className="text-zinc-500 ml-1">/month</span>
            </div>
            <ul className="mt-6 space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-200">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {isPro ? (
                <div className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium text-center text-sm">
                  Active
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-70 transition-all text-sm"
                >
                  {upgrading ? "Upgrading..." : "Upgrade to Pro"}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
