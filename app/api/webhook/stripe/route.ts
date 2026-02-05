import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createClerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // FIX: Reverted to the version your package expects
  apiVersion: "2023-10-16", 
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req: Request) {
  const body = await req.text();
  
  // Next.js 15 Fix: await the headers
  const headerList = await headers();
  const signature = headerList.get("stripe-signature") as string;

  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userEmail = session.customer_details?.email;

    if (userEmail) {
      try {
        const userList = await clerkClient.users.getUserList({
          emailAddress: [userEmail],
        });

        // Some Clerk versions use .data, others return the array directly
        const users = Array.isArray(userList) ? userList : (userList as any).data;

        if (users && users.length > 0) {
          const clerkUserId = users[0].id;

          await clerkClient.users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
              isPro: true,
            },
          });
          console.log(`Elite status enabled for: ${userEmail}`);
        }
      } catch (error) {
        console.error("Clerk Metadata Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
      }
    }
  }

  return new NextResponse("Success", { status: 200 });
}
