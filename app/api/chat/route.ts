import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `You are a dating coach and relationship advisor. You have read the user's chat history (provided as context below). 

Answer their follow-up questions based specifically on that conversation context. Be direct, practical, and concise. Give actionable advice. If they ask "how should I reply?", suggest an actual message they could send. Keep responses under 200 words unless they ask for detail.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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
    const messages: ChatMessage[] = body.messages;
    const contextText: string | undefined = body.contextText;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    const truncatedContext = (contextText || "").slice(0, 20_000);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Build conversation history for Gemini
    const chatHistory = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: `Here is the chat log I want to discuss:\n\n${truncatedContext}\n\n---\nI'll now ask you questions about this conversation.`,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "I've read through the chat log. I'm ready to answer your questions about this conversation. What would you like to know?",
            },
          ],
        },
        ...chatHistory,
      ],
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Chat failed. Please try again." },
      { status: 500 }
    );
  }
}
