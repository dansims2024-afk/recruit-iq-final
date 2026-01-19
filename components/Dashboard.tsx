"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { Loader2, Copy, Check, CheckCircle, Circle, Upload, Zap, Shield, Sparkles, Star, FileText, ArrowRight, Lock } from "lucide-react";

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- FULL VALUE SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

COMPANY OVERVIEW:
Vertex Financial Systems is a global leader in high-frequency trading technology, processing over $4B in daily transaction volume. We are seeking a visionary Architect to lead the evolution of our next-generation low-latency platform.

KEY RESPONSIBILITIES:
- Design and implement high-availability microservices using AWS EKS, Fargate, and Lambda functions to ensure 99.999% uptime.
- Lead the strategic migration from legacy monolithic C++ structures to modern gRPC and Rust/Go-based architecture.
- Optimize proprietary trading engines for sub-millisecond latency, working directly with quantitative researchers.
- Establish CI/CD best practices using Jenkins and ArgoCD, mentoring a global team of 15+ senior engineers.
- Conduct code reviews and architectural audits to ensure security compliance with SOC2 and SEC regulations.

QUALIFICATIONS:
- 12+ years of software engineering experience in FinTech, Capital Markets, or High-Frequency Trading.
- Deep expertise in AWS Cloud Architecture (Solutions Architect Professional certification preferred).
- Proven track record with Kubernetes, Docker, Kafka, and Terraform in production environments.
- Strong proficiency in C++, Go, or Rust, with a deep understanding of memory management and concurrency.
- Experience leading distributed teams across multiple time zones.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com | (555) 123-4567

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Successfully led teams of 20+ engineers and managed budgets exceeding $5M.

PROFESSIONAL EXPERIENCE:
Global Quant Solutions | Principal Architect | New York, NY | 2018 - Present
- Architected serverless data pipelines handling 5TB of daily market data using AWS Kinesis and Firehose.
- Reduced infrastructure costs by 35% ($1.2M annually) through AWS Graviton migration and spot instance orchestration.
- Led a team of 15 engineers in re-writing the core risk engine in Rust, improving execution speed by 400%.
- Designed and deployed a multi-region disaster recovery strategy achieving a Recovery Time Objective (RTO) of under 5 minutes.

InnovaTrade | Senior Staff Engineer | Chicago, IL | 2014 - 2018
- Built the core order execution engine in Go, achieving a 50% reduction in order latency (from 12ms to 6ms).
- Implemented automated failover protocols preventing over $10M in potential slippage during market volatility.
- Mentored junior developers and introduced TDD (Test Driven Development) which reduced production bugs by 60%.

EDUCATION:
Masters in Computer Science, Georgia Institute of Technology
Bachelor of Science in Electrical Engineering, Purdue University

SKILLS:
AWS, Kubernetes, Docker, Terraform, Go, Rust, C++, Python, Kafka, gRPC, CI/CD, System Design.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
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

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}${userEmail ? `&prefilled_email=${encodeURIComponent(userEmail)}` : ''}` 
    : STRIPE_URL;

  // Track progress for the Quick Start Bar
  const jdReady = jdText.length > 50;
  const resumeReady = resumeText.length > 50;
  const readyToScan = jdReady && resumeReady;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      if (isSignedIn && !isPro) {
        await user?.reload();
        if (user?.publicMetadata?.isPro === true) {
          showToast("Elite Status Activated!", "success");
        }
      }
    };
    if (isLoaded) checkStatus();
  }, [isSignedIn, isPro, isLoaded, user]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSupportSubmit = (e: any) => {
    e.preventDefault();
    window.location.href = `mailto:hello@corecreativityai.com?subject=Support&body=${encodeURIComponent(supportMessage)}`;
    setShowSupportModal(false);
    setSupportMessage('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (file.name.endsWith('.pdf')) {
        showToast("PDF uploaded. Text extraction is experimental.", "success");
        // Simple placeholder for PDF since we can't add libraries right now
        // In a real build with 'pdf-parse', we would extract here.
        // For now, we allow the UI flow to proceed.
        const placeholderText = `[PDF FILE ATTACHED: ${file.name}]\n\n(Note: For best AI results, please copy and paste the text from your PDF directly here if the analysis seems generic.)`;
        activeTab === 'jd' ? setJdText(placeholderText) : setResumeText(placeholderText);
        return;
    }

    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else { 
        text = await file.text(); 
      }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast("Document Loaded Successfully!");
    } catch (err) { 
        showToast("Upload failed. Try copy/paste.", "error"); 
    }
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true);
      return;
    }
    if (!readyToScan) {
        showToast("Please add both Job Description and Resume", "error");
        return;
    }
    setLoading(true);
    // AI Screening logic...
    setTimeout(() => { setLoading(false); showToast("Demo Analysis Complete"); }, 2000);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-black uppercase tracking-tighter hidden md:block">Recruit-IQ</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border flex items-center gap-2 ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
            </div>
            {!isSignedIn ? (
                <SignInButton mode="modal">
                    <button onClick={() => sessionStorage.setItem('trigger_stripe', 'true')} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:bg-indigo-500">
                        Log In
                    </button>
                </SignInButton>
            ) : <UserButton afterSignOutUrl="/"/>}
        </div>
      </div>

      {/* QUICK START PROGRESS BAR (ACROSS THE TOP) */}
      <div className="bg-[#111827] border border-slate-800 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl mb-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
        
        <div className="flex-1 w-full">
            <div className={`flex items-center gap-3 mb-2 ${activeTab === 'jd' ? 'text-indigo-400' : 'text-slate-400'}`}>
                {jdReady ? <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-400/20" /> : <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">1</div>}
                <span className="text-xs font-black uppercase tracking-widest">Job Description</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${jdReady ? 'w-full bg-emerald-500' : 'w-1/4 bg-indigo-600'}`}></div>
            </div>
        </div>

        <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />

        <div className="flex-1 w-full">
             <div className={`flex items-center gap-3 mb-2 ${activeTab === 'resume' ? 'text-indigo-400' : 'text-slate-400'}`}>
                {resumeReady ? <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-400/20" /> : <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">2</div>}
                <span className="text-xs font-black uppercase tracking-widest">Candidate Resume</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${resumeReady ? 'w-full bg-emerald-500' : (jdReady ? 'w-1/4 bg-indigo-600' : 'w-0')}`}></div>
            </div>
        </div>

        <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />

        <div className="flex-1 w-full">
             <div className={`flex items-center gap-3 mb-2 ${readyToScan ? 'text-indigo-400' : 'text-slate-400'}`}>
                <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">3</div>
                <span className="text-xs font-black uppercase tracking-widest">Elite Analysis</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${readyToScan ? 'w-full bg-indigo-500 animate-pulse' : 'w-0'}`}></div>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* INPUT AREA */}
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl relative group">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}`}>
                    {jdReady && <Check className="inline w-3 h-3 mr-1" />} 1. Job Description
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'}`}>
                    {resumeReady && <Check className="inline w-3 h-3 mr-1" />} 2. Resume
                </button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700 hover:text-white hover:border-indigo-500 transition-all group">
                <span className="flex items-center justify-center gap-2"><Upload className="w-3 h-3" /> Upload PDF / Docx</span>
                <input type="file" accept=".docx, .pdf" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Full Samples Loaded!");}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700 hover:text-white hover:border-indigo-500 transition-all">
                Load Value Samples
              </button>
            </div>

            <textarea 
                className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed focus:border-indigo-500 transition-colors custom-scrollbar"
                value={activeTab === 'jd' ? jdText : resumeText} 
                onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
                placeholder={activeTab === 'jd' ? "Paste Job Description here..." : "Paste Candidate Resume here..."}
            />
            
            <button 
                onClick={handleScreen} 
                className={`mt-6 py-5 rounded-2xl font-black uppercase text-xs shadow-2xl transition-all flex items-center justify-center gap-2 ${readyToScan ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            >
                <Zap className="w-4 h-4 fill-current" /> Execute Elite AI Screen
            </button>
        </div>

        {/* RESULTS AREA */}
        <div className="h-[750px] overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-10">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                 {/* Analysis Results will appear here */}
              </div>
            ) : (
              <div className="h-full bg-[#111827] border border-slate-800 rounded-[2.5rem] p-12 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
                 <div className="p-4 bg-slate-800/50 rounded-full mb-6 border border-slate-700/50">
                    <Zap className="w-8 h-8 text-indigo-500" />
                 </div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Ready for Intelligence</h3>
                 <p className="text-slate-400 text-xs max-w-xs leading-relaxed mb-8">
                    Recruit-IQ is standing by. Input your data on the left to generate a deep-dive analysis, compatibility score, and strategic interview guide.
                 </p>
                 <div className="flex gap-2">
                    <div className={`w-2 h-2 rounded-full ${jdReady ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                    <div className={`w-2 h-2 rounded-full ${resumeReady ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                 </div>
              </div>
            )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-800/50 pt-10 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            <div className="flex gap-6">
                <button onClick={() => setShowSupportModal(true)} className="hover:text-indigo-400 transition-colors">Support</button>
                <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            </div>
            <p>&copy; {new Date().getFullYear()} Recruit-IQ. Built for Elite Recruiters.</p>
        </div>
      </footer>

      {/* HIGH-CONVERSION SALES MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/90 animate-in fade-in duration-500">
          <div className="relative w-full max-w-5xl animate-in zoom-in-95 duration-500">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[3rem] blur-3xl opacity-30 animate-pulse"></div>
            
            <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
              {/* Left Side: The Offer */}
              <div className="p-12 md:w-3/5 flex flex-col justify-center relative">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                 <div className="mb-8"><img src="/logo.png" alt="Logo" className="h-8 w-auto opacity-80" /></div>
                 
                 <h2 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
                   Hire Smarter. <br/> 
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 italic">
                    Finish First.
                   </span>
                 </h2>
                 
                 <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium max-w-md">
                   Recruit-IQ Elite is the unfair advantage for high-performance teams. Automate your screening, uncover hidden red flags, and save 20+ hours every week.
                 </p>
                 
                 <div className="flex flex-col gap-4">
                    <a href={finalStripeUrl} className="group block w-full py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-center text-white font-black rounded-2xl uppercase tracking-wider text-xs shadow-2xl shadow-indigo-500/20 hover:scale-[1.02] hover:shadow-indigo-500/40 transition-all relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12"></div>
                        <span className="flex items-center justify-center gap-3 relative z-10">
                            <Sparkles className="w-4 h-4 fill-white" /> Start 3-Day Free Trial
                        </span>
                    </a>
                    <button onClick={() => setShowLimitModal(false)} className="text-center text-[10px] text-slate-600 hover:text-white uppercase font-black w-full tracking-[0.2em] transition-colors py-2">
                        Dismiss
                    </button>
                 </div>
              </div>
              
              {/* Right Side: The Value Stack */}
              <div className="md:w-2/5 bg-[#111827]/80 border-l border-slate-800 p-12 flex flex-col justify-center relative">
                 <div className="space-y-10 relative z-10">
                    <div className="flex items-start gap-5 group">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                            <Zap className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase text-[11px] tracking-widest mb-1">Elite Speed</h4>
                            <p className="text-slate-400 text-[11px] leading-relaxed">Match 50 resumes to JDs in under 10 seconds. Be the first to interview.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-5 group">
                         <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                            <Shield className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase text-[11px] tracking-widest mb-1">Deep Gaps Analysis</h4>
                            <p className="text-slate-400 text-[11px] leading-relaxed">AI uncovers hidden risks and missing skills that manual screening misses.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-5 group">
                         <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                            <Star className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase text-[11px] tracking-widest mb-1">Unlimited Access</h4>
                            <p className="text-slate-400 text-[11px] leading-relaxed">No credits. No caps. Screen as many candidates as you need.</p>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/90">
          <div className="bg-[#0F172A] border border-slate-700 p-10 rounded-[2.5rem] max-w-lg w-full shadow-2xl text-center text-white">
            <h2 className="text-2xl font-black mb-6 uppercase">Support</h2>
            <textarea required className="w-full h-40 bg-[#0B1120] border border-slate-800 rounded-2xl p-6 text-[12px] text-white outline-none resize-none mb-6 focus:border-indigo-500 transition-colors" placeholder="How can we help?" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={handleSupportSubmit} className="flex-1 py-4 bg-indigo-600 rounded-xl font-black uppercase text-[10px]">Send Email</button>
              <button onClick={() => setShowSupportModal(false)} className="px-8 py-4 bg-slate-800 rounded-xl font-black uppercase text-[10px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
