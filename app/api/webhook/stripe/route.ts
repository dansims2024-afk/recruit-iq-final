import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Updated to match the version required by your current Stripe SDK
  // @ts-ignore
  apiVersion: "2026-01-28.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle successful payments and trial starts
  if (
    event.type === "checkout.session.completed" || 
    event.type === "customer.subscription.created"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const userEmail = session.customer_details?.email;

    if (userEmail) {
      try {
        const client = await clerkClient();
        const users = await client.users.getUserList({
          emailAddress: [userEmail],
        });

        if (users.data.length > 0) {
          const userId = users.data[0].id;
          
          // Set the "isPro" flag in Clerk's public metadata
          await client.users.updateUserMetadata(userId, {
            publicMetadata: {
              isPro: true,
            },
          });
          console.log(`Successfully upgraded user: ${userEmail}`);
        }
      } catch (error) {
        console.error("Clerk Metadata Update Error:", error);
      }
    }
  }

  return new NextResponse("Webhook received", { status: 200 });
}
