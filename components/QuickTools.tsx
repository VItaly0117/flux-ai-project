"use client";

import { motion } from "framer-motion";
import { FileText, ArrowLeftRight, CalendarClock } from "lucide-react";

const tools = [
  {
    id: "formula",
    label: "Formula Cheat Sheet",
    icon: FileText,
    href: "#",
  },
  {
    id: "converter",
    label: "Unit Converter",
    icon: ArrowLeftRight,
    href: "#",
  },
];

// Exam in ~3 weeks for demo
const EXAM_DAYS_LEFT = 21;
const EXAM_TOTAL_DAYS = 30;
const EXAM_PROGRESS = Math.min(100, ((EXAM_TOTAL_DAYS - EXAM_DAYS_LEFT) / EXAM_TOTAL_DAYS) * 100);

export function QuickTools() {
  return (
    <div className="flex flex-col gap-3">
      {tools.map((tool, index) => {
        const Icon = tool.icon;
        return (
          <motion.a
            key={tool.id}
            href={tool.href}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-4 rounded-xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-violet-500/30 hover:bg-white/[0.07] transition-all duration-200 cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-violet-500/20 text-zinc-400 group-hover:text-violet-400 transition-colors">
              <Icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-zinc-200 group-hover:text-zinc-100">{tool.label}</span>
          </motion.a>
        );
      })}

      {/* Exam Countdown - visual progress bar */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl backdrop-blur-md bg-white/5 border border-white/10"
      >
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock className="w-5 h-5 text-cyan-400" />
          <span className="font-medium text-zinc-200">Exam Countdown</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Days left</span>
            <span className="text-cyan-400 font-semibold">{EXAM_DAYS_LEFT} days</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${EXAM_PROGRESS}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
