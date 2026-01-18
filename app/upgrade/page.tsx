import { SignUp } from "@clerk/nextjs";

export default function UpgradePage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
      {/* Since the direct PricingTable import failed, we use the standard check */}
      <div style={{ textAlign: "center" }}>
        <h1>Upgrade to Elite 🚀</h1>
        <p>Choose a plan to unlock the AI Dashboard.</p>
        <div style={{ marginTop: "20px" }}>
          {/* Replace this with your actual Stripe Payment Link or Clerk Billing Link */}
          <a 
            href="YOUR_STRIPE_PAYMENT_LINK_HERE" 
            style={{ padding: "10px 20px", background: "blue", color: "white", borderRadius: "8px" }}
          >
            Buy Elite Plan
          </a>
        </div>
      </div>
    </div>
  );
}
