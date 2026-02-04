import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    // Optional: Uncomment to enforce login
    // if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { prompt } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      // CRITICAL FIX: 'as any' silences the TypeScript error preventing the build
      generationConfig: { responseMimeType: "application/json" } as any
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown formatting from AI
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("Generate Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
