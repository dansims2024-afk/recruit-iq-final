"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { jsPDF } from "jspdf"; 
import { useUser, SignUpButton, UserButton } from "@clerk/nextjs";

// --- CONFIGURATION ---
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

// --- SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect...`; // (Keep short for brevity)
const SAMPLE_RESUME = `MARCUS VANDELAY...`; 

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
  const [verifying, setVerifying] = useState(false);

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  
  // Embed User ID into Stripe URL for 100% matching accuracy
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
    
    if (isLoaded && isSignedIn) {
      const urlParams = new URLSearchParams(window.location.search);
      
      // 1. AUTO-REDIRECT TO STRIPE (New Signups)
      if (urlParams.get('signup') === 'true' && !isPro) {
        window.location.href = finalStripeUrl;
        return;
      }

      // 2. AUTO-UNLOCK (Returning from Stripe)
      // If the URL has ?payment_success=true, we run the check immediately
      if (urlParams.get('payment_success') === 'true' && !isPro) {
        handleVerifySubscription();
      }

      if (!isPro && savedCount >= 3) setShowLimitModal(true);
    }
  }, [isLoaded, isSignedIn, isPro]);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const handleVerifySubscription = async () => {
    setVerifying(true);
    showToast("Syncing with Stripe...");
    try {
      const res = await fetch('/api/manual-check', { method: 'POST' });
      if (res.ok) {
        await user?.reload(); // CRITICAL: Force Clerk to see the new status
        if (user?.publicMetadata?.isPro) {
          setShowLimitModal(false);
          showToast("Elite Status Confirmed!");
          // Clean the URL
          window.history.replaceState({}, '', '/');
        } else {
           // Retry once more after a delay
           setTimeout(async () => {
             await user?.reload();
             if (user?.publicMetadata?.isPro) setShowLimitModal(false);
           }, 2000);
        }
      } else { 
        showToast("Payment not found yet. Retrying..."); 
      }
    } catch (err) { showToast("Connection error."); } finally { setVerifying(false); }
  };

  const handleFileUpload = async (e: any) => {
     // ... (Your existing file upload logic) ...
     const file = e.target.files[0];
     if (!file) return;
     showToast("File uploaded!");
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) { setShowLimitModal(true); return; }
    setLoading(true);
    // ... (Your AI logic) ...
    // Simulator for now to verify UI
    setTimeout(() => {
        setAnalysis({ candidate_name: "Test Candidate", score: 95, summary: "Excellent match.", strengths: ["A","B"], gaps: ["C"] });
        setLoading(false);
        if(!isPro) {
            const newCount = scanCount + 1;
            setScanCount(newCount);
            localStorage.setItem('recruit_iq_scans', newCount.toString());
        }
    }, 2000);
  };

  const downloadPDF = () => { /* ... PDF logic ... */ };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] text-white p-10">Loading Recruit-IQ...</div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-xl font-black uppercase">Recruit-IQ</h1>
        <div className="flex gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
            </div>
            <UserButton afterSignOutUrl="/"/>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 h-[600px]">
             {/* INPUTS */}
             <button onClick={handleScreen} disabled={loading} className="w-full py-4 rounded-xl font-black uppercase text-xs bg-indigo-600 shadow-lg mt-10">
                {loading ? "Analyzing..." : "Execute AI Screen"}
             </button>
        </div>
        <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 h-[600px]">
             {/* RESULTS */}
             {analysis && <div className="text-center text-2xl font-bold">{analysis.score}% Match</div>}
        </div>
      </div>

      {/* LIMIT MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
          <div className="relative bg-[#0F172A] border border-slate-700 p-10 rounded-[2rem] max-w-sm w-full text-center">
            <h2 className="text-2xl font-black mb-4 uppercase">Upgrade to Elite</h2>
            {!isSignedIn ? (
              <SignUpButton mode="modal" afterSignUpUrl="/?signup=true">
                 <button className="w-full py-4 bg-indigo-600 rounded-xl font-black uppercase text-xs">Sign Up</button>
              </SignUpButton>
            ) : (
              <div className="space-y-4">
                <a href={finalStripeUrl} className="block w-full py-4 bg-indigo-600 rounded-xl font-black uppercase text-xs">Start Elite Trial</a>
                <button onClick={handleVerifySubscription} disabled={verifying} className="w-full py-2 bg-slate-800 rounded-xl font-bold uppercase text-[9px] text-slate-400 border border-slate-700">
                  {verifying ? "Syncing..." : "I've Paid (Force Unlock)"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {toast.show && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 px-6 py-2 rounded-lg font-black text-[10px] uppercase shadow-2xl">{toast.message}</div>}
    </div>
  );
}
