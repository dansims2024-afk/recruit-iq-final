import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google AI with your API Key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    // 1. CLERK V5 AUTH CHECK
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. GET INPUT DATA
    const { prompt } = await req.json();

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // 3. INITIALIZE GEMINI MODEL
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 4. EXECUTE AI GENERATION
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. SAFETY NET: Clean AI response in case it returns Markdown blocks
    // This prevents the "JSON Parse Error" if Gemini returns ```json { ... } ```
    const cleanJsonString = text.replace(/```json|```/g, "").trim();

    try {
      const jsonResponse = JSON.parse(cleanJsonString);
      return NextResponse.json(jsonResponse);
    } catch (parseError) {
      console.error("JSON Parse Error:", cleanJsonString);
      // Fallback: If JSON parsing fails, return the raw text in a structured format
      return NextResponse.json({ 
        error: "Failed to parse AI response as JSON",
        raw: text 
      });
    }

  } catch (error: any) {
    console.error("[GENERATE_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
