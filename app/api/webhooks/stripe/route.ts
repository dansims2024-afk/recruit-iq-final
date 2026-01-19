import { NextResponse } from 'next/user';
import { clerkClient } from '@clerk/nextjs';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // When a payment is successful
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkUserId = session.client_reference_id;

    if (clerkUserId) {
      // THE "IS PRO TRUE" MAGIC: This tells Clerk to unlock the account
      await clerkClient.users.updateUserMetadata(clerkUserId, {
        publicMetadata: {
          isPro: true
        }
      });
    }
  }

  return new NextResponse('Success', { status: 200 });
}
