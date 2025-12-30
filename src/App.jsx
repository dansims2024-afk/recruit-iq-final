import React, { useState, useRef } from 'react';
import { 
  Sparkles, Zap, Loader2, Mail, BarChart3, Briefcase, 
  FileText, Upload, CreditCard, Copy, RefreshCw, X, TrendingUp, Wand2, Shield, Info, LifeBuoy, Heart, Target, Download, Edit3, Lock
} from 'lucide-react';
import pdfToText from 'react-pdftotext';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_your_publishable_key_here');

const brand = {
  primary: '#2B81B9',
  secondary: '#52438E',
  accent: '#8C50A1',
  neutral: '#b2acce',
  glow: '#00c9ff'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('jd');
  const [loading, setLoading] = useState(false);
  const [simTier, setSimTier] = useState('standard');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [outreachDraft, setOutreachDraft] = useState('');
  const fileInputRef = useRef(null);

  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');

  const loadSampleData = () => {
    setJobDescription("POSITION: Senior DevOps Engineer\nLOCATION: Remote / New York\n\nREQUIRED SKILLS:\n- 5+ years managing AWS infrastructure (EKS, S3).\n- Expert in Terraform and Infrastructure as Code.\n- Strong CI/CD background with GitHub Actions.\n- Salary Target: $160,000 - $185,000.");
    setResume("NAME: Jordan Rivera\nEXPERIENCE: 6 Years in Cloud Engineering.\n\nSUMMARY: Currently a DevOps Lead. Built and scaled K8s clusters for high-frequency trading apps.\n\nSKILLS:\n- AWS, Terraform, Docker, Kubernetes.\n- Reduced deployment time by 65% via optimized CI/CD.\n- Saved $12k/month in cloud spend via FinOps.");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pdfToText(file)
      .then(text => activeTab === 'jd' ? setJobDescription(text) : setResume(text))
      .catch(() => alert("Error reading PDF."));
  };

  const handleAnalyze = () => {
    if (!jobDescription || !resume) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        fitSummary: "Jordan is an exceptional match. Their specific experience with EKS and cost-savings aligns perfectly with your requirements.",
        pros: ["Direct Terraform alignment", "65% CI/CD optimization", "Strong FinOps record", "AWS Certified Architect"],
        cons: ["Lacks specific Go proficiency mentioned in preferences", "No experience with Azure/GCP mentioned"],
        cultureScore: 88,
        cultureFit: "High alignment. The candidate's focus on efficiency matches the fast-paced, ROI-driven tone of the JD.",
        rewriter: ["Add 'Managed multi-region EKS clusters' to Summary.", "Quantify Terraform experience: 'Managed 200+ resources via IaC'."],
        benchmarking: "Your JD requires 5 years exp; Industry avg (Google/AWS) for this level is 6.5 years.",
        cheatSheet: [{ q: "Explain your EKS scaling strategy.", listenFor: "Look for mention of Horizontal Pod Autoscaler." }],
        marketIntel: { avgPay: "$172,500", demand: "High", rangeMatch: "92%" },
        optimizedJD: "Focus on 'FinOps' and 'Scalability' to attract more candidates like Jordan."
      });
      setOutreachDraft(`Hi Jordan, I noticed your 65% deployment optimization at your previous role...`);
      setLoading(false);
    }, 1500);
  };

  const handleUpgrade = (tier) => {
    setSimTier(tier);
    setShowUpgradeModal(false);
  };

  // Helper component to lock features
  const LockedFeature = ({ tierRequired, title, description, children }) => {
    const isLocked = (tierRequired === 'professional' && simTier === 'standard') || 
                     (tierRequired === 'executive' && (simTier === 'standard' || simTier === 'professional'));

    return (
      <div className="relative overflow-hidden group">
        <div className={isLocked ? "blur-md pointer-events-none opacity-40 select-none transition-all" : "transition-all"}>
          {children}
        </div>
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-900/40 backdrop-blur-sm rounded-[2rem] border border-white/5">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 mb-3">
              <Lock size={20} />
            </div>
            <h4 className="text-sm font-black text-white uppercase mb-1">{title}</h4>
            <p className="text-[10px] text-slate-300 max-w-[200px] leading-tight mb-4">{description}</p>
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-1.5 bg-blue-600 rounded-lg text-[10px] font-black uppercase text-white hover:bg-blue-500 transition-colors"
            >
              Upgrade to Unlock
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative">
      
      {/* Support & Upgrade Modals (Logic remains same) */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] max-w-lg w-full p-10 relative text-center">
            <button onClick={() => setShowSupportModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">Support</h2>
            <a href="mailto:hello@corecreaqtivityai.com" className="block w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest">Email Support</a>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] max-w-4xl w-full p-8 relative">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter">Upgrade Tiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['standard', 'professional', 'executive'].map((t) => (
                <div key={t} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase mb-4">{t}</span>
                  <button onClick={() => handleUpgrade(t)} className="w-full py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase">Select {t}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header - LOGO TOP LEFT */}
      <header className="bg-slate-900 border-b border-slate-800 h-24 flex items-center justify-between px-10 print:hidden">
        <div className="flex items-center gap-4">
          <img src="/CCAI.png" alt="Recruit-IQ" className="h-14 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Recruit-IQ</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">{simTier} intelligence</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setShowUpgradeModal(true)} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl flex items-center gap-2 transition-transform hover:scale-105" style={{ background: `linear-gradient(to right, ${brand.primary}, ${brand.secondary})` }}>
            <Zap size={14} fill="currentColor" /> Upgrade
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Left Side: Inputs */}
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl print:hidden">
          <div className="flex bg-slate-950/50 border-b border-slate-800">
            <button onClick={() => setActiveTab('jd')} className="flex-1 py-5 text-xs font-black uppercase tracking-widest" style={{ color: activeTab === 'jd' ? brand.glow : brand.neutral, borderBottom: activeTab === 'jd' ? `3px solid ${brand.primary}` : 'none' }}>Job Description</button>
            <button onClick={() => setActiveTab('resume')} className="flex-1 py-5 text-xs font-black uppercase tracking-widest" style={{ color: activeTab === 'resume' ? brand.glow : brand.neutral, borderBottom: activeTab === 'resume' ? `3px solid ${brand.primary}` : 'none' }}>Resume</button>
          </div>
          <div className="flex justify-between p-3 bg-slate-950/20">
            <button onClick={loadSampleData} className="text-[10px] font-black flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"><RefreshCw size={12} /> LOAD SAMPLE CASE</button>
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />
              <button onClick={() => fileInputRef.current.click()} className="text-[10px] font-black flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-700 text-slate-500 hover:text-white"><Upload size={12} /> UPLOAD PDF</button>
            </div>
          </div>
          <textarea className="flex-1 p-8 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" value={activeTab === 'jd' ? jobDescription : resume} onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} placeholder="Paste data here..." />
          <div className="p-8 bg-slate-950/50 border-t border-slate-800">
            <button onClick={handleAnalyze} disabled={loading || !jobDescription || !resume} className="w-full py-5 rounded-3xl text-white font-black uppercase tracking-widest shadow-2xl transition-all hover:brightness-110 disabled:opacity-50" style={{ background: `linear-gradient(to right, ${brand.primary}, ${brand.secondary})` }}>
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />} Execute Synergy Scan
            </button>
          </div>
        </section>

        {/* Right Side: Results */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center opacity-20">
              <BarChart3 size={60} />
              <p className="text-[10px] font-black uppercase tracking-widest mt-4">Awaiting Data Input</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Header */}
              <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
                <div className="p-10 text-center border-b border-slate-800/50 bg-slate-950/30">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">Neural Match Score</div>
                  <div className="text-8xl font-black tracking-tighter" style={{ color: brand.glow }}>{analysis.matchScore}%</div>
                </div>
                <div className="p-10 text-center">
                  <p className="text-lg text-white font-light leading-relaxed px-4">{analysis.fitSummary}</p>
                </div>
              </div>

              {/* PROS & CONS EVALUATION */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/20">
                  <span className="text-emerald-400 text-[10px] font-black uppercase block mb-4 tracking-widest flex items-center gap-2"><Zap size={12} fill="currentColor" /> Pro's</span>
                  <ul className="space-y-2">
                    {analysis.pros.map((p, i) => <li key={i} className="text-xs text-slate-400 flex gap-2">✓ {p}</li>)}
                  </ul>
                </div>
                <div className="bg-rose-500/5 p-6 rounded-[2rem] border border-rose-500/20">
                  <span className="text-rose-400 text-[10px] font-black uppercase block mb-4 tracking-widest flex items-center gap-2"><Info size={12} /> Con's</span>
                  <ul className="space-y-2">
                    {analysis.cons.map((c, i) => <li key={i} className="text-xs text-slate-400 flex gap-2">! {c}</li>)}
                  </ul>
                </div>
              </div>

              {/* GATED FEATURES */}
              <LockedFeature 
                tierRequired="professional" 
                title="Behavioral Predictor" 
                description="Predict candidate cultural alignment based on linguistic tone analysis."
              >
                <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800">
                  <h3 className="text-[10px] font-black uppercase text-purple-400 mb-4 flex items-center gap-2"><Heart size={14} /> Culture Fit: {analysis.cultureScore}%</h3>
                  <p className="text-xs text-slate-400 italic">"{analysis.cultureFit}"</p>
                </div>
              </LockedFeature>

              <LockedFeature 
                tierRequired="professional" 
                title="Personalized Outreach" 
                description="Generate AI-drafted emails tailored to candidate's specific career highlights."
              >
                <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-2"><Mail size={14} /> AI Outreach Draft</h3>
                    <Copy size={14} className="text-slate-600" />
                  </div>
                  <div className="p-4 bg-slate-950 rounded-2xl text-[11px] text-slate-400 font-mono leading-relaxed">{outreachDraft}</div>
                </div>
              </LockedFeature>

              <LockedFeature 
                tierRequired="executive" 
                title="Executive Market Intel" 
                description="Real-time salary benchmarking and JD competitiveness analysis."
              >
                <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800" style={{ borderLeft: `6px solid ${brand.accent}` }}>
                  <h3 className="text-[10px] font-black uppercase text-purple-400 mb-4 flex items-center gap-2"><TrendingUp size={14} /> Market Intel</h3>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Avg Market Pay</div>
                      <div className="text-2xl font-black">{analysis.marketIntel.avgPay}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase font-bold text-emerald-400">{analysis.marketIntel.rangeMatch} Match</div>
                    </div>
                  </div>
                </div>
              </LockedFeature>

              <LockedFeature 
                tierRequired="executive" 
                title="AI JD Optimizer" 
                description="Optimize your JD keywords to rank higher in LinkedIn and Indeed search results."
              >
                <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800">
                  <h3 className="text-[10px] font-black uppercase text-cyan-400 mb-4 flex items-center gap-2"><Wand2 size={14} /> Optimization Suggestions</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">"{analysis.optimizedJD}"</p>
                </div>
              </LockedFeature>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 h-20 flex items-center justify-center gap-12 print:hidden">
        <a href="https://www.corecreativityai.com/blank" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 transition-colors"><Shield size={12} /> Privacy</a>
        <a href="https://www.corecreativityai.com/blank-2" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 transition-colors"><Info size={12} /> Terms</a>
        <button onClick={() => setShowSupportModal(true)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 transition-colors"><LifeBuoy size={12} /> Support</button>
      </footer>
    </div>
  );
}
