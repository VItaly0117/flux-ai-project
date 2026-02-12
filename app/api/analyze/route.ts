import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `You are a relationship and communication expert analyzing a chat export between two people.

Your job:
1. Detect the overall interest level (0-100) — how engaged and invested the people seem.
2. Determine initiative balance — who starts conversations, who asks questions, who drives topics.
3. Track sentiment/mood over time — produce an array of 10 numbers (0-100) representing emotional warmth across the conversation chronologically.
4. Provide 3-5 actionable pieces of advice based on the dynamics you observe.
5. Write a short summary label like "High Interest", "Mutual Effort", "One-Sided", "Friendzone", "Cold", or "Toxic Pattern".

IMPORTANT: Respond with ONLY valid JSON. No markdown, no code fences, no explanation outside the JSON.

Schema:
{
  "interestScore": <number 0-100>,
  "initiativeBalance": { "user": <number 0-100>, "partner": <number 0-100> },
  "sentimentHistory": [<10 numbers between 0 and 100>],
  "advice": [<3-5 strings>],
  "summary": "<short label>"
}`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
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
      `Analyze this chat log and respond with the JSON schema described in your instructions:\n\n${truncated}`
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

    // Validate shape minimally
    const interestScore = Math.min(100, Math.max(0, Number(analysis.interestScore) || 50));
    const userInit = Math.min(100, Math.max(0, Number(analysis.initiativeBalance?.user) || 50));
    const partnerInit = Math.min(100, Math.max(0, Number(analysis.initiativeBalance?.partner) || 50));
    const sentimentHistory = Array.isArray(analysis.sentimentHistory)
      ? analysis.sentimentHistory.slice(0, 10).map((n: unknown) => Math.min(100, Math.max(0, Number(n) || 50)))
      : [50, 50, 50, 50, 50, 50, 50, 50, 50, 50];
    const advice = Array.isArray(analysis.advice)
      ? analysis.advice.slice(0, 5).map(String)
      : ["No specific advice generated."];
    const summary = typeof analysis.summary === "string" ? analysis.summary : "Analysis Complete";

    const normalizedResult = {
      interestScore,
      initiativeBalance: { user: userInit, partner: partnerInit },
      sentimentHistory,
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
          interest_score: normalizedResult.interestScore,
          initiative_user: normalizedResult.initiativeBalance.user,
          initiative_partner: normalizedResult.initiativeBalance.partner,
          sentiment_history: normalizedResult.sentimentHistory,
          advice: normalizedResult.advice,
          summary: normalizedResult.summary,
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
