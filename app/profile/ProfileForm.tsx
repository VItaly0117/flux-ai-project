"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Crown, User } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { deleteAllData, updateProfile } from "./actions";
import Link from "next/link";

type Gender = "male" | "female" | "other";

interface ProfileFormProps {
  email: string;
  initialFullName: string;
  initialGender: Gender;
  initialBio: string;
  isPro: boolean;
}

export function ProfileForm({ email, initialFullName, initialGender, initialBio, isPro }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [gender, setGender] = useState<Gender>(initialGender);
  const [bio, setBio] = useState(initialBio);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const onSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData();
    fd.set("fullName", fullName);
    fd.set("gender", gender);
    fd.set("bio", bio);

    startTransition(async () => {
      try {
        await updateProfile(fd);
        toast.success("Profile saved");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save";
        toast.error(message);
      }
    });
  };

  const onDeleteAllData = () => {
    const ok = window.confirm("Delete all your data? This cannot be undone.");
    if (!ok) return;

    startTransition(async () => {
      try {
        await deleteAllData();
        toast.success("All data deleted");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete";
        toast.error(message);
      }
    });
  };

  const genderOpts: { val: Gender; lbl: string }[] = [
    { val: "male", lbl: "Male" },
    { val: "female", lbl: "Female" },
    { val: "other", lbl: "Other" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <User className="w-7 h-7 text-zinc-300" />
          </div>
          <div>
            <div className="text-sm text-zinc-500">Plan</div>
            <div className="mt-1 flex items-center gap-2">
              {isPro ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-sm font-semibold text-cyan-300">
                  <Crown className="w-3.5 h-3.5" /> Pro
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-400">
                  Free
                </span>
              )}
              {!isPro && (
                <Link href="/pricing" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                  Upgrade
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={onSave} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
          <input
            value={email}
            readOnly
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">User Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="How AI should address you"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Gender</label>
          <div className="flex rounded-xl bg-white/5 border border-white/10 p-1">
            {genderOpts.map((o) => (
              <button
                key={o.val}
                type="button"
                onClick={() => setGender(o.val)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  gender === o.val
                    ? "bg-blue-500/20 text-cyan-300 border border-blue-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {o.lbl}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a bit about yourself..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all resize-none"
          />
        </div>

        <div className="pt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-70 transition-all"
            >
              {isPending ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={onDeleteAllData}
              disabled={isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 hover:bg-red-500/10 hover:border-red-500/20 transition-all disabled:opacity-70"
            >
              Delete All Data
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
