import React, { useState, useRef } from 'react';
import { Sparkles, Zap, Loader2, BarChart3, Briefcase, FileText, Upload, Mail, CheckCircle2, AlertCircle, Printer, DollarSign, Send, ClipboardCheck, Lock, X, Check, Download, Twitter, Linkedin, Github, TrendingUp, Target, Users, Copy } from 'lucide-react';

export default function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [activeTab, setActiveTab] = useState('jd');
  const [analysis, setAnalysis] = useState(null);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);
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

  const generateEmail = () => {
    if (!analysis) return;
    const emailContent = `Subject: Interview Request - Medical Assistant Position

Hi Jill,

I hope this email finds you well.

I came across your resume and was very impressed by your 3+ years of experience as a Medical Assistant, particularly your proficiency with Epic and Cerner EMR systems. Your background in high-volume patient intake and your active CMA certification make you an excellent fit for our open Medical Assistant role.

We are looking for someone with your exact clinical versatility to join our team.

Would you be available for a brief introductory call sometime this week to discuss your background and learn more about the opportunity?

Best regards,

[Your Name]
[Your Title]`;
    setGeneratedEmail(emailContent);
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  // ... (loadSampleData and handleAnalyze functions remain the same as previous complete version)
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
          { title: "Quantifiable Efficiency", desc: "Demonstrated 25% faster patient intake cycles in previous high-volume Newark clinics (avg 45+ patients/day) while maintaining zero documentation errors." }
        ],
        gaps: [
          { title: "Oncology Billing Complexity", desc: "While proficient in ICD-10 coding, candidate has limited experience with specific high-complexity oncology modifiers required for this role." }
        ],
        interviewQuestions: ["Q1", "Q2"],
        marketData: { low: 38500, avg: 47200, high: 56000 }
      });
      setLoading(false);
    }, 1500);
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* UPGRADE MODAL (Using new color balance) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
          <div className="bg-slate-900 border border-indigo-500/40 w-full max-w-xl rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            {/* ... Modal Content ... */}
            <button className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl font-black text-white shadow-xl uppercase tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all">
                Activate Pro for $29.99/mo
            </button>
          </div>
        </div>
      )}

      {/* HEADER (Using new color balance) */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">RECRUIT<span className="text-indigo-500 ml-1">IQ</span></h1>
        </div>
        <div className="flex bg-slate-950/50 border border-white/5 rounded-2xl p-1">
          <button onClick={() => setSimTier('standard')} className={`px-8 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${simTier === 'standard' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Standard (Free)</button>
          <button onClick={() => setSimTier('pro')} className={`px-8 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${simTier === 'pro' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-slate-500 hover:text-white'}`}>Pro ($29.99)</button>
        </div>
      </header>

      {/* ... Quick Start Guide ... */}

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        
        {/* INPUT PANEL (Using new color balance) */}
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl relative">
          <div className="flex bg-slate-950/50 border-b border-slate-800 p-2 gap-2">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl ${activeTab === 'jd' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-white mr-2 ${isJDFilled ? 'bg-emerald-600' : 'bg-blue-600'}`}>1</span> Upload JD
            </button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 text-[10px] uppercase font-bold rounded-xl ${activeTab === 'resume' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500'}`}>
              <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-white mr-2 ${isResumeFilled ? 'bg-emerald-600' : 'bg-indigo-600'}`}>2</span> Upload Resume
            </button>
          </div>
          {/* ... Textarea & Upload Buttons ... */}
          <div className="p-6 bg-slate-950/30 border-t border-slate-800 flex items-center gap-4">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-lg ${analysis ? 'bg-emerald-600' : 'bg-amber-600'}`}>3</div>
             <button onClick={handleAnalyze} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black uppercase shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"><Sparkles size={18}/> Run Synergy Scan</button>
          </div>
        </section>

        {/* RESULTS PANEL */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {analysis && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
              
              {/* Score Header (Using new color balance) */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex items-center gap-8 shadow-xl">
                <div className="w-24 h-24 rounded-full border-4 border-indigo-500 flex items-center justify-center bg-slate-950 shrink-0"><span className="text-3xl font-black text-white">{analysis.matchScore}%</span></div>
                <div><h3 className="text-indigo-400 font-bold uppercase text-[10px] mb-2 tracking-widest">Synergy Score</h3><p className="text-slate-300 italic text-sm leading-relaxed font-medium">"{analysis.fitSummary}"</p></div>
              </div>

              {/* ... Locked Audit & Interview Guide ... */}

              {/* FUNCTIONAL EMAIL GENERATOR */}
              <div onClick={() => handleFeatureClick('pro', 'Email Outreach')} className="relative cursor-pointer group">
                {!hasAccess('pro') && <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl"><div className="bg-indigo-600 p-3 rounded-full text-white shadow-lg"><Lock size={20}/></div></div>}
                <div className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl ${!hasAccess('pro') ? 'opacity-30 grayscale blur-[1px]' : ''}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><Send size={14} /> Corporate Outreach Email</h3>
                    <button onClick={generateEmail} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-indigo-500 transition-all shadow-lg">Generate</button>
                  </div>
                  
                  {/* Generated Email Display Area */}
                  {generatedEmail ? (
                    <div className="relative bg-slate-950 rounded-2xl border border-white/5 p-6 animate-in fade-in">
                      <button onClick={copyEmailToClipboard} className="absolute top-4 right-4 p-2 bg-slate-900 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all flex items-center gap-2 text-[10px] font-bold uppercase">
                        {emailCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {emailCopied ? 'Copied!' : 'Copy'}
                      </button>
                      <pre className="text-xs text-slate-300 font-medium whitespace-pre-wrap font-sans">{generatedEmail}</pre>
                    </div>
                  ) : (
                    <div className="h-32 bg-slate-950/50 rounded-2xl border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-600 font-bold uppercase">Click 'Generate' to create email</div>
                  )}
                </div>
              </div>

            </div>
          )}
        </section>
      </main>

      {/* ... Footer ... */}
    </div>
  );
}
