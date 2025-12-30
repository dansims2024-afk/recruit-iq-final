import React, { useState, useRef } from 'react';
import { Sparkles, Zap, Loader2, BarChart3, Briefcase, FileText, Upload, Trash2, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [activeTab, setActiveTab] = useState('jd');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simTier, setSimTier] = useState('standard');
  const fileInputRef = useRef(null);

  const loadSampleData = () => {
    setJobDescription(`📄 Job Title: Medical Assistant\nOverview: Seeking a skilled Medical Assistant to support providers in clinical and administrative tasks.\nKey Responsibilities: Record vitals, assist in exams, and manage EMR documentation.`);
    setResume(`Jill McSample | Newark, NJ\nSummary: Compassionate Medical Assistant with experience in patient intake, EMR management, and vitals collection.\nCertifications: Certified Medical Assistant (CMA), BLS/CPR.`);
  };

  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (activeTab === 'jd') setJobDescription(text);
      else setResume(text);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    if (!jobDescription || !resume) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        fitSummary: "Jill is an exceptional match. She holds the preferred CMA certification and has direct experience in both clinical and administrative tasks required for this role.",
        strengths: ["Active CMA Certification", "EMR Proficiency (Epic/Cerner)", "Local Clinical Experience"],
        gaps: ["No significant gaps; candidate meets all core requirements"],
        interviewQuestions: [
          "Can you describe a time you had to handle a difficult patient during the intake process?",
          "Which EMR systems are you most comfortable with, and how do you ensure data accuracy?"
        ]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* BRANDED HEADER */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)]"></div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">RECRUIT</span>
            <span className="text-purple-500 ml-1">IQ</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={loadSampleData} className="text-[10px] text-purple-400 hover:text-white border border-purple-500/30 hover:bg-purple-500/20 px-4 py-2 rounded-xl uppercase font-bold tracking-widest transition-all">
            Load Sample
          </button>
          <div className="flex bg-slate-950/50 border border-white/5 rounded-2xl p-1 shadow-inner">
            {['standard', 'professional', 'executive'].map(t => (
              <button key={t} onClick={() => setSimTier(t)} className={`px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${simTier === t ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500'}`}>{t}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800 p-2 gap-2">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 text-xs uppercase font-bold rounded-xl transition-all ${activeTab === 'jd' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
              <Briefcase size={14} className="inline mr-2" /> Job Description
            </button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 text-xs uppercase font-bold rounded-xl transition-all ${activeTab === 'resume' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
              <FileText size={14} className="inline mr-2" /> Resume
            </button>
          </div>
          
          <div className="relative flex-1 group">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.pdf,.docx" />
            <textarea 
              className="w-full h-full p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" 
              value={activeTab === 'jd' ? jobDescription : resume} 
              onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)}
              placeholder={`Paste ${activeTab === 'jd' ? 'Job Description' : 'Resume'} here...`}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={handleUploadClick} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-purple-400 transition-all border border-white/5"><Upload size={14} /></button>
              <button onClick={() => activeTab === 'jd' ? setJobDescription('') : setResume('')} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-all border border-white/5"><Trash2 size={14} /></button>
            </div>
          </div>

          <div className="p-6 bg-slate-950/30 border-t border-slate-800">
            <button onClick={handleAnalyze} className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Analyzing...' : 'Run Synergy Scan'}
            </button>
          </div>
        </section>

        {/* RESULTS PANEL */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-700">
              <BarChart3 size={48} className="opacity-20 mb-4" />
              <p className="uppercase text-[10px] tracking-widest">Awaiting Scan</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Score and Summary Card */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                    <div className="text-4xl font-black text-purple-500/20">{analysis.matchScore}%</div>
                </div>
                <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-4">Fit Summary</h3>
                <p className="text-xl text-white mb-8 leading-relaxed italic">"{analysis.fitSummary}"</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-5 rounded-2xl border border-emerald-500/20">
                    <span className="text-emerald-500 text-[10px] font-bold uppercase block mb-3 flex items-center gap-2"><CheckCircle2 size={12}/> Strengths</span>
                    <ul className="text-xs text-slate-400 space-y-2">
                      {analysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                  <div className="bg-slate-950/50 p-5 rounded-2xl border border-rose-500/20">
                    <span className="text-rose-500 text-[10px] font-bold uppercase block mb-3 flex items-center gap-2"><AlertCircle size={12}/> Growth Gaps</span>
                    <ul className="text-xs text-slate-400 space-y-2">
                      {analysis.gaps.map((g, i) => <li key={i}>• {g}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Restored Interview Guide Card */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
                  <Mail size={14} /> AI Interview Guide
                </h3>
                <div className="space-y-4">
                  {analysis.interviewQuestions.map((q, i) => (
                    <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-300 italic">
                      "{q}"
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
