import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk } from "@clerk/clerk-react";
import logo from '../logo.png';

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

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

REQUIREMENTS:
- 12+ years of software engineering experience in FinTech or Capital Markets.
- Deep expertise in AWS Cloud Architecture (AWS Certified Solutions Architect preferred).
- Proven track record with Kubernetes, Docker, Kafka, Redis, and Terraform.
- Strong proficiency in Go (Golang), C++, Python, and TypeScript.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers.

PROFESSIONAL EXPERIENCE:
Global Quant Solutions | Principal Architect | New York, NY | 2018 - Present
- Architected a serverless data processing pipeline handling 5TB of daily market data using AWS Lambda.
- Reduced infrastructure costs by 35% through aggressive AWS Graviton migration.

InnovaTrade | Senior Staff Engineer | Chicago, IL | 2014 - 2018
- Built the core execution engine in Go, achieving a 50% reduction in order latency.
- Implemented automated failover protocols that prevented over $10M in potential slippage.

TECHNICAL SKILLS:
- Languages: Go, C++, Python, TypeScript, Java.
- Cloud: AWS (EKS, Lambda, Aurora, SQS), Terraform, Docker, Kubernetes.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();
  
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const finalStripeUrl = userEmail 
    ? `${STRIPE_URL}?prefilled_email=${encodeURIComponent(userEmail)}` 
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 4000);
  };

  const handleClear = () => {
    setJdText(''); setResumeText(''); setAnalysis(null); setActiveTab('jd');
    showToast("Dashboard cleared for new search", "info");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        const pdfjs = window.pdfjsLib;
        if (!pdfjs) { showToast("PDF Reader loading... wait 5s.", "error"); return; }
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const loadingTask = pdfjs.getDocument(URL.createObjectURL(file));
        const pdf = await loadingTask.promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => item.str).join(' ') + "\n";
        }
        text = fullText;
      } else { text = await file.text(); }
      
      if (activeTab === 'jd') setJdText(text); else setResumeText(text);
      showToast(`${file.name} uploaded!`, "success");
    } catch (err) { console.error(err); showToast("File read error. Copy/paste instead.", "error"); }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF();
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text("Recruit-IQ Intelligence Report", 20, 20);
    doc.setFontSize(12); doc.setFont("helvetica", "normal"); doc.text(`Candidate Match Analysis & Interview Guide`, 20, 30);
    doc.setTextColor(0, 0, 0); doc.setFontSize(18); doc.setFont("helvetica", "bold");
    const cName = analysis.candidate_name || "Candidate Report";
    doc.text(`${cName}`, 20, 55);
    doc.setTextColor(79, 70, 229); doc.text(`Match Score: ${analysis.score}%`, 140, 55);
    doc.setTextColor(60, 60, 60); doc.setFontSize(12); doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysis.summary || "Summary unavailable", 170);
    doc.text(summaryLines, 20, 70);
    let currentY = 70 + (summaryLines.length * 6) + 15;
    doc.setFont("helvetica", "bold"); doc.setTextColor(16, 185, 129); doc.text("Key Strengths", 20, currentY); currentY += 8;
    doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
    (analysis.strengths || []).forEach((s) => { if (currentY > 280) { doc.addPage(); currentY = 20; } const sLines = doc.splitTextToSize(`• ${s}`, 170); doc.text(sLines, 20, currentY); currentY += (sLines.length * 6) + 2; });
    currentY += 10;
    doc.setFont("helvetica", "bold"); doc.setTextColor(244, 63, 94); doc.text("Critical Gaps", 20, currentY); currentY += 8;
    doc.setFont("helvetica", "normal"); doc.setTextColor(60, 60, 60);
    (analysis.gaps || []).forEach((g) => { if (currentY > 280) { doc.addPage(); currentY = 20; } const gLines = doc.splitTextToSize(`• ${g}`, 170); doc.text(gLines, 20, currentY); currentY += (gLines.length * 6) + 2; });
    doc.addPage(); doc.setFillColor(243, 244, 246); doc.rect(0, 0, 210, 300, 'F');
    doc.setFontSize(18); doc.setTextColor(79, 70, 229); doc.setFont("helvetica", "bold"); doc.text("Strategic Interview Guide", 20, 30);
    doc.setFontSize(12); doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "italic"); doc.text(`Suggested questions for ${cName}:`, 20, 45);
    doc.setFont("helvetica", "normal"); let qPos = 60;
    (analysis.questions || []).forEach((q, i) => { const qLines = doc.splitTextToSize(`${i+1}. ${q}`, 170); doc.text(qLines, 20, qPos); qPos += (qLines.length * 6) + 10; });
    doc.save(`${cName.replace(/\s+/g, '_')}_Report.pdf`); showToast("PDF Report downloaded!", "success");
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) {
      setShowLimitModal(true);
      return;
    }
    if (!jdReady || !resumeReady) {
        showToast("Please complete Step 1 (JD) and Step 2 (Resume) first.", "error");
        return;
    }
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Extract name. Return JSON: {"candidate_name": "Name", "score": 0-100, "summary": "...", "strengths": ["..."], "gaps": ["..."], "questions": ["..."], "outreach_email": "..."}`;

      const response = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON");
      const result = JSON.parse(jsonMatch[0]);

      setAnalysis({
        candidate_name: result.candidate_name || "Candidate",
        score: result.score || 0,
        summary: result.summary || "Done.",
        strengths: result.strengths || [],
        gaps: result.gaps || [],
        questions: result.questions || [],
        outreach_email: result.outreach_email || ""
      });
      
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Analysis Complete", "success");

    } catch (err) { console.error(err); showToast("Analysis failed.", "error"); } 
    finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen font-sans pt-20">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
            <img src={logo} alt="Recruit-IQ" className="h-12 w-auto drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
            <div className="hidden md:block">
                <h1 className="text-2xl font-black tracking-tighter text-white leading-none">Recruit-IQ</h1>
                <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase mt-1">By Core Creativity AI</p>
            </div>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/50 px-4 py-2 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-500/10">
           <span className={`w-2 h-2 rounded-full ${isPro ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`}></span>
           {isPro ? "PRO INTEL ACTIVE" : `FREE TRIAL: ${3 - scanCount} SCANS LEFT`}
        </div>
      </div>

      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-24 right-5 z-[60] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 border ${toast.type === 'error' ? 'bg-rose-950/90 border-rose-500' : 'bg-emerald-950/90 border-emerald-500'}`}>
           <span className="text-xl">{toast.type === 'error' ? '⚠️' : '✅'}</span>
           <p className="text-sm font-bold tracking-wide">{toast.message}</p>
        </div>
      )}

      {/* --- SALES MODAL (UPDATED WITH 3-DAY FREE MESSAGING) --- */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80 animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl group animate-in zoom-in-95 duration-300">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[2.5rem] blur-2xl opacity-40 animate-pulse"></div>
            <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="p-10 md:w-3/5 flex flex-col justify-center relative z-10">
                 <div className="mb-4"><img src={logo} alt="Recruit-IQ Logo" className="h-8 w-auto opacity-90" /></div>
                 
                 <h2 className="text-3xl font-black text-white mb-2 leading-tight">
                    Hire Your Next Star <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">In Seconds.</span>
                 </h2>
                 
                 <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Stop manually screening resumes. Unlock the full power of Recruit-IQ to uncover hidden talent instantly.
                 </p>

                 {/* DYNAMIC BUTTONS */}
                 {!isSignedIn ? (
                   // GUEST -> SIGN UP
                   <>
                     <button onClick={() => clerk.openSignUp()} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl uppercase tracking-wider hover:scale-[1.02] transition-all text-xs shadow-lg shadow-indigo-500/25">
                        Create Free Account
                     </button>
                     <p className="text-center text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-wide">
                        Sign up to claim your <span className="text-emerald-400">3-Day Free Trial</span>
                     </p>
                   </>
                 ) : (
                   // USER -> STRIPE TRIAL
                   <>
                     <a href={finalStripeUrl} className="block w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-bold rounded-xl uppercase tracking-wider hover:scale-[1.02] transition-all text-xs shadow-lg shadow-blue-500/25">
                        Start 3-Day Free Trial
                     </a>
                     <div className="text-center mt-3 space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Then $29/mo • Cancel Anytime</p>
                     </div>
                   </>
                 )}
                 
                 <button onClick={() => setShowLimitModal(false)} className="text-center text-[10px] text-slate-600 mt-4 hover:text-white underline decoration-slate-700 w-full">No thanks, I'll screen manually</button>
              </div>

              {/* Right Side: Visual Proof */}
              <div className="hidden md:flex md:w-2/5 bg-slate-900/50 border-l border-slate-800 flex-col items-center justify-center p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                 <div className="text-center relative z-10 space-y-4">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20 shadow-[0_0_30px_rgba(79,70,229,0.3)]"><span className="text-4xl">💎</span></div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Pro Velocity</h3>
                        <p className="text-xs text-slate-400 mt-1 px-4">Join 500+ recruiters saving 20+ hours per week.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK START */}
      <div className="grid md:grid-cols-3 gap-6">
          <div onClick={() => { setActiveTab('jd'); showToast("Switched to Job Description Input", "info"); }} className={`p-6 rounded-3xl border transition-all cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50 ${jdReady ? 'bg-indigo-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-center mb-2"><h4 className={`font-bold text-[10px] uppercase tracking-widest ${jdReady ? 'text-emerald-400' : 'text-slate-400'}`}>1. Define Requirements</h4>{jdReady && <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✓</span>}</div>
             <p className="text-[11px] text-slate-300">Click here to upload or paste the Job Description.</p>
          </div>
          <div onClick={() => { setActiveTab('resume'); showToast("Switched to Resume Input", "info"); }} className={`p-6 rounded-3xl border transition-all cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50 ${resumeReady ? 'bg-indigo-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-center mb-2"><h4 className={`font-bold text-[10px] uppercase tracking-widest ${resumeReady ? 'text-emerald-400' : 'text-slate-400'}`}>2. Input Candidate</h4>{resumeReady && <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✓</span>}</div>
             <p className="text-[11px] text-slate-300">Click here to upload or paste the Resume.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${analysis ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700'}`}>
             <h4 className="font-bold text-[10px] uppercase tracking-widest mb-2 text-indigo-400">3. Analyze & Act</h4>
             <p className="text-[11px] text-slate-300">Get match score, interview guide, and outreach email.</p>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl">
            <div className="flex gap-3 mb-6">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === 'jd' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>1. Job Description {jdReady && <span className="text-emerald-300 font-bold text-sm">✓</span>}</button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>2. Resume {resumeReady && <span className="text-emerald-300 font-bold text-sm">✓</span>}</button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 hover:text-white transition-colors">Upload / Paste File <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" /></label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400">Load Full Samples</button>
              <button onClick={handleClear} className="flex-none bg-rose-500/10 border border-rose-500/50 py-3 px-4 rounded-xl text-[10px] font-bold uppercase text-rose-400 hover:bg-rose-500 hover:text-white transition-colors">New Search</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed mb-6 focus:border-indigo-500/50 transition-colors placeholder-slate-600"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={activeTab === 'jd' ? "Paste the Job Description here..." : "Paste the Resume here or Upload a PDF/DOCX file..."}
            />
            <button onClick={handleScreen} disabled={loading} className="py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-white bg-gradient-to-r from-indigo-600 to-blue-600 shadow-xl hover:shadow-indigo-500/25 transition-all">
              {loading ? "Analyzing..." : `3. Screen Candidate (${isPro ? 'Unlimited' : `${3 - scanCount} Free Left`}) →`}
            </button>
        </div>

        <div className="h-[850px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Match Confidence</h3>
                  <div className="text-white font-bold text-lg mb-4">{analysis.candidate_name}</div>
                  <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto border border-slate-700"><span>📄</span> Download Report & Guide</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl"><h4 className="text-emerald-400 font-bold uppercase text-[10px] mb-3">Strengths</h4><ul className="text-[11px] text-slate-300 space-y-2">{(analysis.strengths || []).map((s, i) => <li key={i}>• {s}</li>)}</ul></div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl"><h4 className="text-rose-400 font-bold uppercase text-[10px] mb-3">Gaps</h4><ul className="text-[11px] text-slate-300 space-y-2">{(analysis.gaps || []).map((g, i) => <li key={i}>• {g}</li>)}</ul></div>
                </div>
                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <div className="flex justify-between items-center mb-4"><h4 className="text-indigo-400 font-bold uppercase text-[10px]">Targeted Interview Questions</h4><button onClick={downloadPDF} className="text-slate-400 hover:text-white text-[10px] underline">Download Guide</button></div>
                  <ul className="text-[11px] text-slate-300 space-y-3">{(analysis.questions || []).map((q, i) => <li key={i} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">"{q}"</li>)}</ul>
                </div>
                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <h4 className="text-blue-400 font-bold uppercase text-[10px] mb-3">AI Outreach Email</h4>
                  <p className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed bg-[#0B1120] p-5 rounded-xl border border-slate-800">{analysis.outreach_email}</p>
                  <button onClick={() => { navigator.clipboard.writeText(analysis.outreach_email); showToast("Email copied!", "success"); }} className="mt-4 w-full py-3 bg-slate-800 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-700 transition-colors">Copy to Clipboard</button>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] gap-4 uppercase tracking-widest">Waiting for screening data...</div>
            )}
        </div>
      </div>

      {/* --- FOOTER RESTORED & RECONNECTED --- */}
      <footer className="mt-12 border-t border-slate-800 pt-8 pb-12 text-center relative z-10">
        <p className="text-slate-600 text-xs mb-4 font-medium tracking-wide">&copy; {new Date().getFullYear()} Recruit-IQ. Powered by Core Creativity AI.</p>
        <div className="flex justify-center gap-6 text-[10px] font-bold tracking-widest uppercase text-slate-500">
          <a href="#" className="hover:text-indigo-400 transition-colors duration-300">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-400 transition-colors duration-300">Terms of Service</a>
          {/* Functional Email Link */}
          <a href="mailto:support@recruit-iq.com" className="hover:text-indigo-400 transition-colors duration-300 flex items-center gap-1">
             Contact Support
          </a>
        </div>
      </footer>
    </div>
  );
}
