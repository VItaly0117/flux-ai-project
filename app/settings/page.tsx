import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LogOut, Shield, User } from "lucide-react";
import { createProfile, signOut } from "./actions";

type ProfileRow = {
  id: string;
  role?: string | null;
  credits?: number | null;
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Profile</h1>
          <p className="text-zinc-500 mb-8">Manage your FLUX account.</p>

          <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
              {userError.message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const user = userData.user;
  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  const email = user.email ?? "—";
  const role = (profile?.role ?? "user").toString().toLowerCase();
  const isAdmin = role === "admin";
  const creditsLabel = typeof profile?.credits === "number" ? profile.credits : "—";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Profile</h1>
        <p className="text-zinc-500 mb-8">Manage your FLUX account.</p>

        <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6 space-y-6">
          {profileError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
              {profileError.message}
            </div>
          ) : !profile ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-zinc-200 space-y-3">
              <div className="font-medium">Profile missing</div>
              <div className="text-sm text-zinc-500">
                Your account exists, but the profile row was not found. You can create it now.
              </div>
              <form action={createProfile}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-400/30 text-blue-200 hover:bg-blue-500/15 hover:border-blue-300/40 transition-all"
                >
                  <User className="w-5 h-5" />
                  Create Profile
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-zinc-100 truncate">{email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={
                      isAdmin
                        ? "inline-flex items-center gap-1 rounded-full border border-blue-400/30 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-200"
                        : "inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-200"
                    }
                  >
                    <Shield className={isAdmin ? "h-3.5 w-3.5" : "h-3.5 w-3.5 opacity-70"} />
                    {isAdmin ? "Admin" : "User"}
                  </span>
                  <span className="text-sm text-zinc-500">
                    Credits: <span className="text-zinc-200">{creditsLabel}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-zinc-100 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
