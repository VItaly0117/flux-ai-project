"use client";

import { motion } from "framer-motion";
import {
  Users,
  Crown,
  Shield,
  ToggleLeft,
  Loader2,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

interface ProfileRow {
  id: string;
  name: string | null;
  role: string | null;
  is_pro: boolean | null;
  gender: string | null;
  created_at: string | null;
}

interface Feature {
  id: string;
  label: string;
  enabled: boolean;
}

const DEFAULT_FEATURES: Feature[] = [
  { id: "beta_chat", label: "Beta Chat Mode", enabled: true },
  { id: "telegram_upload", label: "Telegram Context Upload", enabled: true },
  { id: "premium_tone", label: "Premium Tone Detection", enabled: false },
];

function loadFeatures(): Feature[] {
  if (typeof window === "undefined") return DEFAULT_FEATURES;
  try {
    const raw = localStorage.getItem("flux_admin_features");
    if (raw) return JSON.parse(raw) as Feature[];
  } catch { /* ignore */ }
  return DEFAULT_FEATURES;
}

function saveFeatures(features: Feature[]) {
  try {
    localStorage.setItem("flux_admin_features", JSON.stringify(features));
  } catch { /* ignore */ }
}

export default function AdminDashboardPage() {
  const { isLoading } = useAuth();
  const toast = useToast();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<Feature[]>(DEFAULT_FEATURES);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Load features from localStorage on mount
  useEffect(() => {
    setFeatures(loadFeatures());
  }, []);

  // Fetch users via admin API
  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      if (res.ok) {
        setProfiles(data.profiles ?? []);
      } else {
        toast.error(data.error || "Failed to load users");
      }
    } catch {
      toast.error("Network error loading users");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchProfiles();
  }, [fetchProfiles]);

  const totalUsers = profiles.length;
  const proUsers = profiles.filter((p) => p.is_pro).length;

  const toggleFeature = (id: string) => {
    setFeatures((prev) => {
      const updated = prev.map((f) =>
        f.id === id ? { ...f, enabled: !f.enabled } : f
      );
      saveFeatures(updated);
      return updated;
    });
  };

  const updateUser = async (
    userId: string,
    updates: { role?: string; is_pro?: boolean }
  ) => {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, updates }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("User updated");
        await fetchProfiles();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin inline-block" />
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

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
            <p className="text-2xl font-bold text-zinc-100">
              {loading ? "..." : totalUsers}
            </p>
          </div>
          <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-zinc-500">Pro Users</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">
              {loading ? "..." : proUsers}
            </p>
          </div>
          <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span className="text-sm text-zinc-500">Free Users</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">
              {loading ? "..." : totalUsers - proUsers}
            </p>
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
            <h2 className="text-lg font-semibold text-zinc-100">
              User Management
            </h2>
            <p className="text-sm text-zinc-500">
              {totalUsers} registered users — click a row to manage
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No users found. Check RLS policies or Supabase connection.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => {
                    const plan =
                      p.role === "admin"
                        ? "Admin"
                        : p.is_pro
                          ? "Pro"
                          : "Free";
                    const isExpanded = expandedUser === p.id;
                    const isActing = actionLoading === p.id;

                    return (
                      <>
                        <tr
                          key={p.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() =>
                            setExpandedUser(isExpanded ? null : p.id)
                          }
                        >
                          <td className="px-6 py-4 text-zinc-200">
                            {p.name || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-medium ${plan === "Admin"
                                  ? "bg-indigo-500/20 text-indigo-400"
                                  : plan === "Pro"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-zinc-500/20 text-zinc-400"
                                }`}
                            >
                              {plan}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-500 text-xs">
                            {p.role || "user"}
                          </td>
                          <td className="px-6 py-4 text-zinc-500 text-xs">
                            {p.created_at
                              ? new Date(p.created_at).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-6 py-4">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-zinc-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-zinc-400" />
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr
                            key={`${p.id}-actions`}
                            className="border-b border-white/5"
                          >
                            <td colSpan={5} className="px-6 py-4">
                              <div className="flex flex-wrap gap-3">
                                {/* Toggle Pro */}
                                <button
                                  type="button"
                                  disabled={isActing}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateUser(p.id, {
                                      is_pro: !p.is_pro,
                                    });
                                  }}
                                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${p.is_pro
                                      ? "bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20"
                                      : "bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                                    }`}
                                >
                                  {p.is_pro ? (
                                    <UserX className="w-4 h-4" />
                                  ) : (
                                    <UserCheck className="w-4 h-4" />
                                  )}
                                  {p.is_pro
                                    ? "Remove Pro"
                                    : "Grant Pro"}
                                </button>

                                {/* Toggle Admin */}
                                <button
                                  type="button"
                                  disabled={isActing}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateUser(p.id, {
                                      role:
                                        p.role === "admin"
                                          ? "user"
                                          : "admin",
                                    });
                                  }}
                                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${p.role === "admin"
                                      ? "bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                                      : "bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                                    }`}
                                >
                                  <Shield className="w-4 h-4" />
                                  {p.role === "admin"
                                    ? "Revoke Admin"
                                    : "Make Admin"}
                                </button>

                                {isActing && (
                                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400 self-center" />
                                )}
                              </div>
                              <div className="mt-2 text-xs text-zinc-600">
                                ID: {p.id} · Gender: {p.gender || "—"}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
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
            <h2 className="text-lg font-semibold text-zinc-100">
              Feature Toggles
            </h2>
            <span className="text-xs text-zinc-600 ml-2">
              (saved to browser)
            </span>
          </div>
          <div className="space-y-4">
            {features.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
              >
                <span className="text-zinc-200">{f.label}</span>
                <button
                  type="button"
                  onClick={() => toggleFeature(f.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${f.enabled ? "bg-blue-500" : "bg-zinc-600"
                    }`}
                >
                  <motion.span
                    layout
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                    style={{ left: f.enabled ? "26px" : "4px" }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
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
