/**
 * POST /api/analyze — Controller
 * Validates input, delegates to analysisService, returns response.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AnalyzeChatRequestSchema } from "@/types/dto";
import { performAnalysis } from "@/services/analysisService";
import { AppError } from "@/services/errors";

export async function POST(request: Request) {
  try {
    // ── Auth ──
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ── Validate input ──
    const body = await request.json();
    const parsed = AnalyzeChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // ── Determine pro status ──
    let isPro = false;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro")
        .eq("id", user.id)
        .maybeSingle();
      isPro = !!profile?.is_pro;
    }

    // ── Execute ──
    const result = await performAnalysis(supabase, {
      userId: user?.id ?? null,
      isPro,
      input: parsed.data,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again later." },
      { status: 500 }
    );
  }
}
