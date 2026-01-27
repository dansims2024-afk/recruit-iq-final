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

    // 1. Get recent successful payments
    const sessions = await stripe.checkout.sessions.list({ 
      limit: 100,
      status: 'complete'
    });

    // 2. FIND THE MATCH: Check Client Reference ID (Best) OR Email (Fallback)
    const match = sessions.data.find(s => 
      s.client_reference_id === userId || 
      s.customer_details?.email?.toLowerCase() === userEmail.toLowerCase()
    );

    if (match) {
      // 3. FORCE UNLOCK: Update Clerk Metadata
      // Using clerkClient object syntax to avoid build errors
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: { isPro: true }
      });
      return NextResponse.json({ success: true, method: match.client_reference_id ? 'id' : 'email' });
    }
    
    return NextResponse.json({ success: false, error: "No matching payment found" }, { status: 404 });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
