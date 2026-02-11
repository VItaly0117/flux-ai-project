"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const fullName = (formData.get("fullName")?.toString() ?? "").trim();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  const user = data.user;
  if (!user) redirect("/login");

  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, name: fullName || null }, { onConflict: "id" });

  if (upsertError) throw upsertError;

  return { ok: true } as const;
}

export async function deleteAllData() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  const user = data.user;
  if (!user) redirect("/login");

  const { error: deleteError } = await supabase.from("profiles").delete().eq("id", user.id);
  if (deleteError) throw deleteError;

  return { ok: true } as const;
}
