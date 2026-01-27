"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { jsPDF } from "jspdf"; 
import { useUser, useClerk, SignUpButton, UserButton } from "@clerk/nextjs";

// --- CONFIGURATION ---
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

// --- FULL ELITE SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

ABOUT THE COMPANY:
Vertex Financial Systems is a global leader in high-frequency trading technology. We are seeking a visionary Architect to lead the evolution of our next-generation platform.

KEY RESPONSIBILITIES:
- Design and implement high-availability microservices using AWS EKS and Fargate to ensure 99.999% uptime.
- Lead the migration from legacy monolithic structures to a modern, event-driven architecture using Kafka and gRPC.
- Optimize C++ and Go-based trading engines for sub-millisecond latency.
- Establish CI/CD best practices and mentor a global team of 15+ senior engineers.
- Collaborate with quantitative researchers to implement complex trading algorithms.
- Ensure strict compliance with financial regulations and data security standards (SOC2, ISO 27001).

REQUIREMENTS:
- 12+ years of software engineering experience in FinTech or Capital Markets.
- Deep expertise in AWS Cloud Architecture (AWS Certified Solutions Architect preferred).
- Proven track record with Kubernetes, Docker, Kafka, Redis, and Terraform.
- Strong proficiency in Go (Golang), C++, Python, and TypeScript.
- Experience designing low-latency, high-throughput systems.
- Bachelor’s or Master’s degree in Computer Science or related field.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com | (555) 123-4567

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers and successfully delivered multi-million dollar platform overhauls.

PROFESSIONAL EXPERIENCE:
Global Quant Solutions | Principal Architect | New York, NY | 2018 - Present
- Architected a serverless data processing pipeline handling 5TB of daily market data using AWS Lambda and Kinesis.
- Reduced infrastructure costs by 35% through aggressive AWS Graviton migration and spot instance orchestration.
- Led a team of 15 engineers in re-writing the core risk engine, improving calculation speed by 400%.
- Implemented a zero-trust security model across the entire engineering organization.

InnovaTrade | Senior Staff Engineer | Chicago, IL | 2014 - 2018
- Built the core execution engine in Go, achieving a 50% reduction in order latency (sub-50 microseconds).
- Implemented automated failover protocols that prevented over $10M in potential slippage during market volatility.
- Mentored junior developers and established the company's first formal code review process.

TECHNICAL SKILLS:
- Languages: Go, C++, Python, TypeScript, Java, Rust.
- Cloud: AWS (EKS, Lambda, Aurora, SQS, DynamoDB), Terraform, Docker, Kubernetes.
- Architecture: Microservices, Event-Driven Design, Serverless, CQRS.
- Tools: GitLab CI, Prometheus, Grafana, Splunk, Jira.`;

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
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  const finalStripeUrl = user?.id && user?.primaryEmailAddress?.emailAddress
    ? `${STRIPE_URL}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}`
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
    
    if (isLoaded && isSignedIn) {
      user.reload().catch(() => null);
      const urlParams = new URLSearchParams(window.location.search);
      // THE "SLIDE": Automatically redirects to Stripe if fresh signup detected
      if (urlParams.get('signup') === 'true' && !isPro) {
        window.location.href = finalStripeUrl;
        return;
      }
      if (!isPro && savedCount >= 3) setShowLimitModal(true);
    }
  }, [isLoaded, isSignedIn, isPro, finalStripeUrl]);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const handleVerifySubscription = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/manual-check', { method: 'POST' });
      if (res.ok) {
        await user?.reload(); 
        if (user?.publicMetadata?.isPro) {
          setShowLimitModal(false);
          showToast("Elite Status Confirmed!");
        } else { showToast("Verifying... try once more."); }
      } else { showToast("Payment not found yet."); }
    } catch (err) { showToast("Connection error."); } finally { setVerifying(false); }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        // @ts-ignore
        const pdfJS = window.pdfjsLib;
        const pdf = await pdfJS.getDocument(URL.createObjectURL(file)).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item: any) => item.str).join(' ') + "\n";
        }
        text = fullText;
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast("File Validated!");
    } catch (err) { showToast("Upload failed."); }
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) { setShowLimitModal(true); return; }
    if (!jdReady || !resumeReady) { showToast("Input Required."); return; }
    setLoading(true);
    try {
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Extract candidate name, score 0-100, summary, 3 strengths, 3 gaps, 5 questions, and outreach email. Return ONLY JSON.`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)[0]);
      setAnalysis(result);
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Intelligence Generated");
    } catch (err) { showToast("AI Engine Error."); } finally { setLoading(false); }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text("RECRUIT-IQ ELITE REPORT", 20, 25);
    doc.setTextColor(30, 41, 59); doc.setFontSize(18); doc.text(analysis.candidate_name, 20, 55);
    doc.text(`MATCH SCORE: ${analysis.score}%`, 140, 55);
    doc.setFontSize(10); const lines = doc.splitTextToSize(analysis.summary, 170);
    doc.text(lines, 20, 70); doc.save(`RecruitIQ_${analysis.candidate_name}.pdf`);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* ELITE HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
          <div className="hidden md:block">
              <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Elite Candidate Screening</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full text-[10px] font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
            {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
          </div>
          <UserButton afterSignOutUrl="/"/>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* INPUT AREA */}
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl">
          <div className="flex gap-3 mb-6">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>1. Job Description {jdReady && "✓"}</button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>2. Resume {resumeReady && "✓"}</button>
          </div>

          <div className="flex gap-2 mb-4">
            <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-white border border-slate-700">Upload PDF/DOCX<input type="file" onChange={handleFileUpload} className="hidden" /></label>
            <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME); showToast("Elite Samples Loaded");}} className="flex-1 bg-indigo-600/10 py-3 rounded-xl text-[10px] font-bold uppercase text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/20 transition-all">Load Full Samples</button>
          </div>

          <textarea 
            className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed" 
            value={activeTab === 'jd' ? jdText : resumeText} 
            onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} 
            placeholder="Paste raw data here..."
          />
          <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 shadow-xl hover:bg-indigo-500 transition-all">{loading ? "Powering AI Analysis..." : "Execute Elite Screen →"}</button>
        </div>

        {/* OUTPUT AREA */}
        <div className="h-[750px] overflow-y-auto space-y-6 pr-2">
          {analysis ? (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4 border-4 border-indigo-500/50">{analysis.score}%</div>
                <h3 className="uppercase text-[9px] font-bold tracking-widest text-slate-500 mb-1">Elite Match Score</h3>
                <div className="text-white font-bold text-lg mb-4">{analysis.candidate_name}</div>
                <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700">Download Intelligence Report</button>
              </div>
              
              <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl text-xs text-slate-300 space-y-4 shadow-xl">
                <p><strong className="text-indigo-400 uppercase text-[10px] tracking-widest">Executive Summary:</strong><br/><span className="mt-2 block leading-relaxed">{analysis.summary}</span></p>
                <p><strong className="text-emerald-400 uppercase text-[10px] tracking-widest">Key Strengths:</strong><br/><span className="mt-2 block leading-relaxed">{analysis.strengths.join(' • ')}</span></p>
                <p><strong className="text-rose-400 uppercase text-[10px] tracking-widest">Critical Gaps:</strong><br/><span className="mt-2 block leading-relaxed">{analysis.gaps.join(' • ')}</span></p>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase tracking-widest gap-4 opacity-40">
              <span className="text-5xl">📊</span>
              Intelligence Engine Idle...<br/>Complete Steps 1 & 2 to Begin
            </div>
          )}
        </div>
      </div>

      {/* UPGRADE MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
          <div className="relative bg-[#0F172A] border border-slate-700 p-10 rounded-[2rem] max-w-sm w-full text-center shadow-2xl">
            <button onClick={() => setShowLimitModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white font-bold">✕</button>
            <h2 className="text-3xl font-black mb-4 text-white uppercase tracking-tighter">Upgrade to Elite</h2>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed">You have exhausted your trial scans. Access unlimited intelligence reports and strategic guides now.</p>
            {!isSignedIn ? (
              <SignUpButton mode="modal" afterSignUpUrl="/?signup=true">
                <button className="w-full py-5 bg-indigo-600 rounded-xl font-black uppercase text-xs shadow-xl">Create Elite Account</button>
              </SignUpButton>
            ) : (
              <div className="space-y-4">
                <a href={finalStripeUrl} target="_blank" className="block w-full py-5 bg-indigo-600 rounded-xl font-black uppercase text-xs shadow-xl hover:bg-indigo-500 transition-all">Start Elite Trial</a>
                <button onClick={handleVerifySubscription} disabled={verifying} className="w-full py-3 bg-slate-800 rounded-xl font-bold uppercase text-[10px] text-slate-400 border border-slate-700 hover:text-white transition-all">
                  {verifying ? "Syncing Stripe..." : "I've Already Paid (Force Unlock)"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOASTS */}
      {toast.show && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 px-8 py-3 rounded-2xl font-black text-[10px] uppercase shadow-2xl z-[200] animate-in slide-in-from-bottom">{toast.message}</div>}
    </div>
  );
}
