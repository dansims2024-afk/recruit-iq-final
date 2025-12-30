import React, { useState, useRef } from 'react';
import { Sparkles, Zap, Loader2, BarChart3, Briefcase, FileText, Upload, Mail, CheckCircle2, AlertCircle, Printer, DollarSign, Send, ClipboardCheck, Lock, X, Check, Download, Twitter, Linkedin, Github } from 'lucide-react';

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

  // RESTORED: FULL SAMPLE DATA
  const loadSampleData = () => {
    setJobDescription(`📄 Job Title: Medical Assistant
Overview: We are seeking a skilled and compassionate Medical Assistant to join our healthcare team. The ideal candidate will support physicians and nurses in delivering high-quality patient care by performing clinical and administrative tasks.

Key Responsibilities:
- Welcome patients, record vital signs, and prepare them for examination
- Assist providers during exams, procedures, and treatments
- Collect and process laboratory specimens (blood, urine, etc.)
- Record patient medical history and update EMR accurately (Epic/Cerner)
- Schedule appointments and manage patient flow in high-volume settings

Qualifications:
- High school diploma or GED required; accredited MA program preferred
- CMA, RMA, or equivalent certification is a plus
- Proficient with EMR systems and basic clinical office software`);

    setResume(`Jill McSample | Newark, NJ
Summary: Detail-oriented Medical Assistant with 3+ years of experience in patient intake, EMR documentation, and clinical support. Proven track record of handling 45+ patients daily with zero documentation errors.

Core Skills:
- EMR Mastery: Epic, Cerner, AthenaHealth
- Clinical: Vitals, Phlebotomy, EKG, Sterile Field Maintenance
- Admin: ICD-10 Coding, Insurance Verification, Scheduling

Experience:
Medical Assistant | ABC Family Clinic | Newark, NJ
- Streamlined patient intake by 25% using advanced Epic workflows
- Maintained 100% compliance with OSHA and HIPAA standards
- Managed complex specimen collection and basic on-site lab testing`);
  };

  const downloadInterviewGuide = () => {
    if (!analysis) return;
    const content = `RECRUIT-IQ PRO: INTERVIEW GUIDE\nMatch: ${analysis.matchScore}%\n\nQUESTIONS:\n` + 
                    analysis.interviewQuestions.map((q, i) => `${i+1}. ${q}`).join('\n');
    const blob = new Blob([content], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Pro_Interview_Guide.txt";
    link.click();
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
          { title: "Quantifiable Efficiency", desc: "25% faster patient intake cycles in high-volume Newark clinics (45+ patients/day)." },
          { title: "Clinical Versatility", desc: "Dual-competency in Phlebotomy and EKG administration, reducing lab turnaround time." },
          { title: "Credential Superiority", desc: "Active AAMA Certified Medical Assistant (CMA) status verified." }
        ],
        gaps: [
          { title: "Specialized Billing Metrics", desc: "Limited experience with high-complexity modifiers required for this specific facility." },
          { title: "Advanced Lab Tech", desc: "Requires orientation on COLA-accredited diagnostic equipment used in our internal wing." }
        ],
        interviewQuestions: [
          "Describe your workflow for zero-error documentation in Epic during surges.",
          "How do you prioritize patient comfort while maintaining clinical pace?",
          "Can you walk us through your ICD-10 coding validation process?",
          "How do you handle procedures you haven't performed in over 12 months?",
          "Describe your experience with sterile field maintenance during surgery."
        ]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative">
      
      {/* 1. HEADER & TIER SELECTOR */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)]"></div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">RECRUIT<span className="text-purple-500 ml-1">IQ</span></h1>
        </div>
        <div className="flex bg-slate-950/50 border border-white/5 rounded-2xl p-1">
          <button onClick={() => setSimTier('standard')} className={`px-8 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${simTier === 'standard' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Standard (Free)</button>
          <button onClick={() => setSimTier('pro')} className={`px-8 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${simTier === 'pro' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500'}`}>
            <Zap size={12} fill={simTier === 'pro' ? "currentColor" : "none"} /> Pro ($29.99)
          </button>
        </div>
      </header>

      {/* 2. QUICK START GUIDE - RESTORED TO TOP */}
      <section className="max-w-7xl mx-auto w-full px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 transition-all ${isJDFilled ? 'border-emerald-500/50' : 'border-blue-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${isJDFilled ? 'bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-600'}`}>{isJDFilled ? "✓" : "1"}</div>
            <div><p className="text-[10px] uppercase font-bold text-blue-400">Step 1</p><p className="text-xs text-slate-300">Add Job Description</p></div>
          </div>
          <div className={`bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 transition-all ${isResumeFilled ? 'border-emerald-500/50' : 'border-purple-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${isResumeFilled ? 'bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-purple-600'}`}>{isResumeFilled ? "✓" : "2"}</div>
            <div><p className="text-[10px] uppercase font-bold text-purple-400">Step 2</p><p className="text-xs text-slate-300">Add Resume</p></div>
          </div>
          <div className={`bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 transition-all ${analysis ? 'border-emerald-500/50' : 'border-amber-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${analysis ? 'bg-emerald-600' : 'bg-amber-600'}`}>3</div>
            <div><p className="text-[10px] uppercase font-bold text-amber-400">Step 3</p><p className="text-xs text-slate-300">Synergy Analysis</p></div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* INPUTS - LEFT */}
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl relative">
          <div className="flex bg-slate-950/50 border-b border-slate-800 p-2 gap-2">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl transition-all ${activeTab === 'jd' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-white mr-2 ${isJDFilled ? 'bg-emerald-600' : 'bg-blue-600'}`}>1</span> Upload JD
            </button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl transition-all ${activeTab === 'resume' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-white mr-2 ${isResumeFilled ? 'bg-emerald-600' : 'bg-purple-600'}`}>2</span> Upload Resume
            </button>
          </div>
          <div className="flex-1 relative">
            <textarea className="w-full h-full p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" value={activeTab === 'jd' ? jobDescription : resume} onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} placeholder="Paste content here..." />
            {/* RESTORED: SAMPLE AND UPLOAD BUTTONS INSIDE BOX */}
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <button onClick={loadSampleData} className="text-[10px] font-bold text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg bg-slate-900/50 backdrop-blur-sm">Sample</button>
              <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 text-[10px] text-slate-400 border border-white/10 px-3 py-1.5 rounded-lg bg-slate-800"><Upload size={12} /> Upload</button>
            </div>
          </div>
          <div className="p-6 bg-slate-950/30 border-t border-slate-800 flex items-center gap-4">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${analysis ? 'bg-emerald-600' : 'bg-amber-600'}`}>3</div>
             <button onClick={handleAnalyze} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold uppercase shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"><Sparkles size={18}/> Run Synergy Scan</button>
          </div>
        </section>

        {/* RESULTS - RIGHT */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* ... RESULTS & LOCKED PRO FEATURES ... */}
          {analysis && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               {/* Match Score */}
               <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex items-center gap-8 shadow-xl">
                  <div className="w-24 h-24 rounded-full border-4 border-purple-500 flex items-center justify-center bg-slate-950 shrink-0"><span className="text-3xl font-black text-white">{analysis.matchScore}%</span></div>
                  <div><h3 className="text-purple-400 font-bold uppercase text-[10px] mb-2 tracking-widest">Match Score</h3><p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.fitSummary}"</p></div>
               </div>

               {/* Locked Detailed Analysis */}
               <div onClick={() => handleFeatureClick('pro', 'Pro Talent Audit')} className="relative cursor-pointer group">
                  {!hasAccess('pro') && <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/5"><div className="bg-purple-600 p-3 rounded-full text-white shadow-lg"><Lock size={20}/></div></div>}
                  <div className={`space-y-4 ${!hasAccess('pro') ? 'opacity-40 grayscale blur-[2px]' : ''}`}>
                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                      <span className="text-emerald-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2 italic tracking-[0.2em]"><CheckCircle2 size={12}/> Strengths Audit</span>
                      {analysis.strengths.map((s, i) => (
                        <div key={i} className="mb-4 border-l-2 border-emerald-500/30 pl-4"><p className="text-xs font-black text-white uppercase">{s.title}</p><p className="text-[11px] text-slate-400">{s.desc}</p></div>
                      ))}
                    </div>
                  </div>
               </div>
               
               {/* Fixed Interview Guide */}
               {hasAccess('pro') ? (
                 <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><ClipboardCheck size={14} /> AI Interview Guide</h3>
                     <button onClick={downloadInterviewGuide} className="p-2 bg-slate-950 rounded-xl border border-white/5 text-slate-400 hover:text-white"><Download size={16} /></button>
                   </div>
                   <div className="space-y-4">
                     {analysis.interviewQuestions.map((q, i) => (
                       <div key={i} className="p-4 bg-slate-950 rounded-2xl border border-white/5 text-xs text-slate-300 italic">"{q}"</div>
                     ))}
                   </div>
                 </div>
               ) : (
                 <div onClick={() => handleFeatureClick('pro', 'Interview Intelligence')} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 opacity-30 flex items-center justify-center cursor-pointer relative">
                    <div className="absolute inset-0 flex items-center justify-center"><Lock size={24} className="text-purple-500" /></div>
                    <span className="text-[10px] uppercase font-bold tracking-widest">Locked: Interview Guide</span>
                 </div>
               )}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER & UPGRADE MODAL AS PREVIOUSLY DEFINED */}
      <footer className="p-8 border-t border-white/5 flex justify-between items-center max-w-7xl mx-auto w-full text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">
        <div>© 2025 Recruit-IQ</div>
        <div className="flex gap-6"><Twitter size={16}/><Linkedin size={16}/><Github size={16}/></div>
      </footer>
      <input type="file" ref={fileInputRef} className="hidden" />
      
      {/* UPGRADE MODAL CODE (Same as before) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-purple-500/40 w-full max-w-md rounded-3xl p-8 shadow-2xl relative text-center">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24}/></button>
            <div className="inline-flex p-4 bg-purple-600/20 rounded-2xl mb-6 text-purple-500"><Zap size={32} /></div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Upgrade to Pro</h2>
            <p className="text-slate-400 text-sm mb-8">Access {lockedFeatureName} and deep predictive metrics for $29.99/mo.</p>
            <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-black text-white shadow-xl">Get Pro Access</button>
          </div>
        </div>
      )}
    </div>
  );
}
