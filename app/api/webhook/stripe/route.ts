import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server"; // FIXED: New V5 Location

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    if (!session?.client_reference_id) {
      return new NextResponse("User id is required", { status: 400 });
    }

    await clerkClient.users.updateUserMetadata(
      session.client_reference_id,
      {
        publicMetadata: {
          isPro: true, // UPGRADES THE USER
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
        },
      }
    );
  }

  return new NextResponse(null, { status: 200 });
}
