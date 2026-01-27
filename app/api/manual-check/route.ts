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

    // STEP 1: Get the list (Don't filter by ID here, it causes Build Error)
    const sessions = await stripe.checkout.sessions.list({ 
      limit: 100,
      status: 'complete'
    });

    // STEP 2: Filter manually in Javascript
    const match = sessions.data.find(s => 
      s.client_reference_id === userId || 
      s.customer_details?.email?.toLowerCase() === userEmail.toLowerCase()
    );

    if (match) {
      // Use clerkClient object directly
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
