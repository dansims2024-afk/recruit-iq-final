import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // DEBUG 1: Is the key even there?
    if (!apiKey) {
      return NextResponse.json({ 
        error: "SERVER_CONFIG_ERROR", 
        message: "The GEMINI_API_KEY is missing from Vercel Environment Variables." 
      }, { status: 500 });
    }

    const { prompt } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // DEBUG 2: Try to talk to Google
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ 
        error: "AI_FORMAT_ERROR", 
        message: "AI returned text instead of JSON",
        raw: text 
      }, { status: 500 });
    }
    
    return NextResponse.json(JSON.parse(jsonMatch[0]));

  } catch (error: any) {
    // THIS SENDS THE REAL ERROR TO YOUR SCREEN
    console.error("DEBUG LOG:", error.message);
    return NextResponse.json({ 
      error: "GOOGLE_API_CRASH", 
      message: error.message || "Unknown Error",
      stack: error.stack?.substring(0, 100) // First 100 chars of the error trace
    }, { status: 500 });
  }
}
