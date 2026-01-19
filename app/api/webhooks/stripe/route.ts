import { clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const clerkUserId = session.client_reference_id;
    if (clerkUserId) {
      // clerkClient is an object, not a function
      await clerkClient.users.updateUserMetadata(clerkUserId, {
        publicMetadata: { isPro: true },
      });
    }
  }
  return new NextResponse(null, { status: 200 });
}
