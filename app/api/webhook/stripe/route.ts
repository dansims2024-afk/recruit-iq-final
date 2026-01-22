import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs";
import Stripe from "stripe";

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

  if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
    
    // 1. Try to find the user by the ID passed in the link
    let userId = session.client_reference_id;

    // 2. CRITICAL FIX: If no ID (Sign Up Flow), find them by EMAIL
    if (!userId && session.customer_details?.email) {
      try {
        const userList = await clerkClient.users.getUserList({
          emailAddress: [session.customer_details.email],
          limit: 1,
        });
        
        if (userList.length > 0) {
          userId = userList[0].id;
        }
      } catch (err) {
        console.error("Error finding user by email:", err);
      }
    }

    // 3. Unlock the account
    if (userId) {
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            isPro: true,
          },
        });
      } catch (err) {
        console.error(`Clerk update failed for ${userId}:`, err);
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
