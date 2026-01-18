import { useEffect } from 'react';

export default function UpgradeRedirect() {
  useEffect(() => {
    // Immediately redirect to Stripe
    window.location.href = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Account Verified</h2>
        <p className="text-slate-400 text-sm">Redirecting to secure checkout...</p>
      </div>
    </div>
  );
}
