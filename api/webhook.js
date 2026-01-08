// --- RECRUIT-IQ STRIPE WEBHOOK ---
// Paste this into a new file: api/webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify that the request actually came from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payments
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userEmail = session.customer_details.email;

    // LOGIC: Update your database for this user
    // Example: await db.users.update({ email: userEmail, isSubscribed: true });
    console.log(`✅ Recruit-IQ Access Granted to: ${userEmail}`);
  }

  res.status(200).json({ received: true });
}
