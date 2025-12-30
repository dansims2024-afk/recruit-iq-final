import React, { useState } from 'react';
import { Sparkles, UserPlus, Zap, Loader2, Mail, BarChart3, Briefcase, FileText, Copy } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('jd');
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simTier, setSimTier] = useState('standard');

  const isProfessional = simTier === 'professional' || simTier === 'executive';

  const handleAnalyze = () => {
    if (!jobDescription || !resume) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 85,
        fitSummary: "Great technical match for cloud architecture.",
        strengths: ["Strong AWS experience", "Expert in React"],
        gaps: ["Needs more Golang"],
        interviewQuestions: ["How do you handle 99.99% uptime?"]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 h-20 flex items-center justify-between px-8">
        <span className="text-xl font-black text-white uppercase tracking-tighter">Recruit-IQ</span>
        <div className="flex bg-slate-800 rounded-xl p-1">
          {['standard', 'professional', 'executive'].map(t => (
            <button key={t} onClick={() => setSimTier(t)} className={`px-4 py-1.5 rounded-lg text-[9px] uppercase font-bold ${simTier === t ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{t}</button>
          ))}
        </div>
      </header>
      <main className="max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[600px] overflow-hidden">
          <div className="flex bg-slate-950/50 border-b border-slate-800">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 text-xs uppercase font-bold ${activeTab === 'jd' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Job Description</button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 text-xs uppercase font-bold ${activeTab === 'resume' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Resume</button>
          </div>
          <textarea className="flex-1 p-6 bg-transparent text-white outline-none resize-none" value={activeTab === 'jd' ? jobDescription : resume} onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} placeholder="Paste content here..." />
          <div className="p-6 bg-slate-950/30 border-t border-slate-800">
            <button onClick={handleAnalyze} className="w-full py-4 rounded-2xl bg-white text-slate-950 font-bold uppercase hover:bg-slate-200 transition-all">Run AI Scan</button>
          </div>
        </section>
        <section className="space-y-6">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-600 uppercase text-xs tracking-widest">
              <FileText className="mb-4 opacity-20" size={48} /> Awaiting Scan
            </div>
          ) : (
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
              <h3 className="text-blue-400 font-bold uppercase text-xs mb-4">Match Score: {analysis.matchScore}%</h3>
              <p className="italic text-lg text-slate-200 mb-6">"{analysis.fitSummary}"</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
