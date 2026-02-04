import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// CRITICAL: This line prevents the "cookies() expects requestAsyncStorage" error
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY in Vercel settings");
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Safety check for JSON formatting
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return valid JSON");
    }
    
    return NextResponse.json(JSON.parse(jsonMatch[0]));

  } catch (error: any) {
    console.error("API ROUTE ERROR:", error.message);
    return NextResponse.json({ error: "AI Processing Failed", details: error.message }, { status: 500 });
  }
}
