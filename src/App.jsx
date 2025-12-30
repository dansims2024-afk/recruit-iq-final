import React, { useState, useRef } from 'react';
import { Sparkles, Zap, Loader2, BarChart3, Briefcase, FileText, Upload, Mail, CheckCircle2, AlertCircle, Printer, DollarSign, Send, ClipboardCheck, Lock, X, Check, Github, Twitter, Linkedin } from 'lucide-react';

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
  const isJDFilled = jobDescription.trim().length > 20;
  const isResumeFilled = resume.trim().length > 20;

  const hasAccess = (feature) => {
    const tiers = { standard: ['scan'], professional: ['scan', 'market', 'email'], executive: ['scan', 'market', 'email', 'interview'] };
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
    setJobDescription(`📄 Job Title: Medical Assistant\nOverview: We are seeking a skilled and compassionate Medical Assistant to join our healthcare team... (Full Text Loaded)`);
    setResume(`Jill McSample | Newark, NJ\n📞 (555) 123-4567 | 📧 jill.mssample@email.com... (Full Text Loaded)`);
  };

  const handleAnalyze = () => {
    if (!isJDFilled || !isResumeFilled) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        fitSummary: "Jill is an exceptional match with active CMA certification and local clinical experience.",
        strengths: ["CMA Certification: AAMA credentialed.", "EMR Proficiency: Advanced Epic/Cerner skills.", "Local Experience: Hands-on Newark clinical work.", "Clinical Versatility: Front & Back office expert."],
        gaps: ["Specialized Lab Testing Protocols", "Supply Chain Software Exposure"],
        interviewQuestions: ["Describe a medical emergency you handled.", "Which EMR systems do you prefer?", "How do you handle patient surges?", "Describe your sterile field maintenance.", "How do you stay compliant with HIPAA?"],
        marketData: { low: 38500, avg: 47200, high: 56000 }
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative">
      
      {/* HEADER */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)]"></div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">RECRUIT<span className="text-purple-500 ml-1">IQ</span></h1>
        </div>
        <div className="flex bg-slate-950/50 border border-white/5 rounded-2xl p-1 shadow-inner">
          {['standard', 'professional', 'executive'].map(t => (
            <button key={t} onClick={() => setSimTier(t)} className={`px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${simTier === t ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
          ))}
        </div>
      </header>

      {/* QUICK START GUIDE */}
      <section className="max-w-7xl mx-auto w-full px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 ${isJDFilled ? 'border-emerald-500/50' : 'border-blue-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${isJDFilled ? 'bg-emerald-600' : 'bg-blue-600'}`}>{isJDFilled ? "✓" : "1"}</div>
            <div><p className="text-[10px] uppercase font-bold text-blue-400 italic">Step 1</p><p className="text-xs text-slate-300">Add Job Description</p></div>
          </div>
          <div className={`bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 ${isResumeFilled ? 'border-emerald-500/50' : 'border-purple-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${isResumeFilled ? 'bg-emerald-600' : 'bg-purple-600'}`}>{isResumeFilled ? "✓" : "2"}</div>
            <div><p className="text-[10px] uppercase font-bold text-purple-400 italic">Step 2</p><p className="text-xs text-slate-300">Add Resume</p></div>
          </div>
          <div className={`bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 ${analysis ? 'border-emerald-500/50' : 'border-amber-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${analysis ? 'bg-emerald-600' : 'bg-amber-600'}`}>3</div>
            <div><p className="text-[10px] uppercase font-bold text-amber-400 italic">Step 3</p><p className="text-xs text-slate-300">Run Synergy Analysis</p></div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="space-y-6">
          <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl">
            <div className="flex bg-slate-950/50 border-b border-slate-800 p-2 gap-2">
              <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'jd' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${isJDFilled ? 'bg-emerald-600' : 'bg-blue-600'}`}>1</span> Upload/Paste JD
              </button>
              <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'resume' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${isResumeFilled ? 'bg-emerald-600' : 'bg-purple-600'}`}>2</span> Upload/Paste Resume
              </button>
            </div>
            <div className="relative flex-1">
              <textarea className="w-full h-full p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" value={activeTab === 'jd' ? jobDescription : resume} onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} placeholder="Paste content..."/>
              <div className="absolute top-4 right-4 flex items-center gap-3">
                <button onClick={loadSampleData} className="text-[10px] font-bold text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg bg-slate-900/50">Sample</button>
                <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 text-[10px] text-slate-400 border border-white/10 px-3 py-1.5 rounded-lg bg-slate-800"><Upload size={12} /> Upload</button>
              </div>
            </div>
            <div className="p-6 bg-slate-950/30 border-t border-slate-800 flex items-center gap-4">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-lg ${analysis ? 'bg-emerald-600' : 'bg-amber-600'}`}>3</div>
               <button onClick={handleAnalyze} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold uppercase shadow-xl flex items-center justify-center gap-2 transition-all hover:opacity-90"><Sparkles size={18}/> Run Synergy Scan</button>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: RESULTS & TOOLS (RESTORING ALL FEATURES UNDER SCORE) */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {!analysis ? (
             <div className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-700 uppercase text-[10px] tracking-widest">Awaiting Analysis...</div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
              
              {/* Score - Standard Tier */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex items-center gap-8 shadow-xl">
                <div className="w-24 h-24 rounded-full border-4 border-purple-500 flex items-center justify-center bg-slate-950 shrink-0"><span className="text-3xl font-black text-white">{analysis.matchScore}%</span></div>
                <div><h3 className="text-purple-400 font-bold uppercase text-[10px] mb-2 tracking-widest">Synergy Match</h3><p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.fitSummary}"</p></div>
              </div>

              {/* Comp Intel - Locked for Standard */}
              <div onClick={() => handleFeatureClick('market', 'Comp Intelligence')} className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 relative transition-all ${!hasAccess('market') ? 'cursor-pointer hover:border-purple-500/50' : ''}`}>
                {!hasAccess('market') && <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[2px] rounded-3xl flex items-center justify-center"><Lock size={24} className="text-purple-500"/></div>}
                <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-10 flex items-center gap-2"><DollarSign size={14}/> Comp Intelligence</h3>
                <div className="h-4 bg-slate-950 rounded-full border border-white/5 relative mx-4">
                   <div className="absolute left-1/2 -top-10 -translate-x-1/2 flex flex-col items-center">
                       <span className="text-[14px] font-black text-white">$47,200</span>
                       <div className="w-0.5 h-6 bg-purple-500 mt-1"></div>
                   </div>
                </div>
              </div>

              {/* Strengths & Gaps - Standard Tier */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800"><span className="text-emerald-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2"><CheckCircle2 size={12}/> Strengths Profile</span><ul className="text-xs text-slate-400 space-y-4">{analysis.strengths.map((s, i) => <li key={i}><span className="text-white font-bold">•</span> {s}</li>)}</ul></div>
                <div className="bg-slate-900 p-6 rounded-3xl border border-rose-500/20"><span className="text-rose-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2"><AlertCircle size={12}/> Growth Gaps Identified</span><ul className="text-xs text-slate-400 space-y-4">{analysis.gaps.map((g, i) => <li key={i}><span className="text-white font-bold">•</span> {g}</li>)}</ul></div>
              </div>

              {/* Email Gen - Locked for Standard */}
              <div onClick={() => handleFeatureClick('email', 'Corporate Emailer')} className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 relative ${!hasAccess('email') ? 'cursor-pointer' : ''}`}>
                {!hasAccess('email') && <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[2px] rounded-3xl flex items-center justify-center"><Lock size={24} className="text-purple-500"/></div>}
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><Send size={14} /> Corporate Outreach Email</h3>
                   <button className="bg-purple-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase">Generate</button>
                </div>
              </div>

              {/* Interview Guide - Locked for Pro & Standard */}
              <div onClick={() => handleFeatureClick('interview', 'AI Interview Guide')} className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 relative ${!hasAccess('interview') ? 'cursor-pointer' : ''}`}>
                {!hasAccess('interview') && <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[2px] rounded-3xl flex items-center justify-center"><Lock size={24} className="text-purple-500"/></div>}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><ClipboardCheck size={14} /> AI Interview Guide</h3>
                  <Printer size={16} className="text-slate-500" />
                </div>
                <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-10 bg-slate-950/50 rounded-xl border border-white/5"></div>)}</div>
              </div>

            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-white/5 p-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          <div>© 2025 Recruit-IQ Predictive Intelligence</div>
          <div className="flex gap-8"><Twitter size={18} className="cursor-pointer hover:text-purple-400" /><Linkedin size={18} className="cursor-pointer hover:text-purple-400" /><Github size={18} className="cursor-pointer hover:text-purple-400" /></div>
        </div>
      </footer>
      <input type="file" ref={fileInputRef} className="hidden" />
    </div>
  );
}
