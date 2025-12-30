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
    
    // This simulates the AI processing. 
    // In a full production version, this is where your Gemini API call would trigger.
    setTimeout(() => {
      setAnalysis({
        matchScore: 85,
        fitSummary: "Great technical match for cloud architecture.",
        strengths: ["Strong AWS experience", "Expert in React", "High scalability focus"],
        gaps: ["Needs more Golang experience", "Lacks specific FinTech domain knowledge"],
        interviewQuestions: [
          "How do you handle 99.99% uptime in a multi-region deployment?",
          "Explain your process for optimizing React performance in large-scale apps."
        ]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 h-20 flex items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Section */}
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[650px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800">
            <button 
              onClick={() => setActiveTab('jd')} 
              className={`flex-1 py-4 text-xs uppercase font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'jd' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500'
              }`}
            >
              <Briefcase size={14} /> Job Description
            </button>
            <button 
              onClick={() => setActiveTab('resume')} 
              className={`flex-1 py-4 text-xs uppercase font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'resume' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500'
              }`}
            >
              <FileText size={14} /> Candidate Resume
            </button>
          </div>

          <textarea 
            className="flex-1 p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed placeholder:text-slate-700" 
            value={activeTab === 'jd' ? jobDescription : resume} 
            onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} 
            placeholder={activeTab === 'jd' ? "Paste the job requirements here..." : "Paste the candidate's resume here..."} 
          />

          <div className="p-6 bg-slate-950/30 border-t border-slate-800">
            <button 
              onClick={handleAnalyze} 
              disabled={loading || !jobDescription || !resume}
              className="w-full py-4 rounded-2xl bg-white text-slate-950 font-bold uppercase hover:bg-blue-500 hover:text-white disabled:bg-slate-800 disabled:text-slate-600 transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {loading ? 'Analyzing Synergy...' : 'Run AI Synergy Scan'}
            </button>
          </div>
        </section>

        {/* Results Section */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-700 uppercase text-[10px] tracking-[0.2em] space-y-4">
              <div className="p-6 rounded-full bg-slate-900/50">
                <BarChart3 size={48} className="opacity-20 text-blue-400" />
              </div>
              <p>Awaiting Data Input</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Score Card */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="text-4xl font-black text-blue-500 opacity-20">{analysis.matchScore}%</div>
                </div>
                <h3 className="text-blue-400 font-bold uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
                  <Zap size={14} /> Match Analysis
                </h3>
                <p className="text-xl text-white font-medium leading-relaxed mb-6">
                  {analysis.fitSummary}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-emerald-500/20">
                    <span className="text-emerald-500 text-[10px] font-bold uppercase block mb-2">Key Strengths</span>
                    <ul className="text-xs text-slate-400 space-y-2">
                      {analysis.strengths.map((s, i) => <li key={i} className="flex items-center gap-2">✓ {s}</li>)}
                    </ul>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-rose-500/20">
                    <span className="text-rose-500 text-[10px] font-bold uppercase block mb-2">Growth Gaps</span>
                    <ul className="text-xs text-slate-400 space-y-2">
                      {analysis.gaps.map((g, i) => <li key={i} className="flex items-center gap-2">! {g}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Interview Guide */}
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
