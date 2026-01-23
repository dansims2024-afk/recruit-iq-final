import { NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    // 1. Ensure the user is logged in
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userEmail = user.emailAddresses[0].emailAddress;

    // 2. ACTIVE CHECK: Ask Stripe for the last 50 successful sessions
    // This bypasses the webhook entirely.
    const sessions = await stripe.checkout.sessions.list({
      limit: 50,
      status: 'complete',
    });

    // 3. Find if THIS user's email is in the paid list
    const match = sessions.data.find(session => 
      session.customer_details?.email?.toLowerCase() === userEmail.toLowerCase()
    );

    if (match) {
      // 4. Payment Found! Force update the user.
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          isPro: true,
        },
      });
      return NextResponse.json({ success: true, message: "Payment verified manually." });
    } else {
      return NextResponse.json({ success: false, message: "No recent payment found for this email." }, { status: 404 });
    }

  } catch (error: any) {
    console.error("Manual Check Error:", error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
