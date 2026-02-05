import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Use the latest stable version
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userEmail = session.customer_details?.email;

    if (userEmail) {
      try {
        // 1. Find the user in Clerk by email
        const users = await clerkClient.users.getUserList({
          emailAddress: [userEmail],
        });

        if (users.length > 0) {
          const clerkUserId = users[0].id;

          // 2. Update the user's Public Metadata to isPro: true
          await clerkClient.users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
              isPro: true,
            },
          });
          
          console.log(`Success: User ${userEmail} upgraded to Elite.`);
        }
      } catch (error) {
        console.error("Error updating Clerk user:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
      }
    }
  }

  return new NextResponse("Webhook processed", { status: 200 });
}
