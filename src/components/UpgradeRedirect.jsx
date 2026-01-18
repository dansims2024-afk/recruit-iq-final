import { useEffect } from 'react';

export default function UpgradeRedirect() {
  useEffect(() => {
    // Immediately push the user to Stripe as soon as this page loads
    window.location.href = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 animate-pulse">Redirecting to Secure Checkout...</h2>
        <p className="text-slate-400">Please do not close this window.</p>
      </div>
    </div>
  );
}
