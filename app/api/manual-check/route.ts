import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Updated to match the library's required version
  apiVersion: "2026-01-28.clover" as any,
});

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({ 
      status: session.status, 
      payment_status: session.payment_status 
    });
  } catch (error: any) {
    console.error("Manual Check Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
