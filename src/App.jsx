import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- CONFIGURATION & SAMPLES ---
const APP_NAME = "Recruit-IQ";
const COPYRIGHT = "Core Creativity AI 2026";
const MAX_FREE_SCREENS = 3;
const SUBSCRIPTION_PRICE = "$29.99/mo";

const FULL_SAMPLE_JD = `## SENIOR FULL STACK ENGINEER (FINTECH INNOVATION)
# MISSION CONTEXT
Lead the architectural evolution of our flagship digital banking platform. Scale services handling $500M+ in daily volume.

# STRATEGIC RESPONSIBILITIES
- Architect scalable microservices using Node.js and TypeScript.
- Build high-performance, accessible UIs with React 19.
- Lead legacy-to-cloud migration strategies on AWS (EKS, RDS).
- Mentor a team of 15+ engineers.

# REQUIREMENTS
- 8+ years of professional software engineering experience.
- Deep expertise in distributed systems.`;

const FULL_SAMPLE_RESUME = `ALEX RIVERA | San Francisco, CA
# EXPERIENCE
FINTECH SOLUTIONS | LEAD ENGINEER
- Redesigned core payment engine, reducing latency by 45%.
- Scaled AWS infrastructure from 50 to 500+ microservices.

DIGITAL LEDGER INC. | SENIOR DEVELOPER
- Built reusable UI component library used by 200+ developers.
- Optimized PostgreSQL queries improving load times by 60%.`;

// --- ICONS (Build-Safe SVGs) ---
const Icons = {
  Zap: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>,
  Upload: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Lock: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
};

// --- COMPONENT: RECRUIT-IQ ---
export default function RecruitIQApp() {
  // State
  const [activeTab, setActiveTab] = useState('jd'); // 'jd' or 'resume'
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [salaryIntel, setSalaryIntel] = useState(null);
  
  // Freemium Logic
  const [screenCount, setScreenCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Modals
  const [showSupport, setShowSupport] = useState(false);

  // --- LOGIC: File Upload (Fixed) ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a real app, you'd use pdf.js here. For this demo, we simulate text extraction.
    // Simulating async read:
    setLoading(true);
    setTimeout(() => {
      const mockContent = `[Extracted content from ${file.name}]\n\n${FULL_SAMPLE_RESUME}`;
      
      // FIX: Explicitly set the text based on the ACTIVE TAB to ensure the box fills
      if (activeTab === 'jd') {
        setJdText(mockContent);
      } else {
        setResumeText(mockContent);
      }
      setLoading(false);
    }, 800);
  };

  // --- LOGIC: Screening (Freemium Gate) ---
  const handleScreen = () => {
    if (!isPremium && screenCount >= MAX_FREE_SCREENS) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    // Increment count if free
    if (!isPremium) setScreenCount(prev => prev + 1);

    // Simulate AI Analysis
    setTimeout(() => {
      setAnalysis({
        matchScore: 88,
        summary: "Strong candidate with direct architectural experience in FinTech scaling.",
        strengths: [
          "Proven ability to reduce latency by 45% ($2M savings).",
          "Scaled AWS infrastructure from 50 to 500+ services.",
          "Led cross-functional teams of 12+ engineers."
        ],
        gaps: [
          "Lack of explicit React 19 commercial experience.",
          "No specific mention of EKS migration strategies.",
          "Limited exposure to regulatory audit leadership (SOC2)."
        ],
        interviewQuestions: [
          "Describe the specific architectural bottlenecks you resolved to achieve the 45% latency reduction.",
          "How do you approach team mentorship when scaling from 5 to 15 engineers?",
          "Walk us through a failed migration strategy you've encountered and how you pivoted.",
          "How do you ensure accessibility standards are met in a high-velocity UI team?",
          "What is your strategy for maintaining data consistency across 500+ microservices?"
        ]
      });
      // Simulate Market Intel trigger
      setSalaryIntel({ low: 155000, med: 185000, high: 225000 });
      setLoading(false);
    }, 1500);
  };

  // --- LOGIC: Generators ---
  const generateEmail = (type) => {
    const draft = type === 'outreach' 
      ? "Subject: Your work on payment engines\n\nHi Alex,\n\nI saw your success reducing latency by 45% at FinTech Solutions. We are tackling a similar scaling challenge..." 
      : "Subject: Interview Invitation - Recruit-IQ\n\nHi Alex,\n\nWe were impressed by your background in distributed systems. We'd like to invite you to a technical screen...";
    setEmailDraft(draft);
  };

  const downloadInterviewGuide = () => {
    if (!analysis) return;
    const content = `INTERVIEW GUIDE FOR ${APP_NAME}\n\nQUESTIONS:\n${analysis.interviewQuestions.map((q,i) => `${i+1}. ${q}`).join('\n\n')}`;
    const blob = new Blob([content], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "Interview_Guide.doc";
    link.click();
  };

  // --- RENDER HELPERS ---
  const TabButton = ({ id, label, current, set, filled, stepNum }) => (
    <button 
      onClick={() => set(id)}
      className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl transition-all relative overflow-hidden group ${current === id ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-900/50'}`}
    >
      <div className="flex items-center justify-center gap-2 relative z-10">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${current === id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
          {stepNum}
        </span>
        {label}
        {filled && <Icons.Check />}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 pb-20">
      
      {/* HEADER */}
      <header className="h-20 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* Swirl Logo Logic */}
          <div className="relative w-10 h-10">
             <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl blur-sm opacity-50"></div>
             <div className="relative w-full h-full bg-[#0f172a] rounded-xl flex items-center justify-center border border-white/10">
               <Icons.Zap />
             </div>
          </div>
          <span className="text-xl font-black uppercase tracking-tighter text-white">{APP_NAME}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowPaywall(true)}
            className="hidden md:block text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-all"
          >
            {isPremium ? "Premium Active" : `${MAX_FREE_SCREENS - screenCount} Free Screens Left`}
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold cursor-pointer hover:border-blue-500 transition">User</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-6 md:p-10 space-y-10">
        
        {/* QUICK START GUIDE (1-2-3) */}
        <div className="bg-gradient-to-r from-slate-900 to-[#0f172a] border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
           <div className="flex items-center gap-4">
             <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg shadow-blue-600/20">1</span>
             <p className="text-xs font-bold uppercase tracking-wide text-slate-300">Fill Job Description</p>
           </div>
           <div className="hidden md:block w-12 h-0.5 bg-slate-800"></div>
           <div className="flex items-center gap-4">
             <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg shadow-indigo-600/20">2</span>
             <p className="text-xs font-bold uppercase tracking-wide text-slate-300">Upload Resume</p>
           </div>
           <div className="hidden md:block w-12 h-0.5 bg-slate-800"></div>
           <div className="flex items-center gap-4">
             <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg shadow-emerald-600/20">3</span>
             <p className="text-xs font-bold uppercase tracking-wide text-slate-300">Screen Candidate</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* LEFT: INPUTS */}
          <section className="bg-[#0f172a] rounded-[3rem] border border-slate-800 flex flex-col h-[800px] overflow-hidden shadow-2xl relative">
            {/* Tabs */}
            <div className="flex p-2 bg-[#020617]/40 border-b border-slate-800">
              <TabButton id="jd" label="Job Description" current={activeTab} set={setActiveTab} filled={jdText.length > 10} stepNum="1" />
              <TabButton id="resume" label="Candidate Resume" current={activeTab} set={setActiveTab} filled={resumeText.length > 10} stepNum="2" />
            </div>

            {/* Toolbar */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#020617]/20">
               <label className="flex items-center gap-2 cursor-pointer bg-blue-600/10 px-5 py-2.5 rounded-2xl border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase hover:bg-blue-600/20 transition-all">
                 <Icons.Upload /> Upload {activeTab === 'jd' ? 'JD' : 'Resume'}
                 <input type="file" className="hidden" onChange={handleFileUpload} />
               </label>
               <button 
                 onClick={() => { setJdText(FULL_SAMPLE_JD); setResumeText(FULL_SAMPLE_RESUME); }}
                 className="text-[10px] font-bold uppercase text-slate-500 hover:text-white transition-colors"
               >
                 Load Full Sample
               </button>
            </div>

            {/* Editor Area */}
            <textarea 
              className="flex-1 p-8 bg-transparent outline-none text-base text-slate-300 resize-none font-medium leading-relaxed" 
              placeholder={`Paste or upload ${activeTab === 'jd' ? 'Job Description' : 'Resume'} here...`} 
              value={activeTab === 'jd' ? jdText : resumeText}
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
            />

            {/* Action Area */}
            <div className="p-8 border-t border-slate-800 bg-[#020617]/30">
              <button 
                onClick={handleScreen} 
                disabled={loading}
                className="w-full py-6 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <span className="bg-white text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-[10px]">3</span>
                {loading ? "Analyzing..." : "Screen Candidate"}
              </button>
            </div>
          </section>

          {/* RIGHT: OUTPUTS */}
          <section className="relative space-y-6 h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            
            {/* Paywall Overlay if locked */}
            {/* Note: This is logic-driven, but visually implied if content is missing or via modal */}
            
            {!analysis && !loading && (
               <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-600">
                 <p className="text-xs font-black uppercase tracking-[0.2em] mb-4">Ready for Analysis</p>
                 <div className="flex gap-2 text-[10px] uppercase">
                    <span className="px-3 py-1 bg-slate-800 rounded-full">{MAX_FREE_SCREENS - screenCount} Free Screens Remaining</span>
                 </div>
               </div>
            )}

            {analysis && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-10">
                
                {/* MARKET INTEL HEADER */}
                <div className="flex items-center gap-4 mb-2">
                   <div className="h-px bg-slate-800 flex-1"></div>
                   <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Market Intelligence</span>
                   <div className="h-px bg-slate-800 flex-1"></div>
                </div>

                {salaryIntel && (
                  <div className="grid grid-cols-3 gap-4">
                     <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                       <p className="text-[9px] font-black uppercase text-slate-500">Entry</p>
                       <p className="text-white font-bold">${salaryIntel.low/1000}k</p>
                     </div>
                     <div className="bg-blue-600 p-4 rounded-2xl text-center shadow-lg transform scale-105">
                       <p className="text-[9px] font-black uppercase text-blue-200">Median</p>
                       <p className="text-white font-bold text-lg">${salaryIntel.med/1000}k</p>
                     </div>
                     <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
                       <p className="text-[9px] font-black uppercase text-slate-500">Premium</p>
                       <p className="text-white font-bold">${salaryIntel.high/1000}k</p>
                     </div>
                  </div>
                )}

                {/* SYNERGY SCORE */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 text-center relative overflow-hidden">
                   <div className="w-32 h-32 mx-auto rounded-full border-[8px] border-slate-800 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-4xl font-black text-white shadow-2xl mb-6">
                     {analysis.matchScore}%
                   </div>
                   <p className="text-lg text-slate-300 italic font-medium">"{analysis.summary}"</p>
                </div>

                {/* STRENGTHS & GAPS (EXPANDED) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-[#0f172a] border border-emerald-900/30 rounded-3xl p-6">
                      <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-4 flex items-center gap-2"><Icons.Check /> Key Strengths</h4>
                      <ul className="space-y-3">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-slate-300 leading-relaxed list-disc list-inside marker:text-emerald-500">{s}</li>
                        ))}
                      </ul>
                   </div>
                   <div className="bg-[#0f172a] border border-rose-900/30 rounded-3xl p-6">
                      <h4 className="text-[10px] font-black uppercase text-rose-500 mb-4 flex items-center gap-2">⚠️ Critical Gaps</h4>
                      <ul className="space-y-3">
                        {analysis.gaps.map((g, i) => (
                          <li key={i} className="text-xs text-slate-300 leading-relaxed list-disc list-inside marker:text-rose-500">{g}</li>
                        ))}
                      </ul>
                   </div>
                </div>

                {/* EMAIL OUTREACH GENERATOR */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6">
                   <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4">One-Click Outreach</h4>
                   <div className="flex gap-3 mb-4">
                      <button onClick={() => generateEmail('outreach')} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase text-white flex items-center justify-center gap-2">
                        <Icons.Mail /> Cold Outreach
                      </button>
                      <button onClick={() => generateEmail('invite')} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black uppercase text-white flex items-center justify-center gap-2">
                         Interview Invite
                      </button>
                   </div>
                   {emailDraft && (
                     <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                       <p className="text-xs text-slate-400 whitespace-pre-wrap italic">{emailDraft}</p>
                     </div>
                   )}
                </div>

                {/* INTERVIEW GUIDE */}
                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-3xl p-6">
                   <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-black uppercase text-indigo-400">Interview Guide (5 Qs)</h4>
                      <button onClick={downloadInterviewGuide} className="text-[10px] font-bold uppercase text-white bg-indigo-600 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-indigo-500 transition">
                        <Icons.Download /> Download Word Doc
                      </button>
                   </div>
                   <div className="space-y-3">
                     {analysis.interviewQuestions.map((q, i) => (
                       <div key={i} className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                         <span className="text-indigo-500 font-bold mr-2">Q{i+1}:</span> {q}
                       </div>
                     ))}
                   </div>
                </div>

              </div>
            )}
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="absolute bottom-0 w-full border-t border-slate-800 bg-[#0f172a] py-6 px-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <div>&copy; {COPYRIGHT}</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <a href="#" className="hover:text-white transition">Terms & Conditions</a>
          <button onClick={() => setShowSupport(true)} className="hover:text-white transition">Support</button>
        </div>
      </footer>

      {/* MODAL: PAYWALL */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-[#0f172a] border border-amber-500/30 rounded-[3rem] p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.Lock />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Free Limit Reached</h2>
              <p className="text-slate-400 text-sm mb-8">You've used your 3 free screens. Unlock unlimited AI analysis and detailed market intel.</p>
              
              <div className="bg-slate-900 rounded-2xl p-6 mb-8 border border-slate-800">
                <p className="text-3xl font-black text-white">{SUBSCRIPTION_PRICE}</p>
                <p className="text-[10px] uppercase font-bold text-emerald-400 mt-2">Includes 3-Day Free Trial</p>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl text-white font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl">
                Start Free Trial
              </button>
              <button onClick={() => setShowPaywall(false)} className="mt-4 text-xs text-slate-500 font-bold uppercase hover:text-white">Maybe Later</button>
           </div>
        </div>
      )}

      {/* MODAL: SUPPORT */}
      {showSupport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-[#0f172a] border border-slate-700 rounded-3xl p-8 max-w-sm w-full text-center">
              <h2 className="text-xl font-black text-white mb-4">Contact Support</h2>
              <p className="text-slate-400 text-sm mb-6">Need help? Our team is available 24/7.</p>
              <button className="w-full py-3 bg-blue-600 rounded-xl text-white font-bold uppercase mb-3">Email Us</button>
              <button onClick={() => setShowSupport(false)} className="text-xs text-slate-500 font-bold uppercase">Close</button>
           </div>
        </div>
      )}

    </div>
  );
}
