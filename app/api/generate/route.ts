import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// This line is CRITICAL for Vercel to recognize the API route correctly
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Check for API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: GEMINI_API_KEY is not defined in Vercel Environment Variables.");
      return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    // 2. Initialize AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Parse Request
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // 4. Generate Content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Clean JSON formatting (removes markdown code blocks if AI adds them)
    const cleanedText = text.replace(/```json|```/g, "").trim();
    
    // 6. Return Data
    return NextResponse.json(JSON.parse(cleanedText));

  } catch (error: any) {
    console.error("API ROUTE ERROR:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  }
}
