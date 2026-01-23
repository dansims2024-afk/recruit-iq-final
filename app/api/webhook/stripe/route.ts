import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia", // Uses latest stable API version
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;
  let event: Stripe.Event;

  try {
    // 1. Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 2. Handle the successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // This ID was passed from Dashboard.tsx in the URL
    const userId = session.client_reference_id; 

    if (userId) {
      // 3. Update Clerk Metadata to unlock the account
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          isPro: true,
        },
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}
