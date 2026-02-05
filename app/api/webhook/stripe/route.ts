import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createClerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia", // Updated to latest stable version
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize the Clerk Client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req: Request) {
  const body = await req.text();
  
  // FIX: In Next.js 15, headers() returns a promise and MUST be awaited
  const headerList = await headers();
  const signature = headerList.get("stripe-signature") as string;

  if (!signature) {
    console.error("No stripe-signature found in headers");
    return new NextResponse("Missing signature", { status: 400 });
  }

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
        // Find the user in Clerk by email
        const userList = await clerkClient.users.getUserList({
          emailAddress: [userEmail],
        });

        if (userList.data.length > 0) {
          const clerkUserId = userList.data[0].id;

          // Update the user's Public Metadata to isPro: true
          await clerkClient.users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
              isPro: true,
            },
          });
          
          console.log(`SUCCESS: User ${userEmail} upgraded to Elite.`);
        } else {
          console.warn(`Webhook received for ${userEmail}, but no Clerk user found.`);
        }
      } catch (error) {
        console.error("Error updating Clerk user metadata:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
      }
    }
  }

  return new NextResponse("Webhook processed successfully", { status: 200 });
}
