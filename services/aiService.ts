/**
 * AI Service — encapsulates ALL Google Gemini interactions.
 * No database access; pure AI logic.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult, AnalyzeChatRequest } from "@/types/dto";
import { AppError } from "@/services/errors";

// ───── Helpers ─────

function clamp(n: unknown, fallback = 50): number {
    const v = Number(n);
    if (Number.isNaN(v)) return fallback;
    return Math.min(100, Math.max(0, v));
}

function cleanGeminiJson(raw: string): string {
    return raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
}

function getApiKeyOrThrow(): string {
    const key = process.env.GOOGLE_API_KEY;
    if (!key) {
        throw new AppError("GOOGLE_API_KEY is not configured on the server.", 500);
    }
    return key;
}

// ───── Prompt Builder ─────

interface PromptOpts {
    my_gender: string;
    partner_gender: string;
    deep_psychology: boolean;
    detect_sarcasm: boolean;
    dating_advice: boolean;
}

function buildSystemInstruction(opts: PromptOpts): string {
    const genderCtx = `The user is ${opts.my_gender} and the partner is ${opts.partner_gender}.`;

    const extras: string[] = [];
    if (opts.deep_psychology) {
        extras.push(
            "Provide deep psychological analysis: attachment style indicators, manipulation red flags, emotional dependency patterns, and subconscious communication cues."
        );
    }
    if (opts.detect_sarcasm) {
        extras.push(
            "Pay special attention to sarcasm, passive-aggression, and hidden meanings behind seemingly neutral messages."
        );
    }
    if (opts.dating_advice) {
        extras.push(
            "Include practical dating advice tailored to the user's situation — what to text next, when to text, and strategic tips."
        );
    }

    return `You are a relationship expert and communication analyst. ${genderCtx}

Analyze the chat export between these two people. Detect dynamics, initiative balance, emotional tone, and hidden signals.
${extras.length > 0 ? "\nAdditional instructions:\n" + extras.map((e) => "- " + e).join("\n") : ""}

Return ONLY raw JSON (no markdown, no code fences, no explanation) with exactly these fields:
{
  "interest_score": <number 0-100>,
  "initiative_user": <number 0-100, percentage of user's effort>,
  "initiative_partner": <number 0-100, percentage of partner's effort>,
  "sentiment_history": [<array of exactly 10 numbers from 0-100 representing mood shift over time>],
  "advice": [<array of exactly 3 short, actionable strings>],
  "summary": "<short 1-sentence summary>"
}`;
}

// ───── Public API ─────

/**
 * Analyze a chat log using Gemini AI.
 * Returns a normalized AnalysisResult.
 */
export async function analyzeChat(
    text: string,
    opts: Omit<AnalyzeChatRequest, "text">
): Promise<AnalysisResult> {
    const apiKey = getApiKeyOrThrow();

    // Truncate very long inputs to ~30k chars to stay within token limits
    const truncated = text.slice(0, 30_000);

    const systemInstruction = buildSystemInstruction({
        my_gender: opts.my_gender,
        partner_gender: opts.partner_gender,
        deep_psychology: opts.deep_psychology,
        detect_sarcasm: opts.detect_sarcasm,
        dating_advice: opts.dating_advice,
    });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction,
    });

    const result = await model.generateContent(
        `Analyze this chat log:\n\n${truncated}`
    );

    const rawText = result.response.text();
    const cleaned = cleanGeminiJson(rawText);

    let analysis: Record<string, unknown>;
    try {
        analysis = JSON.parse(cleaned);
    } catch {
        console.error("Gemini returned invalid JSON:", rawText);
        throw new AppError("AI returned an invalid response. Please try again.", 502);
    }

    // Validate & normalize
    const interest_score = clamp(analysis.interest_score);
    const initiative_user = clamp(analysis.initiative_user);
    const initiative_partner = clamp(analysis.initiative_partner);
    const sentiment_history = Array.isArray(analysis.sentiment_history)
        ? analysis.sentiment_history.slice(0, 10).map((n: unknown) => clamp(n))
        : [50, 50, 50, 50, 50, 50, 50, 50, 50, 50];
    const advice = Array.isArray(analysis.advice)
        ? analysis.advice.slice(0, 5).map(String)
        : ["No specific advice generated."];
    const summary =
        typeof analysis.summary === "string" ? analysis.summary : "Analysis Complete";

    return {
        interest_score,
        initiative_user,
        initiative_partner,
        sentiment_history,
        advice,
        summary,
    };
}

/**
 * Chat with the AI coach, optionally using analysis context.
 * Returns the assistant reply string.
 */
export async function chatWithContext(
    messages: { role: "user" | "assistant"; content: string }[],
    contextText?: string
): Promise<string> {
    const apiKey = getApiKeyOrThrow();

    const SYSTEM_WITH_CONTEXT = `You are a dating coach and relationship advisor. You have read the user's chat history (provided as context below). 

Answer their follow-up questions based specifically on that conversation context. Be direct, practical, and concise. Give actionable advice. If they ask "how should I reply?", suggest an actual message they could send. Keep responses under 200 words unless they ask for detail.`;

    const SYSTEM_STANDALONE = `You are an expert dating coach and relationship advisor. Users come to you with dating questions, relationship problems, and communication challenges.

Be direct, practical, and concise. Give actionable advice with specific examples when possible. Keep responses under 200 words unless they ask for detail.`;

    const hasContext = !!contextText && contextText.trim().length > 0;
    const truncatedContext = (contextText || "").slice(0, 20_000);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: hasContext ? SYSTEM_WITH_CONTEXT : SYSTEM_STANDALONE,
    });

    // Build conversation history for Gemini
    const chatHistory = messages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: m.content }],
    }));

    const contextHistory = hasContext
        ? [
            {
                role: "user" as const,
                parts: [
                    {
                        text: `Here is the chat log I want to discuss:\n\n${truncatedContext}\n\n---\nI'll now ask you questions about this conversation.`,
                    },
                ],
            },
            {
                role: "model" as const,
                parts: [
                    {
                        text: "I've read through the chat log. I'm ready to answer your questions about this conversation. What would you like to know?",
                    },
                ],
            },
        ]
        : [];

    const chat = model.startChat({
        history: [...contextHistory, ...chatHistory],
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    return result.response.text();
}
