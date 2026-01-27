import { NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Matched to your project's installed version
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) return new NextResponse("Unauthorized", { status: 401 });

    const userEmail = user.emailAddresses[0].emailAddress;

    // Direct check of the last 100 Stripe sessions to verify this user's email
    const sessions = await stripe.checkout.sessions.list({ limit: 100 });
    const match = sessions.data.find(s => 
      s.customer_details?.email?.toLowerCase() === userEmail.toLowerCase() &&
      s.status === 'complete'
    );

    if (match) {
      // Forcefully update the user's status in the Clerk database
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { isPro: true }
      });
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
