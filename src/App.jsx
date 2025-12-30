import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Zap, 
  Loader2, 
  Mail, 
  BarChart3, 
  Briefcase, 
  FileText, 
  Upload, 
  Orbit, 
  CreditCard 
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_your_key_here');

export default function App() {
  const [activeTab, setActiveTab] = useState('jd');
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simTier, setSimTier] = useState('standard');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file.name);
      // PDF Parsing will be re-added after dependency fix
    }
  };

  const handleUpgrade = async (tier) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      });
      const session = await response.json();
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  const handleAnalyze = () => {
    if (!jobDescription || !resume) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 85,
        fitSummary: "Great technical match for cloud architecture.",
        strengths: ["Strong AWS experience", "Expert in React"],
        gaps: ["Needs more Golang knowledge"],
        interviewQuestions: ["How do you handle 99.99% uptime?"]
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 h-20 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <Orbit size={32} className="text-blue-500 animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
          </div>
          <span className="text-xl font-black text-white uppercase tracking-tighter">Recruit-IQ</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 rounded-xl p-1 shadow-inner">
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
          {simTier !== 'standard' && (
            <button 
              onClick={() => handleUpgrade(simTier)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-2"
            >
              <CreditCard size={12} /> UPGRADE
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[650px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800">
            <button 
              onClick={() => setActiveTab('jd')} 
              className={`flex-1 py-4 text-xs font-bold uppercase transition-all ${activeTab === 'jd' ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-800' : 'text-slate-500'}`}
            >
              <Briefcase size={14} className="inline mr-2" /> Job Description
            </button>
            <button 
              onClick={() => setActiveTab('resume')} 
              className={`flex-1 py-4 text-xs font-bold uppercase transition-all ${activeTab === 'resume' ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-800' : 'text-slate-500'}`}
            >
              <FileText size={14} className="inline mr-2" /> Resume
            </button>
          </div>

          <div className="flex justify-end p-2 bg-slate-950/30 border-b border-slate-800">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-2 px-3 py-1"
            >
              <Upload size={12} /> UPLOAD PDF
            </button>
          </div>

          <textarea 
            className="flex-1 p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" 
            value={activeTab === 'jd' ? jobDescription : resume} 
            onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} 
            placeholder={`Paste the ${activeTab === 'jd' ? 'job requirements' : 'resume text'} here...`} 
          />

          <div className="p-6 bg-slate-950/30 border-t border-slate-800">
            <button 
              onClick={handleAnalyze} 
              disabled={loading || !jobDescription || !resume}
              className="w-full py-4 rounded-2xl bg-white text-slate-950 font-bold uppercase hover:bg-blue-500 hover:text-white disabled:bg-slate-800 disabled:text-slate-600 transition-all flex items-center justify-center gap-2 shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {loading ? 'Analyzing...' : 'Run Synergy Scan'}
            </button>
          </div>
        </section>

        <section className="space-y-6">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-700 uppercase text-[10px] tracking-[0.2em] space-y-4">
              <BarChart3 size={48} className="opacity-20 text-blue-400" />
              <p>Awaiting Data Input</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                <div className="text-4xl font-black text-blue-500 mb-4">{analysis.matchScore}% Match</div>
                <p className="text-white text-lg mb-6">{analysis.fitSummary}</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
