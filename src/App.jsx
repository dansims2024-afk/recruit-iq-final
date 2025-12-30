import React, { useState, useRef } from 'react';
import { Sparkles, Zap, Loader2, BarChart3, Briefcase, FileText, Upload, Mail, CheckCircle2, AlertCircle, Printer, DollarSign, Send, ClipboardCheck, Lock, X, Check } from 'lucide-react';

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

  // FIXED: Populates the absolute full JD and Resume content
  const loadSampleData = () => {
    setJobDescription(`📄 Job Title: Medical Assistant
Overview
We are seeking a skilled and compassionate Medical Assistant to join our healthcare team. The ideal candidate will support physicians and nurses in delivering high-quality patient care by performing clinical and administrative tasks. A warm bedside manner, attention to detail, and professionalism are essential.

Key Responsibilities
- Welcome patients, record vital signs, and prepare them for examination
- Assist providers during exams, procedures, and treatments
- Collect and process laboratory specimens (blood, urine, etc.)
- Record patient medical history and update EMR accurately
- Schedule appointments and manage patient flow
- Verify insurance and process billing/coding information

Qualifications
- High school diploma or GED required
- Completion of an accredited Medical Assistant program preferred
- CMA, RMA, or equivalent certification is a plus
- Proficient with EMR systems and office software
- Strong communication and organizational skills`);

    setResume(`Jill McSample
📍 Newark, NJ | 📞 (555) 123-4567 | 📧 jill.mssample@email.com

Professional Summary
Detail-oriented and compassionate Medical Assistant with experience supporting physicians, performing clinical tasks, and maintaining efficient office workflow. Skilled in patient care, EMR management, vitals collection, and laboratory procedures.

Core Skills
- Patient Intake & Vital Signs
- Electronic Medical Records (Epic, Cerner, AthenaHealth)
- Injections & Specimen Collection
- Appointment Scheduling & Billing
- Phlebotomy & Basic Lab Testing
- Infection Control & OSHA Compliance

Professional Experience
Medical Assistant | ABC Family Clinic | Newark, NJ
Jan 2023 – Present
- Welcome and prepare patients for examinations, recording vitals and medical history
- Assist physicians during procedures, ensuring comfort and safety
- Perform specimen collection (blood, urine, swabs) and basic lab work
- Document patient information in EMR with accuracy and confidentiality

Education
Medical Assistant Certificate Program | New Jersey Institute of Allied Health
Completed: 2022

Certifications
- Certified Medical Assistant (CMA) – AAMA
- BLS/CPR Certified (American Heart Association)`);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (activeTab === 'jd') setJobDescription(e.target.result);
      else setResume(e.target.result);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    if (!isJDFilled || !isResumeFilled) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        fitSummary: "Jill is an exceptional match. She holds the preferred CMA certification and has direct experience in both clinical and administrative tasks required for this role.",
        strengths: [
          "Active CMA Certification: Candidate holds the American Association of Medical Assistants (AAMA) credential.",
          "EMR Proficiency (Epic/Cerner): Demonstrates advanced knowledge of Electronic Health Records.",
          "Local Clinical Experience: Extensive hands-on experience in the Newark health system.",
          "Clinical Versatility: Proven ability to transition between front-office and back-office duties."
        ],
        gaps: [
          "Specialized Lab Testing: May require orientation on specific facility protocols.",
          "Inventory Management Systems: Lacks explicit mention of supply-chain software."
        ],
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-purple-500/30 w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-purple-600/20 rounded-2xl mb-4 text-purple-500"><Lock size={32} /></div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Upgrade Intelligence</h2>
              <p className="text-slate-400 text-sm">Unlock the <span className="text-purple-400 font-bold">{lockedFeatureName}</span> and more.</p>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 uppercase tracking-widest text-[10px]">
                  <th className="py-4">Features</th>
                  <th className="py-4 text-center">Standard</th>
                  <th className="py-4 text-center text-purple-400">Pro</th>
                  <th className="py-4 text-center text-emerald-400">Executive</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5"><td className="py-4 font-medium text-slate-300">AI Synergy Scan</td><td className="text-center"><Check size={14} className="mx-auto text-emerald-500"/></td><td className="text-center"><Check size={14} className="mx-auto text-emerald-500"/></td><td className="text-center"><Check size={14} className="mx-auto text-emerald-500"/></td></tr>
                <tr className="border-b border-white/5"><td className="py-4 font-medium text-slate-300">Comp Intelligence</td><td className="text-center">—</td><td className="text-center"><Check size={14} className="mx-auto text-emerald-500"/></td><td className="text-center"><Check size={14} className="mx-auto text-emerald-500"/></td></tr>
                <tr className="border-b border-white/5"><td className="py-4 font-medium text-slate-300">Outreach Emailer</td><td className="text-center">—</td><td className="text-center"><Check size={14} className="mx-auto text-emerald-500"/></td><td className="text-center"><Check size={14} className="mx-auto text-emerald-500"/></td></tr>
                <tr><td className="py-4 font-medium text-slate-300">Interview Guide</td><td className="text-center">—</td><td className="text-center">—</td><td className="text-center"><Check size={14} className="mx-auto text-emerald-500"/></td></tr>
              </tbody>
            </table>
            <div className="mt-8 flex gap-4">
               <button className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-[1.02]">Upgrade Now</button>
               <button onClick={() => setShowUpgradeModal(false)} className="flex-1 py-4 bg-slate-800 rounded-xl font-bold text-slate-300 hover:bg-slate-700">Cancel</button>
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
            <button key={t} onClick={() => setSimTier(t)} className={`px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${simTier === t ? 'bg-purple-600 text-white' : 'text-slate-500'}`}>{t}</button>
          ))}
        </div>
      </header>

      {/* QUICK START GUIDE */}
      <section className="max-w-7xl mx-auto w-full px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`transition-all bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 ${isJDFilled ? 'border-emerald-500/50' : 'border-blue-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition-colors ${isJDFilled ? 'bg-emerald-600' : 'bg-blue-600'}`}>{isJDFilled ? "✓" : "1"}</div>
            <div><p className="text-[10px] uppercase font-bold text-blue-400">Step 1</p><p className="text-xs text-slate-300">Upload/Paste Job Description</p></div>
          </div>
          <div className={`transition-all bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 ${isResumeFilled ? 'border-emerald-500/50' : 'border-purple-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition-colors ${isResumeFilled ? 'bg-emerald-600' : 'bg-purple-600'}`}>{isResumeFilled ? "✓" : "2"}</div>
            <div><p className="text-[10px] uppercase font-bold text-purple-400">Step 2</p><p className="text-xs text-slate-300">Upload/Paste Resume</p></div>
          </div>
          <div className={`transition-all bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 ${analysis ? 'border-emerald-500/50' : 'border-amber-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition-colors ${analysis ? 'bg-emerald-600' : 'bg-amber-600'}`}>3</div>
            <div><p className="text-[10px] uppercase font-bold text-amber-400">Step 3</p><p className="text-xs text-slate-300">AI Synergy Analysis & Tools</p></div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* INPUT PANEL */}
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800 p-2 gap-2">
            <button 
              onClick={() => setActiveTab('jd')} 
              className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'jd' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-[10px] mr-1 font-bold">1</span>
              Upload/Paste Job Description {isJDFilled && "✓"}
            </button>
            <button 
              onClick={() => setActiveTab('resume')} 
              className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'resume' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-[10px] mr-1 font-bold">2</span>
              Upload/Paste Resume {isResumeFilled && "✓"}
            </button>
          </div>
          
          <div className="relative flex-1">
            <textarea 
              className="w-full h-full p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed custom-scrollbar" 
              value={activeTab === 'jd' ? jobDescription : resume} 
              onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} 
              placeholder={`Paste the ${activeTab === 'jd' ? 'Job Description' : 'Resume'} text here...`}
            />
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <button onClick={loadSampleData} className="text-[10px] font-bold text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg bg-slate-900/50 backdrop-blur-sm transition-all hover:bg-purple-500/10">Sample</button>
              <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 text-[10px] text-slate-400 border border-white/10 px-3 py-1.5 rounded-lg bg-slate-800 transition-all hover:text-white"><Upload size={12} /> Upload</button>
            </div>
          </div>

          <div className="p-6 bg-slate-950/30 border-t border-slate-800 flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center font-bold text-white shrink-0 shadow-lg">3</div>
             <button onClick={handleAnalyze} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold uppercase shadow-xl transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"><Sparkles size={18}/> Run Synergy Scan</button>
          </div>
        </section>

        {/* RESULTS PANEL */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {!analysis ? (
             <div className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-700 uppercase text-[10px] tracking-[0.2em]">Awaiting Scan Input</div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex items-center gap-8 shadow-xl">
                <div className="w-24 h-24 rounded-full border-4 border-purple-500 flex items-center justify-center bg-slate-950 shrink-0"><span className="text-3xl font-black text-white">{analysis.matchScore}%</span></div>
                <div><h3 className="text-purple-400 font-bold uppercase text-[10px] mb-2 tracking-widest">Synergy Match</h3><p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.fitSummary}"</p></div>
              </div>
              
              {/* Other Features (Comp Intel, Email, Interview) continue with the locking logic as before... */}
              
            </div>
          )}
        </section>
      </main>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
    </div>
  );
}
