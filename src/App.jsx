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
  CreditCard 
} from 'lucide-react';
import pdfToText from 'react-pdftotext';
import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe Publishable Key
const stripePromise = loadStripe('pk_test_your_key_here');

// BRAND KIT PALETTE
const brand = {
  primary: '#2B81B9',    // Blue
  secondary: '#52438E',  // Deep Purple
  accent: '#8C50A1',     // Plum
  neutral: '#b2acce',    // Lavender
  glow: '#00c9ff'        // Cyan
};

export default function App() {
  const [activeTab, setActiveTab] = useState('jd');
  const [loading, setLoading] = useState(false);
  const [simTier, setSimTier] = useState('standard');
  const [analysis, setAnalysis] = useState(null);
  const fileInputRef = useRef(null);

  // PRE-LOADED SAMPLE DATA
  const [jobDescription, setJobDescription] = useState(
    "JOB TITLE: Senior Cloud Solutions Architect\nCOMPANY: InnoTech Solutions\n\nRequirements:\n- 8+ years of experience in Cloud Infrastructure (AWS preferred).\n- Expert proficiency in React and Node.js microservices.\n- Experience with Docker, Kubernetes, and Terraform.\n- Strong focus on 99.99% uptime and high scalability.\n- Preferred: Knowledge of Golang for high-performance backend systems."
  );

  const [resume, setResume] = useState(
    "NAME: Alex Sterling\nSUMMARY: Cloud Architect with 10 years of experience in building scalable web apps.\n\nTECHNICAL SKILLS:\n- Cloud: AWS (EC2, S3, Lambda, RDS), GCP.\n- Frontend: React, Tailwind CSS, Next.js.\n- Backend: Node.js, Python, Java.\n- DevOps: Docker, CI/CD, GitHub Actions.\n\nEXPERIENCE:\n- Lead Engineer at TechGlobal. Reduced cloud costs by 30% while scaling to 1M users."
  );

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pdfToText(file)
      .then(text => activeTab === 'jd' ? setJobDescription(text) : setResume(text))
      .catch(() => alert("Error reading PDF. Please try pasting text directly."));
  };

  const handleAnalyze = () => {
    if (!jobDescription || !resume) return;
    setLoading(true);
    // Simulation: Connect Gemini API here in the next step
    setTimeout(() => {
      setAnalysis({
        matchScore: 82,
        fitSummary: "Alex is a strong technical match for the AWS and React requirements, though lacks the preferred Golang experience.",
        strengths: ["Expert AWS knowledge", "10+ years scaling React apps", "Deep DevOps background"],
        gaps: ["No mentioned experience with Golang", "Terraform experience is implied but not detailed"],
        interviewQuestions: [
          "How would you handle a 99.99% uptime requirement in a multi-region deployment?",
          "Can you describe a time you optimized a React application for high performance?"
        ]
      });
      setLoading(false);
    }, 1500);
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
      if (stripe) await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Header with Swirl Logo */}
      <header className="bg-slate-900 border-b border-slate-800 h-20 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            {/* Custom SVG Swirl inspired by your logo */}
            <svg viewBox="0 0 100 100" className="animate-[spin_10s_linear_infinite]">
              <defs>
                <linearGradient id="swirlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={brand.glow} />
                  <stop offset="50%" stopColor={brand.primary} />
                  <stop offset="100%" stopColor={brand.accent} />
                </linearGradient>
              </defs>
              <path 
                d="M50 5 C 20 5, 5 30, 5 50 C 5 70, 30 95, 50 95 C 70 95, 95 70, 95 50 C 95 30, 70 5, 50 5 Z" 
                fill="none" 
                stroke="url(#swirlGrad)" 
                strokeWidth="8" 
                strokeDasharray="20 10"
              />
              <circle cx="50" cy="50" r="12" fill={brand.glow} className="animate-pulse" />
            </svg>
          </div>
          <span className="text-2xl font-black text-white uppercase tracking-tighter">Recruit-IQ</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
            {['standard', 'professional', 'executive'].map(t => (
              <button 
                key={t} 
                onClick={() => setSimTier(t)} 
                className={`px-4 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all ${
                  simTier === t ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                style={{ backgroundColor: simTier === t ? brand.secondary : 'transparent' }}
              >
                {t}
              </button>
            ))}
          </div>
          {simTier !== 'standard' && (
            <button 
              onClick={() => handleUpgrade(simTier)}
              className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-2"
              style={{ backgroundColor: brand.primary }}
            >
              <CreditCard size={12} /> UPGRADE
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Card */}
        <section className="bg-slate-900 rounded-[2rem] border border-slate-800 flex flex-col h-[650px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800">
            <button 
              onClick={() => setActiveTab('jd')} 
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'jd' ? 'opacity-100' : 'opacity-40'}`}
              style={{ color: activeTab === 'jd' ? brand.glow : brand.neutral, borderBottom: activeTab === 'jd' ? `3px solid ${brand.primary}` : 'none' }}
            >
              Job Description
            </button>
            <button 
              onClick={() => setActiveTab('resume')} 
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'resume' ? 'opacity-100' : 'opacity-40'}`}
              style={{ color: activeTab === 'resume' ? brand.glow : brand.neutral, borderBottom: activeTab === 'resume' ? `3px solid ${brand.primary}` : 'none' }}
            >
              Resume
            </button>
          </div>

          <div className="flex justify-end p-2 bg-slate-950/20">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="text-[10px] font-bold flex items-center gap-2 px-3 py-1 text-slate-500 hover:text-white"
            >
              <Upload size={12} /> UPLOAD PDF
            </button>
          </div>

          <textarea 
            className="flex-1 p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" 
            value={activeTab === 'jd' ? jobDescription : resume} 
            onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} 
          />

          <div className="p-6 bg-slate-950/50 border-t border-slate-800">
            <button 
              onClick={handleAnalyze} 
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              style={{ background: `linear-gradient(to right, ${brand.primary}, ${brand.secondary})` }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {loading ? 'Analyzing...' : 'Execute Synergy Scan'}
            </button>
          </div>
        </section>

        {/* Results Card */}
        <section className="space-y-6 overflow-y-auto">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-700 uppercase text-[10px] tracking-[0.3em] space-y-4">
              <BarChart3 size={48} className="opacity-10" />
              <p>Awaiting Neural Input</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-6">
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-5xl font-black" style={{ color: brand.glow }}>
                  {analysis.matchScore}%
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: brand.glow }}>
                  <Zap size={14} /> Match Result
                </h3>
                <p className="text-xl text-white font-medium mb-6">{analysis.fitSummary}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-400 text-[10px] font-black uppercase block mb-2">Strengths</span>
                    <ul className="text-xs text-slate-400 space-y-2">
                      {analysis.strengths.map((s, i) => <li key={i}>✓ {s}</li>)}
                    </ul>
                  </div>
                  <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/20">
                    <span className="text-rose-400 text-[10px] font-black uppercase block mb-2">Gaps</span>
                    <ul className="text-xs text-slate-400 space-y-2">
                      {analysis.gaps.map((g, i) => <li key={i}>! {g}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: brand.accent }}>
                  <Mail size={14} /> Interview Guide
                </h3>
                <div className="space-y-3">
                  {analysis.interviewQuestions.map((q, i) => (
                    <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm italic text-slate-300">
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
