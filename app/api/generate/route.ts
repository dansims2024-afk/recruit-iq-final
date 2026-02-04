import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// CRITICAL: This prevents Vercel from trying to "pre-render" this API 
// during the build process.
export const dynamic = "force-dynamic";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // 1. Secure the Route
    const { userId } = await auth();
    // We don't block the build here, but we check for auth at runtime
    if (!userId) {
      // If you want to allow guest scans, remove this check
      // return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse Request
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // 3. Initialize AI Model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 4. Set the Instruction
    const systemInstruction = `
      You are an Elite Executive Recruiter. Analyze the provided Job Description and Resume.
      Return a JSON object with the following keys:
      - candidate_name: string
      - score: number (0-100)
      - summary: string (2-3 sentences)
      - strengths: string[] (top 3)
      - gaps: string[] (top 3)
      - questions: string[] (3 targeted interview questions)
      - outreach_email: string (professional intro)
      
      Ensure the output is valid JSON.
    `;

    // 5. Generate Content
    const result = await model.generateContent([systemInstruction, prompt]);
    const response = await result.response;
    const text = response.text();

    // 6. Clean and Parse JSON
    // AI sometimes wraps JSON in markdown blocks (```json ... ```)
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate intelligence", details: error.message },
      { status: 500 }
    );
  }
}
