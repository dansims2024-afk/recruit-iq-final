import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // When the checkout is successful
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;

    if (userId) {
      // THIS IS THE UNLOCK: It tells Clerk this user is now "Pro"
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          isPro: true,
        },
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}
