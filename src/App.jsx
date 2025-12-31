import React, { useState, useRef } from 'react';
import { 
  Upload, CheckCircle, FileText, BrainCircuit, Target, Lock, 
  Search, BookOpen, X, ShieldCheck, Layers, Printer, 
  Zap, ListChecks, Loader2, Sparkles, HelpCircle, TrendingUp, AlertCircle,
  LogIn, User, ArrowRight, LayoutGrid, CreditCard, History, Database, EyeOff, Server, LayoutList
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";

// --- BACKEND SIMULATION UTILITIES ---

// 1. PII Redaction Service (Privacy Shield)
const scrubPII = (text) => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
  return text.replace(emailRegex, "[EMAIL REDACTED]").replace(phoneRegex, "[PHONE REDACTED]");
};

// 2. Token Usage Guardian (Cost Control)
const checkTokenSafety = (textLength, fileCount) => {
  const ESTIMATED_TOKENS = (textLength / 4) + (fileCount * 500);
  const MAX_LIMIT = 8000; 
  return { safe: ESTIMATED_TOKENS < MAX_LIMIT, usage: ESTIMATED_TOKENS };
};

// 3. Mock Database for Batch Leaderboard
const generateLeaderboardData = () => [
  { rank: 1, name: "Alex R. Candidate", score: 88, status: "Interview Ready", match: "High" },
  { rank: 2, name: "Sarah Jenkins", score: 82, status: "Review", match: "High" },
  { rank: 3, name: "Mike Chen", score: 76, status: "Potential", match: "Medium" },
  { rank: 4, name: "David Miller", score: 65, status: "Rejected", match: "Low" },
  { rank: 5, name: "Emily Davis", score: 45, status: "Rejected", match: "Low" },
];

const RecruitIQApp = () => {
  // --- APP STATE ---
  const [textData, setTextData] = useState({ jd: "", resume: "" });
  const [activeTab, setActiveTab] = useState(1);
  const [inputCategory, setInputCategory] = useState('single'); // 'single' or 'batch'
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [cache, setCache] = useState({}); 
  const { user } = useUser(); // Get logged-in user details

  // --- BRAND LOGO ---
  const SwirlLogo = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <defs>
        <linearGradient id="swirlGrad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path d="M20 4C11.1 4 4 11.1 4 20C4 28.8 11.1 36 20 36" stroke="url(#swirlGrad)" strokeWidth="6" strokeLinecap="round" />
      <path d="M36 20C36 11.1 28.8 4 20 4" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      <path d="M20 36C28.8 36 36 28.8 36 20" stroke="#a855f7" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
    </svg>
  );

  // --- LOGIC HANDLERS ---
  const useSample = () => {
    setTextData({
      jd: `SENIOR PRODUCT MANAGER - AI PLATFORM\n\nKey Requirements:\n- 8+ years experience in technical PM roles.\n- Direct experience with LLM orchestration and MLOps.\n- Proficiency in SQL, Python, and Data Visualization.\n- Experience in Series B+ high-growth environments.`,
      resume: `ALEX R. CANDIDATE\n\nProfessional Summary:\nTechnical Product Leader with 6.5 years experience.\n\nKey Achievements:\n- Led OpenAI bot transition at TechFlow, reducing latency by 40%.\n- Managed SQL enterprise analytics dashboards at DataSync.\n- Technical Skills: Python, AWS, S3, LLM Fine-tuning.`
    });
  };

  const handleScreenCandidate = () => {
    // 1. Guardian Check
    const safetyCheck = checkTokenSafety(textData.jd.length + textData.resume.length, inputCategory === 'batch' ? 5 : 1);
    if (!safetyCheck.safe) {
      alert("Input too large! Reduce batch size to prevent server timeout.");
      return;
    }

    // 2. Cache Check
    const cacheKey = inputCategory + textData.jd.length;
    if (cache[cacheKey]) {
      console.log("Serving from Smart Cache (Zero Cost)");
      setShowResultsModal(true);
      return;
    }

    setIsProcessing(true);
    
    // 3. Simulate Backend Steps
    const sequence = [
      { msg: "Scrubbing PII (Privacy Shield)...", delay: 800 },
      { msg: "Tokenizing & Chunking Data...", delay: 1500 },
      { msg: inputCategory === 'batch' ? "Ranking 5 Candidates..." : "Calculating Synergy Score...", delay: 2500 }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex >= sequence.length) {
        clearInterval(interval);
        setIsProcessing(false);
        setShowResultsModal(true);
        setCache(prev => ({...prev, [cacheKey]: true})); 
      } else {
        if (stepIndex === 0) {
           const cleanJD = scrubPII(textData.jd);
           console.log("Redacted PII for Privacy:", cleanJD.substring(0, 50) + "...");
        }
        setProcessingStep(sequence[stepIndex].msg);
        stepIndex++;
      }
    }, 1000);
  };

  const isReady = textData.jd.length > 50 && (inputCategory === 'batch' || textData.resume.length > 50);

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 font-sans relative overflow-x-hidden">
      
      {/* =====================================================================================
          STATE 1: SIGNED OUT (Landing Page)
          - This is visible to everyone.
          - Because you set "Restricted Mode", only YOU can log in here.
      ===================================================================================== */}
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />

          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-20 items-center relative z-10">
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <SwirlLogo size={48} />
                <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">RECRUIT <span className="text-blue-500">IQ</span></h1>
              </div>
              <h2 className="text-5xl font-black text-white leading-tight">
                Private Beta<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Access Only.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                Recruit IQ is currently in restricted mode. Please sign in with your administrator credentials to access the dashboard.
              </p>
            </div>

            <div className="bg-[#0d1117] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center">
              <h3 className="text-2xl font-black text-white mb-2">Admin Login</h3>
              <p className="text-slate-500 text-sm mb-8">Enter your master credentials.</p>
              
              <SignInButton mode="modal">
                <button className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
                  <LogIn size={18} /> Sign In
                </button>
              </SignInButton>
              
              <p className="mt-6 text-xs text-slate-600 font-medium flex items-center justify-center gap-2">
                <Lock size={12} /> Restricted Access Enabled
              </p>
            </div>
          </div>
        </div>
      </SignedOut>

      {/* =====================================================================================
          STATE 2: SIGNED IN (Main App)
          - This is ONLY visible after you log in.
      ===================================================================================== */}
      <SignedIn>
        <div className="p-6 md:p-10">
          
          {/* HEADER */}
          <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 no-print">
            <div className="flex items-center gap-4">
              <SwirlLogo />
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">RECRUIT <span className="text-blue-500">IQ</span></h1>
            </div>
            
            {/* Backend Indicators (Visual) */}
            <div className="hidden lg:flex items-center gap-4 mr-8">
               <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <EyeOff size={12} /> Privacy Shield
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  <Server size={12} /> Smart Cache
               </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-6">
               <div className="hidden md:flex items-center gap-4 text-sm font-bold text-slate-400">
                 <button className="hover:text-white flex items-center gap-2 transition-colors"><LayoutGrid size={16} /> Dashboard</button>
                 <button className="hover:text-white flex items-center gap-2 transition-colors"><CreditCard size={16} /> Billing</button>
               </div>
               <div className="w-px h-6 bg-white/10 hidden md:block"></div>
               <div className="flex items-center gap-3">
                 <div className="text-right hidden md:block">
                   <p className="text-xs font-bold text-white">{user?.fullName || 'Administrator'}</p>
                   <p className="text-[9px] text-emerald-500 uppercase font-black">Master Account</p>
                 </div>
                 <UserButton afterSignOutUrl="/" />
               </div>
            </div>
          </header>

          {/* MAIN DASHBOARD */}
          {!showResultsModal && (
            <main className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
              
              {/* Mode Switcher */}
              <div className="grid grid-cols-2 gap-4 bg-[#0d1117] p-2 rounded-3xl border border-white/5">
                 <button onClick={() => setInputCategory('single')} className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${inputCategory === 'single' ? 'bg-[#1c2128] text-blue-400 shadow-xl' : 'text-slate-600'}`}>
                   <FileText size={16} /> Single Screen
                 </button>
                 <button onClick={() => setInputCategory('batch')} className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${inputCategory === 'batch' ? 'bg-[#1c2128] text-orange-500 shadow-xl' : 'text-slate-600'}`}>
                   <Layers size={16} /> Batch Leaderboard
                 </button>
              </div>

              {/* Input Panel */}
              <div className="bg-[#0d1117] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col min-h-[450px]">
                {/* Tabs (Single Mode Only) */}
                {inputCategory === 'single' && (
                  <div className="flex bg-black/40 p-2 gap-2 border-b border-white/5">
                    {[1, 2].map((num) => (
                      <button key={num} onClick={() => setActiveTab(num)} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black transition-all ${activeTab === num ? 'bg-[#1c2128] text-blue-400 border border-white/5 shadow-lg' : 'text-slate-600'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${num === 1 ? (textData.jd.length > 50 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800') : (textData.resume.length > 50 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800')}`}>
                          {num}
                        </div>
                        {num === 1 ? 'JOB DESCRIPTION' : 'CANDIDATE RESUME'}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Batch Mode Indicator */}
                {inputCategory === 'batch' && (
                   <div className="bg-orange-500/5 p-4 border-b border-orange-500/10 flex items-center justify-center gap-2 text-orange-500">
                      <Database size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Database Batch Mode Active</span>
                   </div>
                )}

                {/* Input Area */}
                <div className="p-8 flex-1 flex flex-col items-center justify-center">
                  {inputCategory === 'batch' ? (
                    <div className="text-center space-y-6">
                       <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-[2rem] flex items-center justify-center mx-auto border border-orange-500/20 shadow-2xl">
                          <Layers size={32} />
                       </div>
                       <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Upload Resume Batch</h3>
                       <button onClick={() => { useSample(); alert("Simulated 5 resumes loaded into batch queue."); }} className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] hover:underline">Load Sample Batch (5 Files)</button>
                    </div>
                  ) : (
                    <textarea 
                      value={activeTab === 1 ? textData.jd : textData.resume}
                      onChange={(e) => setTextData(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: e.target.value }))}
                      placeholder={`Paste the ${activeTab === 1 ? 'Job Description' : 'Resume'} text content here...`}
                      className="w-full h-full min-h-[280px] bg-black/20 border border-white/5 rounded-[2rem] p-8 text-sm text-slate-400 focus:outline-none focus:border-blue-500/50 resize-none font-mono transition-all placeholder:text-slate-800"
                    />
                  )}
                </div>
                
                {/* Quick Populate Button (Single Mode) */}
                {inputCategory === 'single' && (
                   <div className="px-8 pb-8">
                      <button onClick={useSample} className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Populate Sample Data</button>
                   </div>
                )}
              </div>

              {/* Action Button */}
              <button 
                disabled={!isReady || isProcessing}
                onClick={handleScreenCandidate}
                className={`w-full py-10 rounded-[2.5rem] flex items-center justify-center gap-8 font-black tracking-[0.5em] transition-all relative overflow-hidden text-lg ${isReady && !isProcessing ? 'bg-blue-600 text-white shadow-[0_25px_60px_rgba(37,99,235,0.4)]' : 'bg-[#0d1117] text-slate-800 border border-white/5 opacity-50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${isReady ? 'bg-orange-500 text-white shadow-[0_0_20px_#f97316]' : 'bg-slate-900'}`}>
                  {isProcessing ? <Loader2 className="animate-spin" /> : <Zap fill="currentColor" />}
                </div>
                <span className="uppercase">{isProcessing ? processingStep.toUpperCase() : (inputCategory === 'batch' ? 'GENERATE LEADERBOARD' : 'SCREEN CANDIDATE')}</span>
                {isProcessing && <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-blue-400 via-orange-500 to-blue-400 w-full animate-shimmer" />}
              </button>
            </main>
          )}

          {/* RESULTS MODAL (Adapts to Single vs Batch) */}
          {showResultsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-10 bg-black/95 backdrop-blur-3xl overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-white text-slate-900 w-full max-w-4xl rounded-none md:rounded-[3rem] shadow-2xl flex flex-col print:shadow-none print:m-0">
                
                {/* Header */}
                <div className="bg-slate-100 px-10 py-6 flex justify-between items-center no-print border-b border-slate-200">
                   <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">{inputCategory === 'batch' ? 'Candidate Leaderboard' : 'Synergy Audit'}</span>
                   <div className="flex gap-3">
                     <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all">
                        <Printer size={14} /> {inputCategory === 'batch' ? 'Export CSV' : 'Download PDF'}
                     </button>
                     <button onClick={() => setShowResultsModal(false)} className="p-3 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
                   </div>
                </div>

                <div className="p-16 print:p-10 flex-1">
                  <div className="flex justify-between items-start border-b-[6px] border-slate-900 pb-10 mb-10">
                    <div className="flex items-center gap-4">
                      <SwirlLogo size={40} />
                      <h1 className="text-2xl font-black tracking-tighter italic uppercase">RECRUIT <span className="text-blue-600">IQ</span></h1>
                    </div>
                    {inputCategory === 'single' && (
                      <div className="text-right">
                        <div className="text-6xl font-black italic text-blue-600 leading-none">88%</div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Overall Match</p>
                      </div>
                    )}
                  </div>

                  {/* DYNAMIC CONTENT */}
                  {inputCategory === 'batch' ? (
                    // --- BATCH LEADERBOARD VIEW ---
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <LayoutList size={16} className="text-orange-500" /> Top Candidates (Ranked)
                      </h3>
                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                           <thead className="bg-slate-900 text-white text-[9px] uppercase tracking-widest font-black">
                             <tr>
                               <th className="px-6 py-4">Rank</th>
                               <th className="px-6 py-4">Candidate Name</th>
                               <th className="px-6 py-4 text-center">Score</th>
                               <th className="px-6 py-4 text-center">Status</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700">
                             {generateLeaderboardData().map((c) => (
                               <tr key={c.rank} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-4"><span className={`w-6 h-6 flex items-center justify-center rounded-full text-white ${c.rank === 1 ? 'bg-emerald-500' : 'bg-slate-400'}`}>{c.rank}</span></td>
                                 <td className="px-6 py-4">{c.name}</td>
                                 <td className="px-6 py-4 text-center text-blue-600 font-black">{c.score}%</td>
                                 <td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-full text-[9px] uppercase ${c.rank < 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span></td>
                               </tr>
                             ))}
                           </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    // --- SINGLE REPORT VIEW ---
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                         <div className="p-8 bg-emerald-50/50 border border-emerald-100 rounded-[2rem]">
                            <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-3 flex items-center gap-2"><TrendingUp size={14} /> Match Strengths</h4>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">Candidate is a Tier-1 match for AI Infrastructure. Direct evidence of LLM orchestration and MLOps at scale matches our Series B trajectory.</p>
                         </div>
                         <div className="p-8 bg-orange-50/50 border border-orange-100 rounded-[2rem]">
                            <h4 className="text-[10px] font-black text-orange-600 uppercase mb-3 flex items-center gap-2"><AlertCircle size={14} /> Gap Mitigation</h4>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium italic">"Management tenure is 6.5 years vs 8 preferred. Recommend verifying cross-functional leadership depth."</p>
                         </div>
                      </div>
                      <div className="mb-12">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2"><ListChecks size={16} className="text-blue-600" /> Technical Evidence Matrix</h3>
                        <div className="border border-slate-200 rounded-3xl overflow-hidden">
                          <table className="w-full text-left">
                            <thead className="bg-slate-900 text-white text-[9px] uppercase tracking-widest font-black">
                              <tr><th className="px-6 py-4">Requirement</th><th className="px-6 py-4">Resume Evidence</th><th className="px-6 py-4 text-center">Match</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700">
                              <tr><td className="px-6 py-5 uppercase">AI / LLM Integration</td><td className="px-6 py-5 font-normal">Led OpenAI bot transition at TechFlow</td><td className="px-6 py-5 text-center text-blue-600">100%</td></tr>
                              <tr><td className="px-6 py-5 uppercase">SQL / Python</td><td className="px-6 py-5 font-normal">Managed enterprise analytics dashboards</td><td className="px-6 py-
