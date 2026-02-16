/**
 * Analysis Service — orchestrates the analyze-chat workflow.
 * Coordinates: pro-gate checks → AI call → DB persistence.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnalyzeChatRequest, AnalysisResult } from "@/types/dto";
import * as aiService from "@/services/aiService";
import * as reportRepo from "@/repositories/reportRepository";
import { AppError } from "@/services/errors";

interface PerformAnalysisOpts {
    userId: string | null;
    isPro: boolean;
    input: AnalyzeChatRequest;
}

/**
 * Full analysis pipeline:
 * 1. Validate pro-feature gates
 * 2. Call Gemini AI via aiService
 * 3. Persist report via reportRepository
 * 4. Return normalized result
 */
export async function performAnalysis(
    client: SupabaseClient,
    opts: PerformAnalysisOpts
): Promise<AnalysisResult> {
    const { userId, isPro, input } = opts;

    // ── Pro-feature gate ──
    if ((input.deep_psychology || input.detect_sarcasm) && !isPro) {
        throw new AppError(
            "Pro features are enabled. Please upgrade or disable them.",
            403
        );
    }

    // ── AI analysis ──
    const result = await aiService.analyzeChat(input.text, {
        my_gender: input.my_gender,
        partner_gender: input.partner_gender,
        deep_psychology: input.deep_psychology,
        detect_sarcasm: input.detect_sarcasm,
        dating_advice: input.dating_advice,
    });

    // ── Persist report (best-effort — don't fail the request) ──
    if (userId) {
        try {
            await reportRepo.createReport(client, {
                user_id: userId,
                interest_score: result.interest_score,
                initiative_user: result.initiative_user,
                initiative_partner: result.initiative_partner,
                sentiment_history: result.sentiment_history,
                advice: result.advice,
                summary: result.summary,
                chat_preview: input.text.slice(0, 200),
                created_at: new Date().toISOString(),
            });
        } catch (dbErr) {
            // Don't fail the whole request if DB save fails — still return analysis
            console.error("Failed to save report to DB:", dbErr);
        }
    }

    return result;
}
