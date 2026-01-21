import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = headers().get("Stripe-Signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!webhookSecret) return new NextResponse("Missing Webhook Secret", { status: 500 });
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // LISTENER: If payment is successful, UNLOCK the user
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;

    if (userId) {
      await clerkClient.users.updateUser(userId, {
        publicMetadata: { isPro: true },
      });
    }
  }

  return new NextResponse("Success", { status: 200 });
}
