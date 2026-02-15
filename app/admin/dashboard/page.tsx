"use client";

import { motion } from "framer-motion";
import { Users, Crown, Shield, ToggleLeft, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface ProfileRow {
  id: string;
  name: string | null;
  role: string | null;
  is_pro: boolean | null;
  created_at: string | null;
}

const FEATURES_INIT = [
  { id: "beta_chat", label: "Beta Chat Mode", enabled: true },
  { id: "telegram_upload", label: "Telegram Context Upload", enabled: true },
  { id: "premium_tone", label: "Premium Tone Detection", enabled: false },
];

export default function AdminDashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState(FEATURES_INIT);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, name, role, is_pro, created_at")
        .order("created_at", { ascending: false });
      setProfiles((data as ProfileRow[]) ?? []);
      setLoading(false);
    };
    void load();
  }, [supabase]);

  const totalUsers = profiles.length;
  const proUsers = profiles.filter((p) => p.is_pro).length;

  const toggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <Shield className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Admin Dashboard</h1>
            <p className="text-zinc-500">Manage users and features</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-zinc-500">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{loading ? "..." : totalUsers}</p>
          </div>
          <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-zinc-500">Pro Users</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{loading ? "..." : proUsers}</p>
          </div>
          <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span className="text-sm text-zinc-500">Free Users</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{loading ? "..." : totalUsers - proUsers}</p>
          </div>
        </motion.div>

        {/* User Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold text-zinc-100">User Management</h2>
            <p className="text-sm text-zinc-500">{totalUsers} registered users</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Plan</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => {
                    const plan = p.role === "admin" ? "Admin" : p.is_pro ? "Pro" : "Free";
                    return (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-zinc-200">{p.name || "—"}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              plan === "Admin"
                                ? "bg-indigo-500/20 text-indigo-400"
                                : plan === "Pro"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-zinc-500/20 text-zinc-400"
                            }`}
                          >
                            {plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 text-xs">{p.role || "user"}</td>
                        <td className="px-6 py-4 text-zinc-500 text-xs">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Feature Toggles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <ToggleLeft className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Feature Toggles</h2>
          </div>
          <div className="space-y-4">
            {features.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
              >
                <span className="text-zinc-200">{f.label}</span>
                <button
                  onClick={() => toggleFeature(f.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    f.enabled ? "bg-blue-500" : "bg-zinc-600"
                  }`}
                >
                  <motion.span
                    layout
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                    style={{ left: f.enabled ? "26px" : "4px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
