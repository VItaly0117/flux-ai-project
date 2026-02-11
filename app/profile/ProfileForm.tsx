"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { deleteAllData, updateProfile } from "./actions";

export function ProfileForm({ email, initialFullName }: { email: string; initialFullName: string }) {
  const [fullName, setFullName] = useState(initialFullName);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const onSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData();
    fd.set("fullName", fullName);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <User className="w-7 h-7 text-zinc-300" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-zinc-500">Avatar</div>
          <button
            type="button"
            className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10 transition-all"
          >
            Change Avatar
          </button>
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

        <div className="pt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-70 transition-all"
              style={{ animation: "gradient-shift 3s ease infinite" }}
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
