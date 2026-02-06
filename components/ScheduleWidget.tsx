"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Atom,
  BookOpen,
  Code2,
  Calculator,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
type ClassType = "Lecture" | "Practice";

interface ScheduleEntry {
  id: string;
  day: DayKey;
  time: string;
  subject: string;
  room: string;
  type: ClassType;
  icon: LucideIcon;
}

const DAY_ORDER: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_INDEX: Record<DayKey, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4 };

const MOCK_SCHEDULE: ScheduleEntry[] = [
  { id: "1", day: "Mon", time: "09:00", subject: "Theoretical Mechanics", room: "A-201", type: "Lecture", icon: Atom },
  { id: "2", day: "Mon", time: "11:00", subject: "Calculus", room: "B-105", type: "Practice", icon: Calculator },
  { id: "3", day: "Mon", time: "14:00", subject: "Lab Work", room: "Lab-3", type: "Practice", icon: FlaskConical },
  { id: "4", day: "Tue", time: "10:00", subject: "Vector Analysis", room: "A-301", type: "Lecture", icon: BookOpen },
  { id: "5", day: "Tue", time: "12:00", subject: "Python OOP", room: "C-102", type: "Practice", icon: Code2 },
  { id: "6", day: "Wed", time: "09:00", subject: "Calculus", room: "A-201", type: "Lecture", icon: Calculator },
  { id: "7", day: "Wed", time: "11:00", subject: "Theoretical Mechanics", room: "B-105", type: "Practice", icon: Atom },
  { id: "8", day: "Thu", time: "10:00", subject: "Python OOP", room: "C-102", type: "Lecture", icon: Code2 },
  { id: "9", day: "Thu", time: "14:00", subject: "Vector Analysis", room: "B-105", type: "Practice", icon: BookOpen },
  { id: "10", day: "Fri", time: "09:00", subject: "Lab Work", room: "Lab-3", type: "Practice", icon: FlaskConical },
  { id: "11", day: "Fri", time: "11:00", subject: "Calculus", room: "A-301", type: "Practice", icon: Calculator },
];

// Simulated "current" time for demo: Tuesday 10:30 (during Vector Analysis)
const SIMULATED_NOW = { day: "Tue" as DayKey, hour: 10, minute: 30 };

function isCurrentClass(entry: ScheduleEntry): boolean {
  const [startH, startM] = entry.time.split(":").map(Number);
  const endH = startH + 1; // Assume 1-hour slots
  const endM = startM;

  const isSameDay = entry.day === SIMULATED_NOW.day;
  const isAfterStart = SIMULATED_NOW.hour > startH || (SIMULATED_NOW.hour === startH && SIMULATED_NOW.minute >= startM);
  const isBeforeEnd = SIMULATED_NOW.hour < endH || (SIMULATED_NOW.hour === endH && SIMULATED_NOW.minute < endM);

  return isSameDay && isAfterStart && isBeforeEnd;
}

export function ScheduleWidget() {
  const [tab, setTab] = useState<"today" | "week">("today");

  const todayEntries = useMemo(() => {
    return MOCK_SCHEDULE.filter((e) => e.day === SIMULATED_NOW.day).sort(
      (a, b) => a.time.localeCompare(b.time)
    );
  }, []);

  const weekEntries = useMemo(() => {
    return [...MOCK_SCHEDULE].sort(
      (a, b) => DAY_INDEX[a.day] - DAY_INDEX[b.day] || a.time.localeCompare(b.time)
    );
  }, []);

  const entries = tab === "today" ? todayEntries : weekEntries;

  return (
    <div className="rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/10 p-1">
        {(["today", "week"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              tab === t
                ? "bg-white/10 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
          >
            {t === "today" ? "Today" : "Full Week"}
          </button>
        ))}
      </div>

      {/* Grid of cards */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {entries.map((entry) => {
              const current = isCurrentClass(entry);
              const Icon = entry.icon;
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`
                    rounded-xl p-4 backdrop-blur-md bg-white/5 border transition-all duration-300
                    ${current ? "border-cyan-500/50 shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-500/30" : "border-white/10 hover:border-white/20"}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${current ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-zinc-400"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-zinc-100 truncate">{entry.subject}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {entry.time} · {entry.room} · {entry.type}
                      </p>
                      {tab === "week" && (
                        <span className="inline-block mt-1.5 text-[10px] font-medium text-violet-400/80 bg-violet-500/10 px-2 py-0.5 rounded">
                          {entry.day}
                        </span>
                      )}
                    </div>
                  </div>
                  {current && (
                    <div className="mt-2 h-0.5 w-8 rounded-full bg-cyan-500/60" />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
