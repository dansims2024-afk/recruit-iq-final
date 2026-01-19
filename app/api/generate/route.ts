import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, type } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Custom instructions based on which tab was clicked
    let systemInstruction = "";
    if (type === "job") {
      systemInstruction = "You are an expert recruiter. Rewrite this job description to be more engaging, inclusive, and professional. Highlight key requirements clearly.";
    } else {
      systemInstruction = "You are an expert career coach. Analyze this resume text. Identify strengths, weaknesses, and suggest 3 specific improvements.";
    }

    const finalPrompt = `${systemInstruction}\n\nInput Text:\n${prompt}`;
    
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 });
  }
}
