/**
 * Repository: profiles table
 * Pure CRUD — no business logic.
 * Accepts a Supabase server client via Dependency Injection.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/types/db";

export async function getUserById(
    client: SupabaseClient,
    id: string
): Promise<Profile | null> {
    const { data, error } = await client
        .from("profiles")
        .select("id, role, name, gender, bio, is_pro")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        console.error("[userRepository] getUserById error:", error.message);
        return null;
    }
    return (data as Profile) ?? null;
}

export async function updateUserProStatus(
    client: SupabaseClient,
    id: string,
    isPro: boolean
): Promise<boolean> {
    const { error } = await client
        .from("profiles")
        .update({ is_pro: isPro })
        .eq("id", id);

    if (error) {
        console.error("[userRepository] updateUserProStatus error:", error.message);
        return false;
    }
    return true;
}

export async function getProfileByEmail(
    client: SupabaseClient,
    email: string
): Promise<Profile | null> {
    // Profiles table uses auth user id as pk; to find by email we need
    // to look up the auth user first, then fetch the profile.
    // This is a convenience method for admin workflows.
    const { data: authData, error: authError } = await client.auth.admin.listUsers();

    if (authError || !authData?.users) {
        console.error("[userRepository] getProfileByEmail auth lookup error:", authError?.message);
        return null;
    }

    const authUser = authData.users.find((u) => u.email === email);
    if (!authUser) return null;

    return getUserById(client, authUser.id);
}
