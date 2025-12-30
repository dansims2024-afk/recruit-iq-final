import React, { useState, useRef } from 'react';
import { 
  Sparkles, Zap, Loader2, Mail, BarChart3, Briefcase, 
  FileText, Upload, CreditCard, Copy, RefreshCw, X, TrendingUp, Wand2
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
  const [analysis, setAnalysis] = useState(null);
  const [outreachDraft, setOutreachDraft] = useState('');
  const fileInputRef = useRef(null);

  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');

  const loadSampleData = () => {
    setJobDescription("POSITION: Senior DevOps Engineer\nLOCATION: Remote\n\nREQUIRED SKILLS:\n- 5+ years managing AWS infrastructure (EKS, S3).\n- Expert in Terraform and CI/CD.\n- Salary Target: $160,000 - $180,000.");
    setResume("NAME: Jordan Rivera\nEXPERIENCE: 6 Years in Cloud Engineering.\n\nSUMMARY: Built and scaled K8s clusters. Reduced deployment time by 65% via optimized CI/CD. Saved $12k/month in cloud spend.");
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
        fitSummary: "Jordan is an exceptional match. Their specific experience with EKS and cost-savings at FinStream aligns perfectly with your requirements for AWS expertise.",
        strengths: ["Direct Terraform alignment", "65% CI/CD optimization", "Strong cost-savings record"],
        gaps: ["Lacks specific Go proficiency mentioned in preferences"],
        marketIntel: { avgPay: "$172,000", demand: "High" },
        optimizedJD: "Emphasize 'FinOps' to attract more high-level candidates like Jordan."
      });
      setOutreachDraft(`Hi Jordan, I noticed your 65% deployment optimization. We're looking for that impact at Recruit-IQ. Open to a chat?`);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] max-w-4xl w-full p-8 relative shadow-2xl">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter">Choose Your Tier</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Standard */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-500">Standard</span>
                <div className="text-2xl font-black my-4">Free</div>
                <ul className="text-xs space-y-2 text-slate-400 mb-6"><li>• Match Score</li></ul>
                <button onClick={() => {setSimTier('standard'); setShowUpgradeModal(false);}} className="w-full py-2 rounded-xl border border-slate-700 text-[10px] font-black uppercase">Current Plan</button>
              </div>
              {/* Professional */}
              <div className="p-6 rounded-3xl border-2 bg-slate-950 flex flex-col" style={{ borderColor: brand.primary }}>
                <span className="text-[10px] font-black uppercase text-blue-400">Professional</span>
                <div className="text-2xl font-black my-4">$49/mo</div>
                <ul className="text-xs space-y-2 text-slate-400 mb-6 flex-1"><li>• Strengths/Gaps</li><li>• Outreach Emails</li></ul>
                <button className="w-full py-2 rounded-xl text-[10px] font-black uppercase text-white" style={{ backgroundColor: brand.primary }}>Upgrade</button>
              </div>
              {/* Executive */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-black uppercase text-purple-400">Executive</span>
                <div className="text-2xl font-black my-4">$99/mo</div>
                <ul className="text-xs space-y-2 text-slate-400 mb-6 flex-1"><li>• Market Intel</li><li>• JD Optimizer</li></ul>
                <button className="w-full py-2 rounded-xl text-[10px] font-black uppercase text-white" style={{ backgroundColor: brand.accent }}>Go Executive</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 h-20 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <img src="/CCAI.png" alt="Logo" className="h-10 w-auto" onError={(e) => e.target.style.display='none'} />
          <span className="text-2xl font-black text-white uppercase tracking-tighter">Recruit-IQ</span>
        </div>
        <button onClick={() => setShowUpgradeModal(true)} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl flex items-center gap-2 transition-transform hover:scale-105" style={{ background: `linear-gradient(to right, ${brand.primary}, ${brand.secondary})` }}>
          <Zap size={14} fill="currentColor" /> Upgrade Tier
        </button>
      </header>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800">
            <button onClick={() => setActiveTab('jd')} className="flex-1 py-5 text-xs font-black uppercase tracking-widest" style={{ color: activeTab === 'jd' ? brand.glow : brand.neutral, borderBottom: activeTab === 'jd' ? `3px solid ${brand.primary}` : 'none' }}>Job Description</button>
            <button onClick={() => setActiveTab('resume')} className="flex-1 py-5 text-xs font-black uppercase tracking-widest" style={{ color: activeTab === 'resume' ? brand.glow : brand.neutral, borderBottom: activeTab === 'resume' ? `3px solid ${brand.primary}` : 'none' }}>Resume</button>
          </div>
          <div className="flex justify-between p-3 bg-slate-950/20">
            <button onClick={loadSampleData} className="text-[10px] font-black flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"><RefreshCw size={12} /> LOAD SAMPLE IT CASE</button>
            <div className="flex gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />
              <button onClick={() => fileInputRef.current.click()} className="text-[10px] font-black flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-700 text-slate-500 hover:text-white"><Upload size={12} /> UPLOAD PDF</button>
            </div>
          </div>
          <textarea className="flex-1 p-8 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" value={activeTab === 'jd' ? jobDescription : resume} onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} placeholder="Paste data or load sample..." />
          <div className="p-8 bg-slate-950/50 border-t border-slate-800">
            <button onClick={handleAnalyze} disabled={loading || !jobDescription || !resume} className="w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest shadow-2xl transition-all hover:brightness-110 disabled:opacity-50" style={{ background: `linear-gradient(to right, ${brand.primary}, ${brand.secondary})` }}>
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />} EXECUTE AI SYNERGY SCAN
            </button>
          </div>
        </section>

        {/* Results Card - RESTRUCTURED */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center opacity-20">
              <BarChart3 size={60} />
              <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Neural Input</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-700">
              
              {/* NEW TOP SCORE LAYOUT */}
              <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
                <div className="p-10 text-center border-b border-slate-800/50 bg-slate-950/30">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">Neural Match Score</div>
                  <div className="text-8xl font-black tracking-tighter" style={{ color: brand.glow }}>{analysis.matchScore}%</div>
                </div>
                <div className="p-10">
                  <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: brand.neutral }}><FileText size={14} /> Executive Fit Summary</h3>
                  <p className="text-xl text-white font-light leading-relaxed">{analysis.fitSummary}</p>
                </div>
              </div>

              {/* Tiered Content */}
              {simTier !== 'standard' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/20">
                    <span className="text-emerald-400 text-[10px] font-black uppercase block mb-2 tracking-widest">Key Strengths</span>
                    {analysis.strengths.map((s, i) => <div key={i} className="text-xs text-slate-400 mb-1 leading-relaxed">✓ {s}</div>)}
                  </div>
                  <div className="bg-rose-500/5 p-6 rounded-3xl border border-rose-500/20">
                    <span className="text-rose-400 text-[10px] font-black uppercase block mb-2 tracking-widest">Critical Gaps</span>
                    {analysis.gaps.map((g, i) => <div key={i} className="text-xs text-slate-400 mb-1 leading-relaxed">! {g}</div>)}
                  </div>
                </div>
              )}
