import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./ProfileForm";

type ProfileRow = {
  id: string;
  name: string | null;
  gender: string | null;
  bio: string | null;
  is_pro: boolean | null;
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const user = data.user;
  if (!user) redirect("/login?next=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, gender, bio, is_pro")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Profile</h1>
        <p className="text-zinc-500 mb-8">Manage your profile and preferences.</p>

        <ProfileForm
          email={user.email ?? ""}
          initialFullName={profile?.name ?? ""}
          initialGender={(profile?.gender as "male" | "female" | "other") ?? "other"}
          initialBio={profile?.bio ?? ""}
          isPro={!!profile?.is_pro}
        />
      </div>
    </div>
  );
}
