import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

// Initialize Stripe with the correct API version and safety ignore
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore
  apiVersion: "2026-01-28.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature")!;

  // FIX: In the newest SDK, we use this syntax for the Event type
  let event: any; 

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
    const session = event.data.object as any;
    const userEmail = session.customer_details?.email;

    if (userEmail) {
      try {
        const client = await clerkClient();
        const users = await client.users.getUserList({
          emailAddress: [userEmail],
        });

        if (users.data.length > 0) {
          const userId = users.data[0].id;
          
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
