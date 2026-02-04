"use client";

// CRITICAL: This prevents Vercel from crashing during build
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
  Loader2, Copy, Check, FileText, User, Download, Send, 
  Zap, Shield, HelpCircle, CheckCircle2, XCircle, Info,
  Briefcase
} from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

const SAMPLE_JD = `JOB TITLE: Lead Skilled Trades Supervisor (HVAC/Electrical)
LOCATION: Mid-Atlantic Region (Philadelphia/NJ)
SALARY: $110,000 - $135,000 + Company Vehicle + Bonus...`;

const SAMPLE_RESUME = `ROBERT 'BOB' MILLER
Senior Trades Project Manager | Cherry Hill, NJ...`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();
  
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [verifying, setVerifying] = useState(false);

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`
    : STRIPE_URL;

  const storageKey = user?.id ? `recruit_iq_scans_${user.id}` : 'recruit_iq_scans_guest';

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const savedCount = parseInt(localStorage.getItem(storageKey) || '0');
        setScanCount(savedCount);
    }
  }, [storageKey, user?.id]); 

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const handleReturnFlow = async () => {
      if (isPro) {
        sessionStorage.removeItem('trigger_stripe');
        return; 
      }
      if (sessionStorage.getItem('trigger_stripe') === 'true') {
        sessionStorage.removeItem('trigger_stripe');
        window.location.href = finalStripeUrl;
        return;
      }
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment_success') === 'true' && !isPro) {
        showToast("Finalizing Elite Access...", "info");
        await handleVerifySubscription();
      }
    };
    handleReturnFlow();
  }, [isSignedIn, isPro, isLoaded, user, finalStripeUrl]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type: type as any });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleVerifySubscription = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/manual-check', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        await user?.reload(); 
        if (user?.publicMetadata?.isPro) {
          setShowLimitModal(false);
          showToast("Elite Status Confirmed!", "success");
        }
      }
    } catch (err) { showToast("Connection error.", "error"); } finally { setVerifying(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} Uploaded Successfully!`);
    } catch (err) { showToast("Upload failed.", "error"); } finally { setLoading(false); }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const cName = (analysis.candidate_name || "Candidate").toUpperCase();
    doc.text(`CONFIDENTIAL REPORT: ${cName}`, 15, 20);
    // ... [PDF Generation Logic]
    doc.save(`RecruitIQ_Report_${cName}.pdf`);
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true); return;
    }
    if (!jdReady || !resumeReady) { showToast("Input Required.", "error"); return; }
    setLoading(true);
    setAnalysis(null);
    try {
      const response = await fetch('/api/generate', { 
        method: "POST", 
        body: JSON.stringify({ prompt: `Analyze JD: ${jdText} and Resume: ${resumeText}...` }) 
      });
      if (!response.ok) throw new Error("API Engine Error.");
      const data = await response.json();
      setAnalysis(data);
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem(storageKey, newCount.toString());
      }
      showToast("Intelligence Generated!");
    } catch (err: any) { 
      showToast(err.message || "Connection Error.", "error"); 
    } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-indigo-500 font-black">RECRUIT-IQ INITIALIZING...</div>;

  return (
    <div className="relative p-4 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen font-sans">
      {/* Toast, Header, Wizard, Workspace, Results, and Modals content goes here */}
      <div className="flex justify-between items-center mb-10 border-b border-slate-800/50 pb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        <div className="flex items-center gap-4">
            <div className={`px-6 py-2 rounded-full text-xs font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
            </div>
            {!isSignedIn ? (
                <SignInButton mode="modal" fallbackRedirectUrl="/">
                    <button className="bg-indigo-600 px-6 py-2 rounded-xl text-xs font-bold uppercase">Log In</button>
                </SignInButton>
            ) : <UserButton />}
        </div>
      </div>
      {/* [The rest of your existing JSX UI structure] */}
    </div>
  );
}
