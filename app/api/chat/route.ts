/**
 * POST /api/chat — Controller
 * Validates input, delegates to aiService, returns response.
 */

import { NextResponse } from "next/server";
import { ChatRequestSchema } from "@/types/dto";
import { chatWithContext } from "@/services/aiService";
import { AppError } from "@/services/errors";

export async function POST(request: Request) {
  try {
    // ── Validate input ──
    const body = await request.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // ── Execute ──
    const reply = await chatWithContext(
      parsed.data.messages,
      parsed.data.contextText
    );

    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Chat failed. Please try again." },
      { status: 500 }
    );
  }
}
