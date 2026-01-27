import { NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ success: false, error: "Not Logged In" }, { status: 401 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });
    const userEmail = user.emailAddresses[0].emailAddress;

    console.log(`[Sync] Checking for User: ${userEmail} (ID: ${userId})`);

    // STRATEGY 1: Search by Client Reference ID (The most accurate link)
    // We explicitly look for a session that matches the Clerk User ID
    const idSearchResults = await stripe.checkout.sessions.list({
      limit: 5,
      client_reference_id: userId,
      status: 'complete'
    });

    // STRATEGY 2: Search by Email (Fallback)
    // We scan recent payments for the user's email address
    const emailSearchResults = await stripe.checkout.sessions.list({
        limit: 10,
        status: 'complete'
    });
    
    // Check for a match in either result set
    const idMatch = idSearchResults.data[0];
    const emailMatch = emailSearchResults.data.find(s => 
        s.customer_details?.email?.toLowerCase() === userEmail.toLowerCase()
    );

    const match = idMatch || emailMatch;

    if (match) {
      console.log(`[Sync] Payment Found! Session ID: ${match.id}`);
      
      // FORCE UNLOCK
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: { isPro: true }
      });
      
      return NextResponse.json({ success: true, method: idMatch ? 'ID' : 'Email' });
    }

    console.log(`[Sync] No match found. Searched ID: ${userId} and Email: ${userEmail}`);
    return NextResponse.json({ success: false, error: "Payment record not found in Stripe." }, { status: 404 });

  } catch (error: any) {
    console.error("[Sync] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
