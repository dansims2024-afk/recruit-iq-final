import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  // 1. Look up the user's email in Stripe to see if they have a successful payment
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;

  const customers = await stripe.customers.list({ email, limit: 1 });
  
  if (customers.data.length > 0) {
    // Check for successful sessions for this customer
    const sessions = await stripe.checkout.sessions.list({
      customer: customers.data[0].id,
    });

    const hasPaid = sessions.data.some(s => s.payment_status === 'paid');

    if (hasPaid) {
      // Unlock the account
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { isPro: true }
      });
      return NextResponse.json({ success: true });
    }
  }

  return NextResponse.json({ success: false, message: "No payment found." });
}
