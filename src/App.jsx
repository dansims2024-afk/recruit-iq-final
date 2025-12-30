import React, { useState, useRef } from 'react';
import { Sparkles, Zap, Loader2, BarChart3, Briefcase, FileText, Upload, Mail, CheckCircle2, AlertCircle, Printer, DollarSign, Send, ClipboardCheck, Lock, X, Check, Download, Twitter, Linkedin, Github, TrendingUp, Target, Users } from 'lucide-react';

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

  const loadSampleData = () => {
    setJobDescription(`📄 Job Title: Medical Assistant\nOverview: We are seeking a skilled and compassionate Medical Assistant to support providers in clinical and administrative tasks.\n\nKey Responsibilities:\n- Record vital signs and prepare patients for examination.\n- Assist providers during exams and procedures.\n- Manage EMR documentation accurately (Epic/Cerner proficiency preferred).`);
    setResume(`Jill McSample | Newark, NJ\nSummary: Detail-oriented Medical Assistant with 3+ years experience. Proven track record of handling 45+ patients daily.\n\nCore Skills:\n- EMR mastery: Epic, Cerner.\n- Clinical: Phlebotomy, EKG.\n- Impact: Streamlined intake by 25%.`);
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
          { title: "Oncology Billing Complexity", desc: "While proficient in ICD-10 coding, candidate has limited experience with specific high-complexity oncology modifiers required for this role." },
          { title: "Advanced Lab Tech Integration", desc: "Lacks 6+ months experience with the specific COLA-accredited diagnostic equipment used in our facility wing." },
          { title: "Software Transition Lag", desc: "Resume lacks recent evidence of the V3 AthenaHealth update, necessitating a brief 1-week software ramp-up." }
        ],
        interviewQuestions: [
          "Describe your specific workflow for ensuring zero-error documentation in Epic during high-volume surges.",
          "How do you prioritize patient comfort while maintaining a strictly clinical pace during procedures?",
          "Can you walk us through your process for ICD-10 coding validation to prevent insurance denials?",
          "How do you handle a procedure you have not performed in over 12 months?",
          "Describe your experience with sterile field maintenance during surgery."
        ],
        marketData: { low: 38500, avg: 47200, high: 56000 }
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-purple-500/30">
      
      {/* 1. BENEFIT POPUP */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
          <div className="bg-slate-900 border border-purple-500/40 w-full max-w-xl rounded-3xl p-10 shadow-2xl relative">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24}/></button>
            <div className="text-center">
              <div className="inline-flex p-4 bg-purple-600/20 rounded-2xl mb-6 text-purple-500"><Zap size={32} fill="currentColor" /></div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2 leading-none">Activate Pro Access</h2>
              <p className="text-slate-400 text-sm mb-10">Unlock the <span className="text-white font-bold">{lockedFeatureName}</span> for just $29.99/mo.</p>
              <div className="grid grid-cols-2 gap-6 mb-10 text-left">
                <div className="flex gap-3 text-[11px]"><CheckCircle2 className="text-emerald-500 shrink-0" size={16}/> Detailed Talent Audit</div>
                <div className="flex gap-3 text-[11px]"><CheckCircle2 className="text-emerald-500 shrink-0" size={16}/> Market Intelligence</div>
                <div className="flex gap-3 text-[11px]"><CheckCircle2 className="text-emerald-500 shrink-0" size={16}/> Email Generator</div>
                <div className="flex gap-3 text-[11px]"><CheckCircle2 className="text-emerald-500 shrink-0" size={16}/> Interview Guide</div>
              </div>
              <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-black text-white uppercase tracking-tight shadow-xl">Get Full Access</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)]"></div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">RECRUIT<span className="text-purple-500 ml-1">IQ</span></h1>
        </div>
        <div className="flex bg-slate-950/50 border border-white/5 rounded-2xl p-1">
          <button onClick={() => setSimTier('standard')} className={`px-8 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${simTier === 'standard' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Standard (Free)</button>
          <button onClick={() => setSimTier('pro')} className={`px-8 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${simTier === 'pro' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Pro ($29.99)</button>
        </div>
      </header>

      {/* QUICK START GUIDE */}
      <section className="max-w-7xl mx-auto w-full px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
          <div className={`bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 ${isJDFilled ? 'border-emerald-500/50' : 'border-blue-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${isJDFilled ? 'bg-emerald-600' : 'bg-blue-600'}`}>{isJDFilled ? "✓" : "1"}</div>
            <div><p className="text-[10px] uppercase font-bold text-blue-400">Step 1</p><p className="text-xs text-slate-300 font-medium">Add Job Description</p></div>
          </div>
          <div className={`bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 ${isResumeFilled ? 'border-emerald-500/50' : 'border-purple-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${isResumeFilled ? 'bg-emerald-600' : 'bg-purple-600'}`}>{isResumeFilled ? "✓" : "2"}</div>
            <div><p className="text-[10px] uppercase font-bold text-purple-400">Step 2</p><p className="text-xs text-slate-300 font-medium">Add Resume</p></div>
          </div>
          <div className={`bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 ${analysis ? 'border-emerald-500/50' : 'border-amber-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${analysis ? 'bg-emerald-600' : 'bg-amber-600'}`}>3</div>
            <div><p className="text-[10px] uppercase font-bold text-amber-400">Step 3</p><p className="text-xs text-slate-300 font-medium">Synergy Analysis</p></div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        
        {/* INPUTS - LEFT */}
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl relative">
          <div className="flex bg-slate-950/50 border-b border-slate-800 p-2 gap-2">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl ${activeTab === 'jd' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-white mr-2 ${isJDFilled ? 'bg-emerald-600' : 'bg-blue-600'}`}>1</span> Upload JD
            </button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl ${activeTab === 'resume' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-white mr-2 ${isResumeFilled ? 'bg-emerald-600' : 'bg-purple-600'}`}>2</span> Upload Resume
            </button>
          </div>
          <div className="flex-1 relative">
            <textarea className="w-full h-full p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed font-sans" value={activeTab === 'jd' ? jobDescription : resume} onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} placeholder="Paste JD or Resume content here..." />
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <button onClick={loadSampleData} className="text-[10px] font-bold text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg bg-slate-900/50 backdrop-blur-sm">Sample</button>
              <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 text-[10px] text-slate-400 border border-white/10 px-3 py-1.5 rounded-lg bg-slate-800 hover:text-white transition-all"><Upload size={12} /> Upload</button>
            </div>
          </div>
          <div className="p-6 bg-slate-950/30 border-t border-slate-800 flex items-center gap-4">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${analysis ? 'bg-emerald-600' : 'bg-amber-600'}`}>3</div>
             <button onClick={handleAnalyze} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black uppercase shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"><Sparkles size={18}/> Run Synergy Scan</button>
          </div>
        </section>

        {/* RESULTS - RIGHT */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {!analysis ? (
             <div className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-700 uppercase text-[10px] tracking-widest italic font-bold">Awaiting Scan Input</div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
              
              {/* Score Header */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex items-center gap-8 shadow-xl">
                <div className="w-24 h-24 rounded-full border-4 border-purple-500 flex items-center justify-center bg-slate-950 shrink-0"><span className="text-3xl font-black text-white">{analysis.matchScore}%</span></div>
                <div><h3 className="text-purple-400 font-bold uppercase text-[10px] mb-2 tracking-widest">Synergy Score</h3><p className="text-slate-300 italic text-sm leading-relaxed font-medium">"{analysis.fitSummary}"</p></div>
              </div>

              {/* Locked Analysis (Strengths & Gaps) */}
              <div onClick={() => handleFeatureClick('pro', 'Talent Audit')} className="relative cursor-pointer group">
                {!hasAccess('pro') && <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl"><div className="bg-purple-600 p-3 rounded-full text-white shadow-lg"><Lock size={20}/></div></div>}
                <div className={`space-y-4 ${!hasAccess('pro') ? 'opacity-40 grayscale blur-[1px]' : ''}`}>
                  
                  {/* Expanded Strengths */}
                  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <span className="text-emerald-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2 italic tracking-[0.2em]"><CheckCircle2 size={12}/> Strengths Audit</span>
                    <div className="space-y-5">
                      {analysis.strengths.map((s, i) => (
                        <div key={i} className="border-l-2 border-emerald-500/30 pl-4"><p className="text-xs font-black text-white uppercase mb-1">{s.title}</p><p className="text-[11px] text-slate-400 leading-relaxed font-medium">{s.desc}</p></div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Gaps */}
                  <div className="bg-slate-900 p-6 rounded-3xl border border-rose-500/20 shadow-xl">
                    <span className="text-rose-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2 italic tracking-[0.2em]"><AlertCircle size={12}/> Growth Gaps</span>
                    <div className="space-y-5">
                      {analysis.gaps.map((g, i) => (
                        <div key={i} className="border-l-2 border-rose-500/30 pl-4"><p className="text-xs font-black text-white uppercase mb-1">{g.title}</p><p className="text-[11px] text-slate-400 leading-relaxed font-medium">{g.desc}</p></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interview Guide */}
              <div onClick={() => handleFeatureClick('pro', 'Interview Intelligence')} className="relative cursor-pointer group">
                {!hasAccess('pro') && <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center"><Lock size={20} className="text-purple-500"/></div>}
                <div className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl ${!hasAccess('pro') ? 'opacity-30' : ''}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><ClipboardCheck size={14} /> AI Interview Guide</h3>
                    <button className="p-2 bg-slate-950 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-all"><Download size={16}/></button>
                  </div>
                  <div className="space-y-3 font-medium">
                    {analysis.interviewQuestions.map((q, i) => (<div key={i} className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-xs text-slate-300 italic leading-relaxed">"{q}"</div>))}
                  </div>
                </div>
              </div>

              {/* Market Intelligence */}
              <div onClick={() => handleFeatureClick('pro', 'Market Intelligence')} className="relative cursor-pointer">
                {!hasAccess('pro') && <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center"><Lock size={20} className="text-purple-500"/></div>}
                <div className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl ${!hasAccess('pro') ? 'opacity-30' : ''}`}>
                  <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-10 flex items-center gap-2"><DollarSign size={14}/> Comp Intelligence</h3>
                  <div className="h-4 bg-slate-950 rounded-full border border-white/5 relative mx-4">
                     <div className="absolute left-1/2 -top-10 -translate-x-1/2 flex flex-col items-center">
                         <span className="text-[14px] font-black text-white">$47,200</span>
                         <div className="w-0.5 h-6 bg-purple-500 mt-1"></div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Email Generator */}
              <div onClick={() => handleFeatureClick('pro', 'Email Outreach')} className="relative cursor-pointer">
                {!hasAccess('pro') && <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center"><Lock size={20} className="text-purple-500"/></div>}
                <div className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl ${!hasAccess('pro') ? 'opacity-30' : ''}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><Send size={14} /> Corporate Outreach Email</h3>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-purple-500 transition-all">Generate</button>
                  </div>
                  <div className="h-32 bg-slate-950/50 rounded-2xl border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-600 font-bold uppercase">Candidate Email Preview</div>
                </div>
              </div>

            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-white/5 p-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black italic">© 2025 Recruit-IQ Predictive Talent Intelligence</div>
          <div className="flex gap-8"><Twitter size={18} className="text-slate-400 hover:text-purple-400 cursor-pointer"/><Linkedin size={18} className="text-slate-400 hover:text-purple-400 cursor-pointer"/><Github size={18} className="text-slate-400 hover:text-purple-400 cursor-pointer"/></div>
          <div className="flex gap-6 text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Support</span>
          </div>
        </div>
      </footer>
      <input type="file" ref={fileInputRef} className="hidden" />
    </div>
  );
}
