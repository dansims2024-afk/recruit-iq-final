import Link from "next/link";
import { Check } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-white p-4">
      <div className="bg-[#111827] border border-slate-800 p-12 rounded-[2.5rem] text-center shadow-2xl max-w-lg w-full">
        
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
          <Check className="w-12 h-12 text-emerald-500" />
        </div>
        
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Payment Complete!</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Your transaction has been processed securely. You are now ready to unlock the full power of Recruit-IQ.
        </p>

        <Link 
          href="/" 
          className="block w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
        >
          Return to Dashboard
        </Link>

      </div>
    </div>
  );
}
