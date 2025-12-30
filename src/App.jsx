import React, { useState, useRef } from 'react';
import { Sparkles, Zap, Loader2, BarChart3, Briefcase, FileText, Upload, Mail, CheckCircle2, AlertCircle, Printer, DollarSign, Send, ClipboardCheck, Lock, X } from 'lucide-react';

export default function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [activeTab, setActiveTab] = useState('jd');
  const [analysis, setAnalysis] = useState(null);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [simTier, setSimTier] = useState('standard');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState('');
  
  const fileInputRef = useRef(null);
  const isJDFilled = jobDescription.trim().length > 50;
  const isResumeFilled = resume.trim().length > 50;

  // --- Tier Logic ---
  const hasAccess = (feature) => {
    const tiers = {
      standard: ['scan'],
      professional: ['scan', 'market', 'email'],
      executive: ['scan', 'market', 'email', 'interview']
    };
    return tiers[simTier].includes(feature);
  };

  const handleFeatureClick = (feature, name) => {
    if (!hasAccess(feature)) {
      setLockedFeatureName(name);
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const loadSampleData = () => {
    setJobDescription(`📄 Job Title: Medical Assistant\nOverview: Seeking a skilled Medical Assistant...`);
    setResume(`Jill McSample | Newark, NJ\nSummary: Compassionate Medical Assistant...`);
  };

  const handleAnalyze = () => {
    if (!isJDFilled || !isResumeFilled) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        fitSummary: "Jill is an exceptional match...",
        strengths: ["CMA Certification", "EMR Proficiency", "Local Experience", "Clinical Versatility"],
        gaps: ["Specialized Lab Testing", "Inventory Systems"],
        interviewQuestions: ["Q1", "Q2", "Q3", "Q4", "Q5"],
        marketData: { low: 38500, avg: 47200, high: 56000 }
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative">
      
      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-purple-500/30 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={20}/></button>
            <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
              <Lock className="text-purple-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Unlock</h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              The <span className="text-purple-400 font-bold">{lockedFeatureName}</span> is not available on the <span className="uppercase font-bold tracking-tighter">{simTier}</span> plan. 
              Upgrade your Intelligence Tier to access advanced recruiting tools.
            </p>
            <div className="space-y-3">
               <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-white hover:opacity-90 transition-all">View Pricing Plans</button>
               <button onClick={() => setShowUpgradeModal(false)} className="w-full py-4 bg-slate-800 rounded-xl font-bold text-slate-300 hover:bg-slate-700 transition-all">Maybe Later</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)]"></div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">RECRUIT<span className="text-purple-500 ml-1">IQ</span></h1>
        </div>
        <div className="flex bg-slate-950/50 border border-white/5 rounded-2xl p-1 shadow-inner">
          {['standard', 'professional', 'executive'].map(t => (
            <button key={t} onClick={() => setSimTier(t)} className={`px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${simTier === t ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500'}`}>{t}</button>
          ))}
        </div>
      </header>

      {/* QUICK START STEPS (1,2,3 logic remains same) */}
      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* INPUT PANEL (Step 1 & 2) */}
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800 p-2 gap-2">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 text-xs uppercase font-bold rounded-xl transition-all ${activeTab === 'jd' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>JD {isJDFilled && "✓"}</button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 text-xs uppercase font-bold rounded-xl transition-all ${activeTab === 'resume' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>Resume {isResumeFilled && "✓"}</button>
          </div>
          <textarea className="flex-1 p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" value={activeTab === 'jd' ? jobDescription : resume} onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} placeholder="Paste content..."/>
          <div className="p-6 bg-slate-950/30 border-t border-slate-800 flex gap-4">
             <button onClick={loadSampleData} className="px-4 text-[10px] font-bold uppercase text-purple-400 border border-purple-500/20 rounded-xl">Sample</button>
             <button onClick={handleAnalyze} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold uppercase shadow-xl flex items-center justify-center gap-2"><Sparkles size={18}/> Run Synergy Scan</button>
          </div>
        </section>

        {/* RESULTS PANEL (Step 3) */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {!analysis ? (
             <div className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-700 uppercase text-[10px] tracking-widest">Awaiting Scan</div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-10">
              
              {/* Synergy Score (Always Unlocked) */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex items-center gap-8">
                <div className="w-24 h-24 rounded-full border-4 border-purple-500 flex items-center justify-center bg-slate-950 shrink-0"><span className="text-3xl font-black text-white">{analysis.matchScore}%</span></div>
                <div><h3 className="text-purple-400 font-bold uppercase text-[10px] mb-2 tracking-widest">Synergy Scan</h3><p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.fitSummary}"</p></div>
              </div>

              {/* Comp Intel (Locked for Standard) */}
              <div 
                onClick={() => handleFeatureClick('market', 'Market Intelligence')}
                className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 relative ${!hasAccess('market') ? 'cursor-pointer' : ''}`}
              >
                {!hasAccess('market') && <div className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center"><div className="bg-slate-950 p-3 rounded-full border border-white/10 shadow-xl"><Lock size={16} className="text-purple-500"/></div></div>}
                <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-10 flex items-center gap-2"><DollarSign size={14}/> Comp Intelligence</h3>
                <div className="h-4 bg-slate-950 rounded-full border border-white/5 relative">
                   <div className="absolute left-1/2 -top-10 -translate-x-1/2 flex flex-col items-center">
                       <span className="text-[14px] font-black text-white">$47,200</span>
                       <div className="w-0.5 h-6 bg-purple-500 mt-1"></div>
                   </div>
                </div>
              </div>

              {/* Email Generator (Locked for Standard) */}
              <div 
                onClick={() => handleFeatureClick('email', 'Outreach Emailer')}
                className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 relative ${!hasAccess('email') ? 'cursor-pointer' : ''}`}
              >
                {!hasAccess('email') && <div className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center"><div className="bg-slate-950 p-3 rounded-full border border-white/10 shadow-xl"><Lock size={16} className="text-purple-500"/></div></div>}
                <div className="flex items-center gap-4 mb-4">
                   <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><Send size={14} /> Corporate Outreach Email</h3>
                </div>
                <div className="h-20 bg-slate-950/50 border border-dashed border-slate-800 rounded-2xl"></div>
              </div>

              {/* Interview Guide (Locked for Standard & Professional) */}
              <div 
                onClick={() => handleFeatureClick('interview', 'AI Interview Guide')}
                className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 relative ${!hasAccess('interview') ? 'cursor-pointer' : ''}`}
              >
                {!hasAccess('interview') && <div className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center"><div className="bg-slate-950 p-3 rounded-full border border-white/10 shadow-xl"><Lock size={16} className="text-purple-500"/></div></div>}
                <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2"><ClipboardCheck size={14} /> AI Interview Guide</h3>
                <div className="space-y-3">
                   {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-950/50 rounded-xl"></div>)}
                </div>
              </div>

            </div>
          )}
        </section>
      </main>
    </div>
  );
}
