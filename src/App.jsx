import React, { useState, useRef } from 'react';
import { Sparkles, Zap, Loader2, BarChart3, Briefcase, FileText, Upload, Mail, CheckCircle2, AlertCircle, Printer, DollarSign, Send, ClipboardCheck, Lock, X, Check, Download, Twitter, Linkedin, Github, TrendingUp, Target, Users } from 'lucide-react';

export default function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [activeTab, setActiveTab] = useState('jd');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simTier, setSimTier] = useState('standard');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState('');
  
  const fileInputRef = useRef(null);
  const isJDFilled = jobDescription.trim().length > 50;
  const isResumeFilled = resume.trim().length > 50;

  const hasAccess = (feature) => {
    if (simTier === 'pro') return true;
    return feature === 'score'; 
  };

  const handleFeatureClick = (feature, name) => {
    if (!hasAccess(feature)) {
      setLockedFeatureName(name);
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const handleAnalyze = () => {
    if (!isJDFilled || !isResumeFilled) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        fitSummary: "Jill is an exceptional match. She holds a 100% credential match for the AAMA CMA requirement.",
        strengths: [
          { title: "Technical Stack Mastery", desc: "Expert proficiency in Epic and Cerner EMR systems with 3+ years of experience." },
          { title: "Quantifiable Efficiency", desc: "25% faster patient intake cycles in high-volume Newark clinics (45+ patients/day)." }
        ],
        gaps: [
          { title: "Oncology Billing Complexity", desc: "Candidate has limited exposure to oncology-specific modifiers." }
        ],
        interviewQuestions: [
          "Describe your workflow for zero-error documentation in Epic during surges.",
          "How do you prioritize patient comfort while maintaining clinical pace?"
        ],
        marketData: { low: 38500, avg: 47200, high: 56000 }
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative">
      
      {/* 1. BENEFIT-DRIVEN UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-purple-500/40 w-full max-w-xl rounded-3xl p-10 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-20 bg-purple-600/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white z-10 transition-colors"><X size={24}/></button>
            
            <div className="text-center relative z-10">
              <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-6 shadow-lg shadow-purple-500/20 text-white">
                <Zap size={32} fill="currentColor" />
              </div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Upgrade to Recruit-IQ Pro</h2>
              <p className="text-slate-400 text-sm mb-10">Unlock the <span className="text-white font-bold">{lockedFeatureName}</span> and transform your hiring workflow.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><TrendingUp size={20}/></div>
                  <div><p className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Market Edge</p><p className="text-[10px] text-slate-500 leading-relaxed">Access real-time compensation data to win top talent.</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500"><Target size={20}/></div>
                  <div><p className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Deep Audit</p><p className="text-[10px] text-slate-500 leading-relaxed">Expose critical growth gaps before the first interview.</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500"><Users size={20}/></div>
                  <div><p className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Standardized Vetting</p><p className="text-[10px] text-slate-500 leading-relaxed">Generate 5 context-aware questions to eliminate hiring bias.</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500"><Send size={20}/></div>
                  <div><p className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Instant Outreach</p><p className="text-[10px] text-slate-500 leading-relaxed">Move from scan to email in under 60 seconds.</p></div>
                </div>
              </div>

              <button className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-black text-white shadow-xl shadow-purple-600/20 uppercase tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all">
                Activate Pro for $29.99/mo
              </button>
              <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest font-bold italic">Unlock full predictive intelligence today</p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER & QUICK START (Same as previous) */}
      
      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* INPUT PANEL (Same as previous) */}

        {/* RESULTS PANEL - RESTRUCTURED */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {analysis && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              
              {/* Synergy Match Result (Always Visible) */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex items-center gap-8 shadow-xl">
                <div className="w-24 h-24 rounded-full border-4 border-purple-500 flex items-center justify-center bg-slate-950 shrink-0"><span className="text-3xl font-black text-white">{analysis.matchScore}%</span></div>
                <div><h3 className="text-purple-400 font-bold uppercase text-[10px] mb-2 tracking-widest">Synergy Match Result</h3><p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.fitSummary}"</p></div>
              </div>

              {/* Strengths & Gaps (Pro Only) */}
              <div onClick={() => handleFeatureClick('pro', 'Talent Audit')} className="relative cursor-pointer group">
                {!hasAccess('pro') && <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl"><Lock size={20} className="text-purple-500"/></div>}
                <div className={`space-y-4 ${!hasAccess('pro') ? 'opacity-40 grayscale blur-[1px]' : ''}`}>
                  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <span className="text-emerald-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2 italic tracking-[0.2em]"><CheckCircle2 size={12}/> Predictive Strengths Audit</span>
                    {/* ... Strengths Map ... */}
                  </div>
                  <div className="bg-slate-900 p-6 rounded-3xl border border-rose-500/20 shadow-xl">
                    <span className="text-rose-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2 italic tracking-[0.2em]"><AlertCircle size={12}/> Critical Growth Gaps</span>
                    {/* ... Gaps Map ... */}
                  </div>
                </div>
              </div>

              {/* Interview Guide (Pro Only) */}
              <div onClick={() => handleFeatureClick('pro', 'Interview Intelligence')} className="relative cursor-pointer group">
                {!hasAccess('pro') && <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl"><Lock size={20} className="text-purple-500"/></div>}
                <div className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl ${!hasAccess('pro') ? 'opacity-40 grayscale blur-[1px]' : ''}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><ClipboardCheck size={14} /> AI Interview Guide</h3>
                  </div>
                  <div className="space-y-4">
                    {analysis.interviewQuestions.map((q, i) => (
                      <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-xs text-slate-300 italic">"{q}"</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MARKET INTELLIGENCE - MOVED UNDER INTERVIEW GUIDE */}
              <div onClick={() => handleFeatureClick('pro', 'Market Intelligence')} className="relative cursor-pointer group">
                {!hasAccess('pro') && <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl"><Lock size={20} className="text-purple-500"/></div>}
                <div className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl ${!hasAccess('pro') ? 'opacity-40 grayscale blur-[1px]' : ''}`}>
                  <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-10 flex items-center gap-2"><DollarSign size={14}/> Comp Intelligence</h3>
                  <div className="h-4 bg-slate-950 rounded-full border border-white/5 relative mx-4">
                     <div className="absolute left-1/2 -top-10 -translate-x-1/2 flex flex-col items-center">
                         <span className="text-[14px] font-black text-white">$47,200</span>
                         <div className="w-0.5 h-6 bg-purple-500 mt-1"></div>
                     </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </section>
      </main>
    </div>
  );
}
