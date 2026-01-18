import { useEffect } from 'react';

export default function UpgradeRedirect() {
  useEffect(() => {
    // Immediately trigger the jump to Stripe
    window.location.href = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold uppercase tracking-tighter">Verified</h2>
        <p className="text-slate-400 text-sm">Redirecting to Stripe checkout...</p>
      </div>
    </div>
  );
}
