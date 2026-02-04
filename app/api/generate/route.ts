import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Tells Vercel this is a live API, not a static file
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key Missing" }, { status: 500 });
    }

    const { prompt } = await req.json();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return NextResponse.json(jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Invalid AI response" });

  } catch (error: any) {
    console.error("Build-time safety caught error:", error.message);
    return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
  }
}
