"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
  Loader2, Download, Zap, Shield, HelpCircle, Sparkles, 
  Star, Check, Info, Target, Upload, Mail, Copy, ArrowRight, FileText 
} from "lucide-react";

// YOUR VERIFIED STRIPE LINK
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect...`; // (Abbreviated for space, keep your full text)
const SAMPLE_RESUME = `MARCUS VANDELAY...`; // (Abbreviated for space, keep your full text)

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '' });

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  
  const getStripeUrl = () => {
    if (!user?.id) return STRIPE_URL;
    const url = new URL(STRIPE_URL);
    url.searchParams.set("client_reference_id", user.id);
    if (user?.primaryEmailAddress?.emailAddress) {
        url.searchParams.set("prefilled_email", user.primaryEmailAddress.emailAddress);
    }
    return url.toString();
  };

  // REDIRECT LOGIC: Pushes to Stripe after Clerk Sign-Up
  useEffect(() => {
    if (isLoaded && isSignedIn && !isPro) {
        if (window.location.search.includes('signup=true') || sessionStorage.getItem('pending_stripe') === 'true') {
            sessionStorage.removeItem('pending_stripe');
            window.location.href = getStripeUrl();
        }
    }
  }, [isLoaded, isSignedIn, isPro]);

  // ... (Keep existing useEffect for scanCount, toast, copyEmail, downloadPDF, handleFileUpload functions) ...
  // NOTE: For brevity in this message, I'm skipping the helper functions. 
  // ensuring the KEY FIX below is highlighted.

  // --- THE CRITICAL FIX IS HERE ---
  const handleStartTrial = () => {
    sessionStorage.setItem('pending_stripe', 'true');
    // OPTION 1: INTERNAL ROUTE (Bypasses DNS issues)
    // We use window.location.assign to force a hard navigation to your local sign-up route
    window.location.assign('/sign-up');
  };
  // -------------------------------

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      {/* ... (Keep your Toast & Header code) ... */}

      {/* ... (Keep your Main Grid & Inputs) ... */}

      {/* VALUE-DRIVEN UPGRADE MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-[#0F172A] border-2 border-slate-700 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row text-left">
              <div className="p-12 md:w-3/5 flex flex-col justify-center">
                 <img src="/logo.png" alt="Recruit-IQ" className="w-16 h-16 object-contain mb-8" />
                 <h2 className="text-5xl font-black text-white mb-6 leading-tight tracking-tighter italic">Hire Smarter. <br/><span className="text-indigo-400 not-italic">Finish First.</span></h2>
                 <p className="text-slate-400 mb-10 text-sm leading-relaxed max-w-sm">Join top recruiters using Recruit-IQ Elite to screen candidates 10x faster with AI precision.</p>
                 
                 <div className="relative z-[1100]">
                    {!isSignedIn ? (
                        <button 
                            onClick={handleStartTrial}
                            className="inline-flex items-center gap-3 bg-indigo-600 px-12 py-5 rounded-2xl text-white font-black uppercase tracking-wider text-xs shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all border border-indigo-400 hover:scale-[1.05]"
                        >
                            Start 3-Day Free Trial <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <a href={getStripeUrl()} className="inline-flex items-center gap-3 bg-indigo-600 px-12 py-5 rounded-2xl text-white font-black uppercase tracking-wider text-xs shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-all border border-indigo-400 hover:scale-[1.05]">
                            Proceed to Checkout <ArrowRight className="w-4 h-4" />
                        </a>
                    )}
                 </div>
                 
                 <button onClick={() => setShowLimitModal(false)} className="text-[10px] text-slate-500 hover:text-white uppercase font-black w-fit tracking-[0.2em] mt-10 transition-colors uppercase">Dismiss</button>
              </div>
              
              {/* ... (Keep the Feature List Sidebar) ... */}
          </div>
        </div>
      )}
    </div>
  );
}
