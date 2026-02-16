/**
 * Repository: reports table
 * Pure CRUD — no business logic.
 * Accepts a Supabase server client via Dependency Injection.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Report, ReportInsert } from "@/types/db";

export async function createReport(
    client: SupabaseClient,
    data: ReportInsert
): Promise<Report | null> {
    const { data: row, error } = await client
        .from("reports")
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error("[reportRepository] createReport error:", error.message);
        return null;
    }
    return row as Report;
}

export async function getReportsByUserId(
    client: SupabaseClient,
    userId: string
): Promise<Report[]> {
    const { data, error } = await client
        .from("reports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[reportRepository] getReportsByUserId error:", error.message);
        return [];
    }
    return (data as Report[]) ?? [];
}

export async function getReportById(
    client: SupabaseClient,
    reportId: string
): Promise<Report | null> {
    const { data, error } = await client
        .from("reports")
        .select("*")
        .eq("id", reportId)
        .maybeSingle();

    if (error) {
        console.error("[reportRepository] getReportById error:", error.message);
        return null;
    }
    return (data as Report) ?? null;
}
