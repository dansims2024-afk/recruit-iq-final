import React, { useState, useEffect } from 'react';

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
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  Upload: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Lock: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Alert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
};

// --- MAIN COMPONENT ---
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

  // --- LOGIC: File Upload (Fixed for Context Loading) ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    
    // Simulate async file reading
    setTimeout(() => {
      // In production, use pdf.js or mammoth.js here
      const mockContent = `[Loaded from ${file.name}]\n\n` + (activeTab === 'jd' ? FULL_SAMPLE_JD : FULL_SAMPLE_RESUME);
      
      if (activeTab === 'jd') {
        setJdText(mockContent);
      } else {
        setResumeText(mockContent);
      }
      setLoading(false);
      // Reset input so same file can be selected again if needed
      e.target.value = ''; 
    }, 600);
  };

  // --- LOGIC: Screening (5 Strengths, 3 Gaps) ---
  const handleScreen = () => {
    if (!isPremium && screenCount >= MAX_FREE_SCREENS) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    if (!isPremium) setScreenCount(prev => prev + 1);

    setTimeout(() => {
      setAnalysis({
        matchScore: 92,
        summary: "Candidate shows exceptional alignment with architectural scaling needs, though specific React 19 experience needs verification.",
        strengths: [
          "Demonstrated ability to reduce latency by 45% ($2M savings), directly addressing performance goals.",
          "Extensive AWS scaling experience (50 to 500+ microservices).",
          "Strong leadership background mentoring teams of 12-15 engineers.",
          "Proven track record in optimizing database query performance (60% improvement).",
          "Deep expertise in distributed systems architecture."
        ],
        gaps: [
          "Resume emphasizes React but does not explicitly mention React 19 or recent Accessibility standards.",
          "Lack of explicit experience with EKS (Elastic Kubernetes Service) specific migrations.",
          "No direct mention of SOC2 or PCI-DSS compliance leadership."
        ],
        interviewQuestions: [
          "Can you walk us through the specific bottlenecks you identified to achieve the 45% latency reduction?",
          "Describe a scenario where you had to mentor a junior engineer through a complex distributed system failure.",
          "How would you approach migrating our legacy monolith to EKS while maintaining 99.99% uptime?",
          "What is your strategy for ensuring accessibility compliance in a high-velocity component library?",
          "How have you handled security compliance (SOC2) in your previous microservice architectures?"
        ]
      });
      setSalaryIntel({ low: 155000, med: 185000, high: 225000 });
      setLoading(false);
    }, 1500);
  };

  // --- LOGIC: Full Email Generation ---
  const generateEmail = (type) => {
    const subject = type === 'outreach' ? "Subject: Your work on payment engines" : "Subject: Interview Invitation - Recruit-IQ";
    const body = type === 'outreach' 
      ? `Hi Alex,

I came across your profile and was impressed by your work at FinTech Solutions, specifically how you reduced core engine latency by 45%.

At our company, we are tackling similar distributed system challenges as we scale our banking platform to $500M daily volume. Your background in AWS scaling seems like a perfect match for our Lead Architect role.

Would you be open to a brief chat this week to discuss?

Best,
[Your Name]` 
      : `Hi Alex,

Thank you for your application to the Senior Full Stack Engineer role.

We were impressed by your extensive background in distributed systems and your leadership experience scaling teams. We would love to invite you to a technical screen to dive deeper into your architectural approach.

Please let us know your availability for a 45-minute video call over the next few days.

Best,
The Hiring Team`;

    setEmailDraft(`${subject}\n\n${body}`);
  };

  // --- LOGIC: Professional Word Doc Export ---
  const downloadInterviewGuide = () => {
    if (!analysis) return;
    
    // HTML structure for Word
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Interview Guide</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          h1 { color: #2563eb; border-bottom: 2px solid #eee; padding-bottom: 10px; }
          h2 { color: #475569; font-size: 14pt; margin-top: 20px; }
          .question { background-color: #f8fafc; padding: 10px; border-left: 4px solid #2563eb; margin-bottom: 15px; }
          .footer { margin-top: 30px; font-size: 9pt; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>Recruit-IQ Interview Guide</h1>
        <p><strong>Candidate Match Score:</strong> ${analysis.matchScore}%</p>
        <p><strong>Summary:</strong> ${analysis.summary}</p>
        
        <h2>Strategic Questions</h2>
        ${analysis.interviewQuestions.map((q, i) => `
          <div class='question'>
            <strong>Q${i+1}:</strong> ${q}
          </div>
        `).join('')}
        
        <div class="footer">Generated by Recruit-IQ • ${COPYRIGHT}</div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "RecruitIQ_Interview_Guide.doc";
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* HEADER */}
      <header className="h-20 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 group">
             <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition duration-500"></div>
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
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold cursor-pointer hover:border-blue-500 transition shadow-lg">User</div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6 md:p-10 space-y-10">
        
        {/* QUICK START GUIDE (Color Coded 1-2-3) */}
        <div className="bg-gradient-to-r from-slate-900 to-[#0f172a] border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
           <div className="flex items-center gap-4">
             <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg shadow-blue-600/30">1</span>
             <p className="text-xs font-bold uppercase tracking-wide text-slate-300">Fill Job Description</p>
           </div>
           <div className="hidden md:block w-12 h-0.5 bg-slate-800"></div>
           <div className="flex items-center gap-4">
             <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg shadow-indigo-600/30">2</span>
             <p className="text-xs font-bold uppercase tracking-wide text-slate-300">Upload Resume</p>
           </div>
           <div className="hidden md:block w-12 h-0.5 bg-slate-800"></div>
           <div className="flex items-center gap-4">
             <span className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg shadow-emerald-500/30">3</span>
             <p className="text-xs font-bold uppercase tracking-wide text-slate-300">Screen Candidate</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* LEFT: INPUTS */}
          <section className="bg-[#0f172a] rounded-[3rem] border border-slate-800 flex flex-col h-[850px] overflow-hidden shadow-2xl relative">
            {/* Tabs */}
            <div className="flex p-2 bg-[#020617]/40 border-b border-slate-800">
              <button 
                onClick={() => setActiveTab('jd')}
                className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl transition-all relative overflow-hidden group ${activeTab === 'jd' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-900/50'}`}
              >
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${activeTab === 'jd' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>1</span>
                  Job Description
                  {jdText.length > 10 && <Icons.Check />}
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('resume')}
                className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl transition-all relative overflow-hidden group ${activeTab === 'resume' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-900/50'}`}
              >
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${activeTab === 'resume' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>2</span>
                  Resume
                  {resumeText.length > 10 && <Icons.Check />}
                </div>
              </button>
            </div>

            {/* Toolbar */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#020617]/20">
               <label className="flex items-center gap-2 cursor-pointer bg-blue-600/10 px-5 py-2.5 rounded-2xl border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase hover:bg-blue-600/20 transition-all">
                 <Icons.Upload /> Upload {activeTab === 'jd' ? 'JD' : 'Resume'}
                 <input type="file" className="hidden" onChange={handleFileUpload} />
               </label>
               <button 
                 onClick={() => { setJdText(FULL_SAMPLE_JD); setResumeText(FULL_SAMPLE_RESUME); }}
                 className="text-[10px] font-bold uppercase text-slate-500 hover:text-white transition-colors underline decoration-slate-700 underline-offset-4"
               >
                 Load Full Sample
               </button>
            </div>

            {/* Editor Area */}
            <textarea 
              key={activeTab} // Force re-render on tab change to prevent visual bugs
              className="flex-1 p-8 bg-transparent outline-none text-base text-slate-300 resize-none font-medium leading-relaxed custom-scrollbar" 
              placeholder={`Paste or upload ${activeTab === 'jd' ? 'Job Description' : 'Resume'} here...`} 
              value={activeTab === 'jd' ? jdText : resumeText}
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
            />

            {/* Action Area (Color Coded Green/Emerald) */}
            <div className="p-8 border-t border-slate-800 bg-[#020617]/30">
              <button 
                onClick={handleScreen} 
                disabled={loading}
                className="w-full py-6 rounded-3xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <span className="bg-white text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">3</span>
                {loading ? "Analyzing..." : "Screen Candidate"}
              </button>
            </div>
          </section>

          {/* RIGHT: OUTPUTS */}
          <section className="relative space-y-6 h-[850px] overflow-y-auto pr-2 custom-scrollbar">
            
            {!analysis && !loading && (
               <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-600">
                 <p className="text-xs font-black uppercase tracking-[0.2em] mb-4">Ready for Analysis</p>
                 <div className="flex gap-2 text-[10px] uppercase">
                    <span className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-emerald-400">{MAX_FREE_SCREENS - screenCount} Free Screens Remaining</span>
                 </div>
               </div>
            )}

            {analysis && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-10">
                
                {/* MARKET INTEL */}
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
                <div className="bg-[#0f172a] border border-slate-800 rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-2xl">
                   <div className="w-32 h-32 mx-auto rounded-full border-[8px] border-slate-800 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-4xl font-black text-white shadow-2xl mb-6">
                     {analysis.matchScore}%
                   </div>
                   <p className="text-lg text-slate-300 italic font-medium leading-relaxed">"{analysis.summary}"</p>
                </div>

                {/* STRENGTHS & GAPS (5 Strengths, 3 Gaps) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-[#0f172a] border border-emerald-900/30 rounded-3xl p-6 shadow-lg">
                      <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-4 flex items-center gap-2"><Icons.Check /> 5 Key Strengths</h4>
                      <ul className="space-y-3">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-slate-300 leading-relaxed list-disc list-inside marker:text-emerald-500">{s}</li>
                        ))}
                      </ul>
                   </div>
                   <div className="bg-[#0f172a] border border-rose-900/30 rounded-3xl p-6 shadow-lg">
                      <h4 className="text-[10px] font-black uppercase text-rose-500 mb-4 flex items-center gap-2"><Icons.Alert /> 3 Critical Gaps</h4>
                      <ul className="space-y-3">
                        {analysis.gaps.map((g, i) => (
                          <li key={i} className="text-xs text-slate-300 leading-relaxed list-disc list-inside marker:text-rose-500">{g}</li>
                        ))}
                      </ul>
                   </div>
                </div>

                {/* EMAIL OUTREACH GENERATOR (Full Body) */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-xl">
                   <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">One-Click Outreach</h4>
                   <div className="flex gap-3 mb-4">
                      <button onClick={() => generateEmail('outreach')} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase text-white flex items-center justify-center gap-2 transition">
                        <Icons.Mail /> Cold Outreach
                      </button>
                      <button onClick={() => generateEmail('invite')} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black uppercase text-white flex items-center justify-center gap-2 transition">
                         Interview Invite
                      </button>
                   </div>
                   {emailDraft && (
                     <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 animate-in fade-in">
                       <p className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{emailDraft}</p>
                     </div>
                   )}
                </div>

                {/* INTERVIEW GUIDE (Professional Download) */}
                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-3xl p-6 shadow-xl">
                   <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Interview Guide (5 Qs)</h4>
                      <button onClick={downloadInterviewGuide} className="text-[10px] font-bold uppercase text-white bg-indigo-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20">
                        <Icons.Download /> Download Word Doc
                      </button>
                   </div>
                   <div className="space-y-4">
                     {analysis.interviewQuestions.map((q, i) => (
                       <div key={i} className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 shadow-sm">
                         <span className="text-indigo-500 font-bold mr-2 uppercase tracking-wide">Q{i+1}:</span> {q}
                       </div>
                     ))}
                   </div>
                </div>

              </div>
            )}
          </section>
        </div>
      </main>

      {/* FOOTER (Sticky/Fixed Visual Logic via Flexbox) */}
      <footer className="mt-auto border-t border-slate-800 bg-[#0f172a] py-8 px-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 z-40">
        <div>&copy; {COPYRIGHT}</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-blue-500 transition">Privacy Policy</a>
          <a href="#" className="hover:text-blue-500 transition">Terms & Conditions</a>
          <button onClick={() => setShowSupport(true)} className="hover:text-blue-500 transition">Support</button>
        </div>
      </footer>

      {/* MODAL: PAYWALL */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-[#0f172a] border border-amber-500/30 rounded-[3rem] p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                <Icons.Lock />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Free Limit Reached</h2>
              <p className="text-slate-400 text-sm mb-8 px-4">You've used your 3 free screens. Unlock unlimited AI analysis and strategic market intel.</p>
              
              <div className="bg-slate-900 rounded-2xl p-6 mb-8 border border-slate-800 shadow-inner">
                <p className="text-4xl font-black text-white">{SUBSCRIPTION_PRICE}</p>
                <p className="text-[10px] uppercase font-bold text-emerald-400 mt-2 tracking-widest">Includes 3-Day Free Trial</p>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl text-white font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-amber-600/20">
                Start Free Trial
              </button>
              <button onClick={() => setShowPaywall(false)} className="mt-6 text-xs text-slate-500 font-bold uppercase hover:text-white transition">Maybe Later</button>
           </div>
        </div>
      )}

      {/* MODAL: SUPPORT */}
      {showSupport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-[#0f172a] border border-slate-700 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
              <h2 className="text-xl font-black text-white mb-4">Contact Support</h2>
              <p className="text-slate-400 text-sm mb-6">Need help? Our team is available 24/7.</p>
              <button className="w-full py-3 bg-blue-600 rounded-xl text-white font-bold uppercase mb-3 hover:bg-blue-500 transition">Email Us</button>
              <button onClick={() => setShowSupport(false)} className="text-xs text-slate-500 font-bold uppercase hover:text-white transition">Close</button>
           </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
}
