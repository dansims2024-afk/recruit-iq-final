import React, { useState } from 'react';
import { Sparkles, Zap, Loader2, BarChart3, Briefcase, FileText } from 'lucide-react';

export default function App() {
  const [jobDescription, setJobDescription] = useState(`📄 Job Title: Medical Assistant
Overview: Seeking a skilled Medical Assistant to support providers in clinical and administrative tasks.
Key Responsibilities: Record vitals, assist in exams, and manage EMR documentation.`);

  const [resume, setResume] = useState(`Jill McSample | Newark, NJ
Summary: Compassionate Medical Assistant with experience in patient intake, EMR management, and vitals collection.
Certifications: Certified Medical Assistant (CMA), BLS/CPR.`);

  const [activeTab, setActiveTab] = useState('jd');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simTier, setSimTier] = useState('standard');

  const handleAnalyze = () => {
    if (!jobDescription || !resume) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        fitSummary: "Jill is an exceptional match with active CMA certification and local clinical experience.",
        strengths: ["CMA Certified", "EMR Proficiency", "Clinical Experience"],
        gaps: ["No major gaps identified"]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Professional Gradient Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <h1 className="text-2xl font-black tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">RECRUIT</span>
            <span className="text-blue-500 ml-1">IQ</span>
          </h1>
        </div>
        
        <div className="flex bg-slate-950/50 border border-white/5 rounded-2xl p-1 shadow-inner">
          {['standard', 'professional', 'executive'].map(t => (
            <button 
              key={t} 
              onClick={() => setSimTier(t)} 
              className={`px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${
                simTier === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[600px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 text-xs uppercase font-bold ${activeTab === 'jd' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}>
              <Briefcase size={14} className="inline mr-2" /> Job Description
            </button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 text-xs uppercase font-bold ${activeTab === 'resume' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}>
              <FileText size={14} className="inline mr-2" /> Resume
            </button>
          </div>
          <textarea 
            className="flex-1 p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" 
            value={activeTab === 'jd' ? jobDescription : resume} 
            onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} 
          />
          <div className="p-6 bg-slate-950/30 border-t border-slate-800">
            <button onClick={handleAnalyze} className="w-full py-4 rounded-2xl bg-white text-slate-950 font-bold uppercase hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl">
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Analyzing...' : 'Run Synergy Scan'}
            </button>
          </div>
        </section>

        {/* Results Card */}
        <section className="space-y-6">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-700">
              <BarChart3 size={48} className="opacity-20 mb-4" />
              <p className="uppercase text-[10px] tracking-widest">Awaiting Scan</p>
            </div>
          ) : (
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-blue-400 font-bold uppercase text-[10px] tracking-widest">Match Score</h3>
                <span className="text-3xl font-black text-blue-500">{analysis.matchScore}%</span>
              </div>
              <p className="text-xl text-white mb-8 leading-relaxed italic">"{analysis.fitSummary}"</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-emerald-500/20">
                  <span className="text-emerald-500 text-[10px] font-bold uppercase block mb-3">Key Strengths</span>
                  <ul className="text-xs text-slate-400 space-y-2">
                    {analysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-rose-500/20">
                  <span className="text-rose-500 text-[10px] font-bold uppercase block mb-3">Gaps</span>
                  <ul className="text-xs text-slate-400 space-y-2">
                    {analysis.gaps.map((g, i) => <li key={i}>• {g}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
