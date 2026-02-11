"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createProfile() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }

  const user = data.user;
  if (!user) {
    redirect("/login");
  }

  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert({ id: user.id }, { onConflict: "id" });

  if (upsertError) {
    throw upsertError;
  }

  redirect("/settings");
}
