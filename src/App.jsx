import React, { useState } from 'react';
import { Sparkles, UserPlus, Zap, Loader2, Mail, BarChart3, Briefcase, FileText, Copy } from 'lucide-react';

// We import the logo from your src folder
import logo from './logo.png';

export default function App() {
  const [activeTab, setActiveTab] = useState('jd');
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simTier, setSimTier] = useState('standard');

  const handleAnalyze = () => {
    if (!jobDescription || !resume) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 85,
        fitSummary: "Great technical match for cloud architecture.",
        strengths: ["Strong AWS experience", "Expert in React", "High scalability focus"],
        gaps: ["Needs more Golang experience"],
        interviewQuestions: ["How do you handle 99.99% uptime?"]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Updated Header with New Logo */}
      <header className="bg-slate-900 border-b border-slate-800 h-20 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          {/* Logo Image */}
          <img src={logo} alt="Recruit-IQ Logo" className="h-10 w-auto" />
          <span className="text-xl font-black text-white uppercase tracking-tighter">Recruit-IQ</span>
        </div>
        
        <div className="flex bg-slate-800 rounded-xl p-1">
          {['standard', 'professional', 'executive'].map(t => (
            <button 
              key={t} 
              onClick={() => setSimTier(t)} 
              className={`px-4 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all ${
                simTier === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* Rest of the app logic remains the same */}
      <main className="max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[650px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 text-xs uppercase font-bold ${activeTab === 'jd' ? 'bg-slate-800 text-blue-400' : 'text-slate-500'}`}>
              <Briefcase size={14} className="inline mr-2" /> Job Description
            </button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 text-xs uppercase font-bold ${activeTab === 'resume' ? 'bg-slate-800 text-blue-400' : 'text-slate-500'}`}>
              <FileText size={14} className="inline mr-2" /> Candidate Resume
            </button>
          </div>
          <textarea 
            className="flex-1 p-6 bg-transparent text-slate-300 outline-none resize-none text-sm" 
            value={activeTab === 'jd' ? jobDescription : resume} 
            onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} 
            placeholder="Paste content here..." 
          />
          <div className="p-6 bg-slate-950/30 border-t border-slate-800">
            <button onClick={handleAnalyze} className="w-full py-4 rounded-2xl bg-white text-slate-950 font-bold uppercase hover:bg-blue-600 hover:text-white transition-all">
              {loading ? 'Scanning...' : 'Run AI Synergy Scan'}
            </button>
          </div>
        </section>

        <section className="space-y-6">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-700">
              <BarChart3 size={48} className="opacity-20 mb-4" />
              <p className="uppercase text-[10px] tracking-widest">Awaiting Data</p>
            </div>
          ) : (
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl animate-in fade-in">
              <h3 className="text-blue-400 font-bold uppercase text-[10px] mb-4 tracking-widest">Match Analysis</h3>
              <p className="text-xl text-white mb-6 leading-relaxed">{analysis.fitSummary}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-emerald-500/20">
                  <span className="text-emerald-500 text-[10px] font-bold uppercase block mb-2">Strengths</span>
                  <ul className="text-xs text-slate-400 space-y-1">
                    {analysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-rose-500/20">
                  <span className="text-rose-500 text-[10px] font-bold uppercase block mb-2">Gaps</span>
                  <ul className="text-xs text-slate-400 space-y-1">
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
