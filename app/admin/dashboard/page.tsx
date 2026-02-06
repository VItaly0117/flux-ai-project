"use client";

import { motion } from "framer-motion";
import { Users, DollarSign, Shield, ToggleLeft } from "lucide-react";
import { useState } from "react";

const MOCK_USERS = [
  { id: "1", email: "user1@example.com", plan: "Free", joined: "2024-01-15" },
  { id: "2", email: "user2@example.com", plan: "Pro", joined: "2024-02-20" },
  { id: "3", email: "user3@example.com", plan: "Free", joined: "2024-03-10" },
  { id: "4", email: "admin@flux.app", plan: "Admin", joined: "2024-01-01" },
];

const MOCK_FEATURES = [
  { id: "beta_chat", label: "Beta Chat Mode", enabled: true },
  { id: "telegram_upload", label: "Telegram Context Upload", enabled: true },
  { id: "premium_tone", label: "Premium Tone Detection", enabled: false },
];

export default function AdminDashboardPage() {
  const [features, setFeatures] = useState(MOCK_FEATURES);

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
            <p className="text-2xl font-bold text-zinc-100">1,247</p>
          </div>
          <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-zinc-500">Revenue (MTD)</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">$12,840</p>
          </div>
          <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span className="text-sm text-zinc-500">Pro Users</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">312</p>
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
            <p className="text-sm text-zinc-500">Recent users</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-zinc-200">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          u.plan === "Admin"
                            ? "bg-indigo-500/20 text-indigo-400"
                            : u.plan === "Pro"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-zinc-500/20 text-zinc-400"
                        }`}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
