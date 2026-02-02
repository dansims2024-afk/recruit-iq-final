import { NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Attempt to find the customer in Stripe by email
    const email = user.emailAddresses[0].emailAddress;
    const customers = await stripe.customers.list({ email, limit: 1 });
    
    if (customers.data.length > 0) {
       // Sync status if customer exists
       const customer = customers.data[0];
       const subscriptions = await stripe.subscriptions.list({ customer: customer.id });
       
       const isPro = subscriptions.data.some(sub => sub.status === 'active');

       if (isPro) {
         await clerkClient.users.updateUserMetadata(userId, {
           publicMetadata: { isPro: true }
         });
         return NextResponse.json({ success: true, isPro: true });
       }
    }

    return NextResponse.json({ success: true, isPro: false });
  } catch (error) {
    console.error("[MANUAL_CHECK_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
