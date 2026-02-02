import { NextResponse } from "next/server";
// Use /server for auth and clerkClient in the app router
import { auth, clerkClient } from "@clerk/nextjs/server"; 
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST() {
  const session = await auth();
  const userId = session.userId;
  
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;

  if (!email) return new NextResponse("No email found", { status: 400 });

  // Check Stripe for this user's email
  const customers = await stripe.customers.list({ email, limit: 1 });
  
  if (customers.data.length > 0) {
    const sessions = await stripe.checkout.sessions.list({
      customer: customers.data[0].id,
    });

    const hasPaid = sessions.data.some(s => s.payment_status === 'paid');

    if (hasPaid) {
      // This is what actually unlocks the account
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { isPro: true }
      });
      return NextResponse.json({ success: true });
    }
  }

  return NextResponse.json({ success: false, message: "No payment found." });
}
