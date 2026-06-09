import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { jd, resume } = await req.json();

    if (!jd || !resume) {
      return NextResponse.json({ error: "Missing required texts" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key Configuration Missing" }, { status: 500 });
    }

    // Initialize the SDK using the correct GoogleGenAI instance method
    const ai = new GoogleGenAI({ apiKey });
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert executive recruitment system matching a candidate's resume to a specific Job Description.
      Analyze the following data carefully:
      
      JOB DESCRIPTION:
      ${jd}
      
      CANDIDATE RESUME:
      ${resume}
      
      Return a STRICT, valid JSON object matching this exact structural format. Do not wrap it in markdown block tags like \`\`\`json. Return only the raw JSON text:
      {
        "name": "Extract candidate full name",
        "score": 85,
        "summary": "A concise 2-sentence executive placement summary",
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "gaps": ["Gap 1", "Gap 2", "Gap 3"],
        "questions": ["Interview Question 1", "Interview Question 2", "Interview Question 3"],
        "outreach": "Subject: Executive Interview Invitation | Recruit-IQ\\n\\nHi [Name],\\n\\nI came across your background..."
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Parse the live AI response
    const parsedData = JSON.parse(responseText);
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: "Failed to process talent intelligence token." }, { status: 500 });
  }
}
