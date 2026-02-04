import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // 1. DEBUG CHECK: Do we have the key?
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL ERROR: GEMINI_API_KEY is missing in Vercel Settings.");
      return NextResponse.json(
        { error: "Configuration Error: API Key is missing on the server." }, 
        { status: 500 }
      );
    }

    // 2. Initialize AI
    const genAI = new GoogleGenerativeAI(apiKey);

    // 3. Handle Auth (Fail gracefully if auth breaks)
    let userId = null;
    try {
      const authData = await auth();
      userId = authData.userId;
    } catch (e) {
      console.warn("Auth check failed, proceeding as guest:", e);
    }

    // 4. Parse Request
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // 5. Generate
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" } as any
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("API Error Details:", error);
    return NextResponse.json(
      { error: error.message || "Unknown API Error" }, 
      { status: 500 }
    );
  }
}
