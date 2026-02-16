/**
 * Admin API — server-side endpoint for admin operations.
 * GET  → list all profiles (bypasses RLS via server client)
 * PATCH → update a user's role or is_pro status
 */

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const ADMIN_EMAILS = ["admin@flux.com", "boss@flux.com"];
    if (user.email && ADMIN_EMAILS.includes(user.email)) return user;

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profile?.role === "admin") return user;
    return null;
}

export async function GET() {
    try {
        const supabase = await createClient();
        const admin = await verifyAdmin(supabase);
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("id, name, role, is_pro, gender, bio, created_at")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[Admin API] GET profiles error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ profiles: data ?? [] });
    } catch (err) {
        console.error("[Admin API] GET error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const admin = await verifyAdmin(supabase);
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const { userId, updates } = body as {
            userId: string;
            updates: { role?: string; is_pro?: boolean };
        };

        if (!userId || !updates || Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "Missing userId or updates" }, { status: 400 });
        }

        // Only allow safe fields
        const safeUpdates: Record<string, unknown> = {};
        if (typeof updates.role === "string") safeUpdates.role = updates.role;
        if (typeof updates.is_pro === "boolean") safeUpdates.is_pro = updates.is_pro;

        if (Object.keys(safeUpdates).length === 0) {
            return NextResponse.json({ error: "No valid updates" }, { status: 400 });
        }

        const { error } = await supabase
            .from("profiles")
            .update(safeUpdates)
            .eq("id", userId);

        if (error) {
            console.error("[Admin API] PATCH error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[Admin API] PATCH error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
