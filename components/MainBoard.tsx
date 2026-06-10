"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
Loader2, Copy, Check, FileText, User, Download, 
Zap, Shield, HelpCircle, CheckCircle2, 
ArrowRight, Sparkles, FileUp, Star, 
  Lock, AlertCircle, TrendingUp, X, CheckCircle, MessageSquare
  Lock, AlertCircle, TrendingUp, X, CheckCircle, MessageSquare, Mail
} from "lucide-react";

// --- CONFIGURATION ---
@@ -61,6 +61,7 @@
const [showSupportModal, setShowSupportModal] = useState(false);
const [supportMessage, setSupportMessage] = useState('');
const [scanCount, setScanCount] = useState(0);
  const [emailCopied, setEmailCopied] = useState(false);
const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

// Status & Logic Helpers
@@ -217,6 +218,17 @@
}
};

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setEmailCopied(true);
      showToast("Outreach Email Copied!");
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      showToast("Failed to copy text.", "error");
    }
  };

const generateReport = async () => {
if (!analysis) return;
const doc = new jsPDF();
@@ -457,27 +469,47 @@
))}
</div>
</div>

                {/* --- OUTREACH EMAIL CAMPAIGN GENERATOR --- */}
                <div className="bg-slate-900/60 border border-slate-800 p-12 rounded-[3rem] space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-3">
                      <Mail className="w-5 h-5 text-indigo-500"/> Candidate Outreach
                    </h4>
                    <button 
                      onClick={() => copyToClipboard(analysis.outreach)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border transition-all ${emailCopied ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-slate-950 border-slate-800 hover:border-indigo-500 text-slate-300'}`}
                    >
                      {emailCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {emailCopied ? "Copied!" : "Copy Email"}
                    </button>
                  </div>
                  <div className="p-8 bg-slate-950/50 rounded-[2rem] border border-slate-800/80 text-slate-300 font-sans text-xs leading-[1.8] whitespace-pre-wrap select-text">
                    {analysis.outreach}
                  </div>
                </div>

</div>
) : (
<div className="h-full border-2 border-dashed border-slate-800 rounded-[4.5rem] flex flex-col items-center justify-center text-slate-600 text-[11px] font-black uppercase tracking-[0.4em] gap-10 p-16 text-center">
<Zap className="w-20 h-20 opacity-5" />
<p>Awaiting IQ Signal</p>
</div>
)}
</div>
</div>

{/* --- SALES MODAL --- */}
{showLimitModal && (
<div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-[30px] bg-slate-950/95 animate-in fade-in">
<div className="relative w-full max-w-2xl bg-[#020617] border border-slate-800 p-14 rounded-[3.5rem] shadow-3xl text-center">
<img src="/logo.png" alt="IQ" className="w-16 h-16 mx-auto mb-8 object-contain" />
<h2 className="text-5xl font-black text-white mb-6 tracking-tighter">Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Elite Intelligence.</span></h2>
<div className="grid grid-cols-2 gap-4 text-left mb-10 max-w-md mx-auto">
<div className="flex items-center gap-3 text-slate-300 text-xs font-bold"><CheckCircle className="w-4 h-4 text-emerald-400" /> Unlimited AI Analysis</div>
<div className="flex items-center gap-3 text-slate-300 text-xs font-bold"><CheckCircle className="w-4 h-4 text-emerald-400" /> Bulk PDF Parsing</div>
<div className="flex items-center gap-3 text-slate-300 text-xs font-bold"><CheckCircle className="w-4 h-4 text-emerald-400" /> Deep Match Scoring</div>
<div className="flex items-center gap-3 text-slate-300 text-xs font-bold"><CheckCircle className="w-4 h-4 text-emerald-400" /> Priority Support</div>
</div>
<div className="inline-flex items-center gap-4 mb-10 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
<span className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-emerald-500/20">3 Days Free</span>
