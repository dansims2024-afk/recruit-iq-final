import { NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) return new NextResponse("Unauthorized", { status: 401 });

    const userEmail = user.emailAddresses[0].emailAddress;

    // Fetch sessions without the invalid 'client_reference_id' filter to pass build
    const sessions = await stripe.checkout.sessions.list({ 
      limit: 100 
    });

    // Manually find the match in the results
    const match = sessions.data.find(s => 
      s.status === 'complete' && 
      (s.client_reference_id === userId || s.customer_details?.email?.toLowerCase() === userEmail.toLowerCase())
    );

    if (match) {
      // Correct object-based call for your Clerk SDK version
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: { isPro: true }
      });
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, error: "Payment not found" }, { status: 404 });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
