import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing in Vercel" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { prompt } = await req.json();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // --- NEW ROBUST CLEANING LOGIC ---
    // This finds the first { and the last } to ignore any "Here is your JSON" text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return valid JSON format");
    }
    
    const cleanedJson = jsonMatch[0];
    const data = JSON.parse(cleanedJson);

    // Ensure arrays exist even if AI forgot them to prevent the 'map' error
    return NextResponse.json({
      candidate_name: data.candidate_name || "Unknown Candidate",
      score: data.score || 0,
      summary: data.summary || "",
      strengths: data.strengths || [],
      gaps: data.gaps || [],
      questions: data.questions || [],
      outreach_email: data.outreach_email || ""
    });

  } catch (error: any) {
    console.error("DEBUG API ERROR:", error);
    return NextResponse.json({ 
      error: "AI Processing Failed", 
      details: error.message 
    }, { status: 500 });
  }
}
