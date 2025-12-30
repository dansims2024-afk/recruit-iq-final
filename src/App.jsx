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

  // RESTORED: Full Detailed Sample Data
  const loadSampleData = () => {
    setJobDescription(`📄 Job Title: Medical Assistant\nOverview: We are seeking a skilled and compassionate Medical Assistant to join our healthcare team. The ideal candidate will support physicians and nurses in delivering high-quality patient care by performing clinical and administrative tasks. A warm bedside manner, attention to detail, and professionalism are essential.\n\nKey Responsibilities:\n- Welcome patients, record vital signs, and prepare them for examination\n- Assist providers during exams, procedures, and treatments\n- Collect and process laboratory specimens (blood, urine, etc.)\n- Record patient medical history and update EMR accurately\n- Schedule appointments and manage patient flow\n- Verify insurance and process billing/coding information\n\nQualifications:\n- High school diploma or GED required\n- Completion of an accredited Medical Assistant program preferred\n- CMA, RMA, or equivalent certification is a plus\n- Proficient with EMR systems and office software\n- Strong communication and organizational skills`);

    setResume(`Jill McSample | Newark, NJ\n📞 (555) 123-4567 | 📧 jill.mssample@email.com\n\nProfessional Summary: Detail-oriented and compassionate Medical Assistant with experience supporting physicians, performing clinical tasks, and maintaining efficient office workflow. Skilled in patient care, EMR management, vitals collection, and laboratory procedures.\n\nCore Skills:\n- Patient Intake & Vital Signs\n- Electronic Medical Records (Epic, Cerner, AthenaHealth)\n- Injections & Specimen Collection\n- Appointment Scheduling & Billing\n- Phlebotomy & Basic Lab Testing\n- Infection Control & OSHA Compliance\n\nProfessional Experience:\nMedical Assistant | ABC Family Clinic | Newark, NJ (Jan 2023 – Present)\n- Welcome and prepare patients for examinations, recording vitals and medical history\n- Assist physicians during procedures, ensuring comfort and safety\n- Perform specimen collection (blood, urine, swabs) and basic lab work\n- Document patient information in EMR with accuracy and confidentiality\n\nCertifications:\n- Certified Medical Assistant (CMA) – AAMA\n- BLS/CPR Certified (American Heart Association)`);
  };

  const handleAnalyze = () => {
    if (!isJDFilled || !isResumeFilled) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        fitSummary: "Jill is an exceptional match. She holds the preferred CMA certification and has direct experience in clinical tasks required for this role.",
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
      
      {/* HEADER & UPGRADE MODAL (Omitted for brevity, logic remains same) */}
      
      <main className="max-w-7xl mx-auto w-full p-8 flex flex-col gap-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: PRIMARY WORKFLOW */}
          <div className="space-y-6">
            <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[550px] overflow-hidden shadow-2xl">
              <div className="flex bg-slate-950/50 border-b border-slate-800 p-2 gap-2">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'jd' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${isJDFilled ? 'bg-emerald-600' : 'bg-blue-600'}`}>1</span> Upload/Paste JD
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'resume' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${isResumeFilled ? 'bg-emerald-600' : 'bg-purple-600'}`}>2</span> Upload/Paste Resume
                </button>
              </div>
              <textarea className="flex-1 p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" value={activeTab === 'jd' ? jobDescription : resume} onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} placeholder="Paste content..."/>
              <div className="p-6 bg-slate-950/30 border-t border-slate-800 flex items-center gap-4">
                 <button onClick={loadSampleData} className="px-4 text-[10px] font-bold text-purple-400 border border-purple-500/20 rounded-lg py-2">Sample</button>
                 <button onClick={handleAnalyze} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold uppercase shadow-xl flex items-center justify-center gap-2"><Sparkles size={18}/> Run Synergy Scan</button>
              </div>
            </section>

            {/* SYNERGY MATCH MOVED BELOW INPUT */}
            {analysis && (
              <div className="bg-slate-900 p-8 rounded-3xl border border-emerald-500/20 flex items-center gap-8 shadow-xl animate-in fade-in slide-in-from-left-4">
                <div className="w-24 h-24 rounded-full border-4 border-purple-500 flex items-center justify-center bg-slate-950 shrink-0"><span className="text-3xl font-black text-white">{analysis.matchScore}%</span></div>
                <div><h3 className="text-purple-400 font-bold uppercase text-[10px] mb-2 tracking-widest">Synergy Match Result</h3><p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.fitSummary}"</p></div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: UPGRADED TOOLS */}
          <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {!analysis ? (
               <div className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-700 uppercase text-[10px] tracking-widest">Run Scan to Unlock Features</div>
            ) : (
              <div className="space-y-6">
                <div onClick={() => handleFeatureClick('market', 'Comp Intelligence')} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 relative cursor-pointer">
                  {!hasAccess('market') && <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[2px] rounded-3xl flex items-center justify-center"><Lock size={24} className="text-purple-500"/></div>}
                  <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2"><DollarSign size={14}/> Comp Intelligence</h3>
                  {/* ... Comp Intel Visuals ... */}
                </div>
                {/* ... Strengths/Gaps, Email, Interview Guide Sections ... */}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* RESTORED FOOTER LINKS */}
      <footer className="bg-slate-900 border-t border-white/5 p-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">© 2025 Recruit-IQ Predictive Intelligence</div>
          <div className="flex gap-8">
            <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors"><Twitter size={18}/></a>
            <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors"><Linkedin size={18}/></a>
            <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors"><Github size={18}/></a>
          </div>
          <div className="flex gap-6 text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
