import React, { useState, useRef } from 'react';
import { Sparkles, Zap, Loader2, BarChart3, Briefcase, FileText, Upload, Mail, CheckCircle2, AlertCircle, Printer, DollarSign, Send, ClipboardCheck, Lock, X, Check, Download } from 'lucide-react';

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
  const isJDFilled = jobDescription.trim().length > 20;
  const isResumeFilled = resume.trim().length > 20;

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

  const downloadInterviewGuide = () => {
    if (!analysis) return;
    const content = `RECRUIT-IQ INTERVIEW GUIDE\nCandidate Match: ${analysis.matchScore}%\n\nQUESTIONS:\n` + 
                    analysis.interviewQuestions.map((q, i) => `${i+1}. ${q}`).join('\n');
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Interview_Guide.txt";
    document.body.appendChild(element);
    element.click();
  };

  const handleAnalyze = () => {
    if (!isJDFilled || !isResumeFilled) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        fitSummary: "Jill is an exceptional match. She holds a 100% credential match for the AAMA CMA requirement.",
        strengths: [
          { title: "Technical Stack Mastery", desc: "Expert proficiency in Epic and Cerner EMR systems with 3+ years of direct clinical documentation experience, exceeding the required baseline." },
          { title: "Quantifiable Efficiency", desc: "Demonstrated 25% faster patient intake cycles in previous high-volume Newark clinics (avg 45+ patients/day) while maintaining zero documentation errors." },
          { title: "Clinical Versatility", desc: "Holds dual-competency in Phlebotomy and EKG administration, reducing the need for specialized external laboratory support for 80% of routine visits." },
          { title: "Credential Superiority", desc: "Active AAMA Certified Medical Assistant (CMA) status verified, currently held by only 15% of applicants in the local New Jersey talent pool." }
        ],
        gaps: [
          { title: "Specialized Billing Metrics", desc: "While proficient in ICD-10 coding, candidate has limited experience with the specific high-complexity modifiers required for this oncology-adjacent facility." },
          { title: "Advanced Lab Tech", desc: "Lacks 6+ months experience with the specific COLA-accredited diagnostic equipment used in our facility's internal lab wing." }
        ],
        interviewQuestions: [
          "Describe your specific workflow for ensuring zero-error documentation in Epic during high-volume surges of 40+ patients.",
          "How do you prioritize patient comfort while maintaining a strictly clinical pace during phlebotomy procedures?",
          "Can you walk us through your process for ICD-10 coding validation to prevent insurance claim denials?",
          "How do you handle a situation where a provider asks you to assist in a procedure you have not performed in over 12 months?",
          "Describe your experience with sterile field maintenance during minor in-office surgical procedures."
        ],
        marketData: { low: 38500, avg: 47200, high: 56000 }
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative">
      {/* HEADER & TIER SELECTOR */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)]"></div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">RECRUIT<span className="text-purple-500 ml-1">IQ</span></h1>
        </div>
        <div className="flex bg-slate-950/50 border border-white/5 rounded-2xl p-1">
          <button onClick={() => setSimTier('standard')} className={`px-8 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${simTier === 'standard' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Standard (Free)</button>
          <button onClick={() => setSimTier('pro')} className={`px-8 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${simTier === 'pro' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500'}`}>
            <Zap size={12} fill={simTier === 'pro' ? "currentColor" : "none"} /> Pro
          </button>
        </div>
      </header>

      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-purple-500/40 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24}/></button>
            <div className="text-center">
              <div className="inline-flex p-4 bg-purple-600/20 rounded-2xl mb-6 text-purple-500"><Lock size={32} /></div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Upgrade to Pro</h2>
              <p className="text-slate-400 text-sm mb-8">Access the <span className="text-white font-bold">{lockedFeatureName}</span> and deep talent metrics for $29.99/mo.</p>
              <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-black text-white shadow-xl uppercase tracking-tight">Get Full Access</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* INPUTS - LEFT */}
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[650px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800 p-2 gap-2">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl ${activeTab === 'jd' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-white mr-2 ${isJDFilled ? 'bg-emerald-600' : 'bg-blue-600'}`}>1</span> Upload JD
            </button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl ${activeTab === 'resume' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-white mr-2 ${isResumeFilled ? 'bg-emerald-600' : 'bg-purple-600'}`}>2</span> Upload Resume
            </button>
          </div>
          <textarea className="flex-1 p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" value={activeTab === 'jd' ? jobDescription : resume} onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} placeholder="Enter text..." />
          <div className="p-6 bg-slate-950/30 border-t border-slate-800 flex items-center gap-4">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${analysis ? 'bg-emerald-600' : 'bg-amber-600'}`}>3</div>
             <button onClick={handleAnalyze} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold uppercase shadow-xl flex items-center justify-center gap-2"><Sparkles size={18}/> Run Synergy Scan</button>
          </div>
        </section>

        {/* RESULTS - RIGHT */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {!analysis ? (
             <div className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-700 uppercase text-[10px] tracking-widest italic font-bold">Awaiting Input Scan</div>
          ) : (
            <div className="space-y-6">
              {/* Score - Standard Access */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex items-center gap-8 shadow-xl">
                <div className="w-24 h-24 rounded-full border-4 border-purple-500 flex items-center justify-center bg-slate-950 shrink-0"><span className="text-3xl font-black text-white">{analysis.matchScore}%</span></div>
                <div><h3 className="text-purple-400 font-bold uppercase text-[10px] mb-2 tracking-widest">Synergy Match</h3><p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.fitSummary}"</p></div>
              </div>

              {/* Llocked Detailed Analysis (Strengths & Gaps) */}
              <div onClick={() => handleFeatureClick('pro', 'Talent Audit')} className="relative cursor-pointer group">
                {!hasAccess('pro') && <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl"><div className="bg-purple-600 p-3 rounded-full text-white shadow-lg"><Lock size={20}/></div></div>}
                <div className={`space-y-4 ${!hasAccess('pro') ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <span className="text-emerald-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2 italic tracking-[0.2em]"><CheckCircle2 size={12}/> Predictive Strengths Audit</span>
                    <div className="space-y-4">
                      {analysis.strengths.map((s, i) => (
                        <div key={i} className="border-l-2 border-emerald-500/30 pl-4"><p className="text-xs font-black text-white uppercase mb-1">{s.title}</p><p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p></div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-3xl border border-rose-500/20 shadow-xl">
                    <span className="text-rose-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2 italic tracking-[0.2em]"><AlertCircle size={12}/> Critical Growth Gaps</span>
                    <div className="space-y-4">
                      {analysis.gaps.map((g, i) => (
                        <div key={i} className="border-l-2 border-rose-500/30 pl-4"><p className="text-xs font-black text-white uppercase mb-1">{g.title}</p><p className="text-[11px] text-slate-400 leading-relaxed">{g.desc}</p></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interview Guide - Locked */}
              <div onClick={() => handleFeatureClick('pro', 'Interview Intelligence')} className="relative cursor-pointer">
                {!hasAccess('pro') && <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/5"><Lock size={20} className="text-purple-500"/></div>}
                <div className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl ${!hasAccess('pro') ? 'opacity-30' : ''}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><ClipboardCheck size={14} /> AI Interview Guide</h3>
                    <button onClick={downloadInterviewGuide} className="p-2 bg-slate-950 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-all"><Download size={16} /></button>
                  </div>
                  <div className="space-y-4">
                    {analysis.interviewQuestions.map((q, i) => (
                      <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-xs text-slate-300 italic">"{q}"</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="p-8 border-t border-white/5 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">
        © 2025 Recruit-IQ Predictive Talent Intelligence
      </footer>
    </div>
  );
}
