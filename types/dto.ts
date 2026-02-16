/**
 * Data-Transfer Objects & Zod validation schemas for the API layer.
 */

import { z } from "zod";

// ───── /api/analyze ─────

export const AnalyzeChatRequestSchema = z.object({
    text: z
        .string()
        .min(20, "Please provide at least 20 characters of chat content."),
    my_gender: z.enum(["male", "female", "other"]).default("unknown" as "other"),
    partner_gender: z.enum(["male", "female", "other"]).default("unknown" as "other"),
    deep_psychology: z.boolean().default(false),
    detect_sarcasm: z.boolean().default(false),
    dating_advice: z.boolean().default(true),
});

export type AnalyzeChatRequest = z.infer<typeof AnalyzeChatRequestSchema>;

/** Normalized output returned by the AI analysis. */
export interface AnalysisResult {
    interest_score: number;
    initiative_user: number;
    initiative_partner: number;
    sentiment_history: number[];
    advice: string[];
    summary: string;
}

// ───── /api/chat ─────

const ChatMessageSchema = z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1),
});

export const ChatRequestSchema = z.object({
    messages: z.array(ChatMessageSchema).min(1, "No messages provided."),
    contextText: z.string().optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export interface ChatResponse {
    reply: string;
}
