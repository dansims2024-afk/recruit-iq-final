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

    // 1. Setup Stripe
    const stripeKey = process.env.STRIPE_SECRET_KEY!;
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // 2. DIAGNOSTIC: Log what key we are using (safe version)
    const keyType = stripeKey.startsWith("sk_live") ? "LIVE" : "TEST";
    console.log(`[Verify] Searching Stripe (${keyType} MODE) for user: ${user.emailAddresses[0].emailAddress}`);

    // 3. Pull last 100 sessions (paid only)
    const sessions = await stripe.checkout.sessions.list({ 
      limit: 100, 
      status: 'complete' 
    });

    // 4. Find Match (Case-Insensitive)
    const targetEmail = user.emailAddresses[0].emailAddress.toLowerCase().trim();
    
    const match = sessions.data.find(session => {
      const stripeEmail = session.customer_details?.email?.toLowerCase().trim();
      // Match by ID (Best) OR Email (Fallback)
      return session.client_reference_id === userId || stripeEmail === targetEmail;
    });

    if (match) {
      console.log(`[Verify] Match Found! Session ID: ${match.id}`);
      
      // 5. UNLOCK ACCOUNT
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: { isPro: true }
      });
      
      return NextResponse.json({ success: true, mode: keyType });
    }

    // 6. IF NO MATCH: Log what we DID find to Vercel Logs for debugging
    const recentEmails = sessions.data.slice(0, 3).map(s => s.customer_details?.email).join(", ");
    console.log(`[Verify] Failed. Recent Stripe emails were: ${recentEmails}`);

    return NextResponse.json({ 
      success: false, 
      error: `No payment found in ${keyType} mode for ${targetEmail}.` 
    }, { status: 404 });

  } catch (error: any) {
    console.error("[Verify] API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
