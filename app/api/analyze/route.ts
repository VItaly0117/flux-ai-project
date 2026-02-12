import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `You are a relationship expert analyzing a chat export between two people. Detect dynamics, initiative, and mood.

Return ONLY raw JSON (no markdown, no code fences, no explanation) with exactly these fields:
{
  "interest_score": <number 0-100>,
  "initiative_user": <number 0-100, percentage of user's effort>,
  "initiative_partner": <number 0-100, percentage of partner's effort>,
  "sentiment_history": [<array of exactly 10 numbers from 0-100 representing mood shift over time>],
  "advice": [<array of exactly 3 short, actionable strings>],
  "summary": "<short 1-sentence summary>"
}`;

function clamp(n: unknown, fallback = 50): number {
  const v = Number(n);
  if (Number.isNaN(v)) return fallback;
  return Math.min(100, Math.max(0, v));
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const text: string | undefined = body.text;

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide at least 20 characters of chat content." },
        { status: 400 }
      );
    }

    // Truncate very long inputs to ~30k chars to stay within token limits
    const truncated = text.slice(0, 30_000);

    // --- Gemini AI ---
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const result = await model.generateContent(
      `Analyze this chat log:\n\n${truncated}`
    );

    const rawText = result.response.text();

    // Strip markdown code fences if Gemini wraps the JSON
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      console.error("Gemini returned invalid JSON:", rawText);
      return NextResponse.json(
        { error: "AI returned an invalid response. Please try again." },
        { status: 502 }
      );
    }

    // Validate & normalize
    const interest_score = clamp(analysis.interest_score);
    const initiative_user = clamp(analysis.initiative_user);
    const initiative_partner = clamp(analysis.initiative_partner);
    const sentiment_history = Array.isArray(analysis.sentiment_history)
      ? analysis.sentiment_history.slice(0, 10).map((n: unknown) => clamp(n))
      : [50, 50, 50, 50, 50, 50, 50, 50, 50, 50];
    const advice = Array.isArray(analysis.advice)
      ? analysis.advice.slice(0, 3).map(String)
      : ["No specific advice generated."];
    const summary = typeof analysis.summary === "string" ? analysis.summary : "Analysis Complete";

    const normalizedResult = {
      interest_score,
      initiative_user,
      initiative_partner,
      sentiment_history,
      advice,
      summary,
    };

    // --- Save to Supabase ---
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("reports").insert({
          user_id: user.id,
          interest_score,
          initiative_user,
          initiative_partner,
          sentiment_history,
          advice,
          summary,
          chat_preview: truncated.slice(0, 200),
          created_at: new Date().toISOString(),
        });
      }
    } catch (dbErr) {
      // Don't fail the whole request if DB save fails — still return analysis
      console.error("Failed to save report to DB:", dbErr);
    }

    return NextResponse.json(normalizedResult);
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again later." },
      { status: 500 }
    );
  }
}
