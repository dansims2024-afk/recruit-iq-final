import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// CRITICAL: This line forces Vercel to treat this as a dynamic API 
// instead of trying to pre-build it (which causes the 500/Crash).
export const dynamic = "force-dynamic";

// Initialize the Google AI SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // 1. Authenticate the User
    const { userId } = await auth();
    // Optional: Uncomment the next line to strictly block non-logged-in users
    // if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // 2. Parse the Incoming Data
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    // 3. Configure the AI Model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      // 'as any' prevents TypeScript from blocking the build on strict type checks
      generationConfig: { responseMimeType: "application/json" } as any
    });

    // 4. Generate the Intelligence
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Clean the Output
    // Sometimes AI wraps JSON in markdown blocks (```json ... ```). We strip those out.
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // 6. Return the Data
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("API Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate intelligence", details: error.message }, 
      { status: 500 }
    );
  }
}
