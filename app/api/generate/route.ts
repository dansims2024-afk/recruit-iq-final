import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Force this route to be dynamic (prevents 404s on build)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 2. Verify API Key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing on server" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 3. Clean the JSON (Gemini sometimes adds ```json blocks)
    const cleanedText = text.replace(/```json|```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanedText));
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
