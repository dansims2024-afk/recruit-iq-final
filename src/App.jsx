import React, { useState, useRef } from 'react';
import { 
  Sparkles, Zap, Loader2, Mail, BarChart3, Briefcase, 
  FileText, Upload, CreditCard, Copy, RefreshCw, X, TrendingUp, Wand2
} from 'lucide-react';
import pdfToText from 'react-pdftotext';
import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe Publishable Key
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
    setJobDescription("POSITION: Senior DevOps Engineer\nLOCATION: Remote / New York\n\nREQUIRED SKILLS:\n- 5+ years managing AWS infrastructure (EKS, S3, CloudWatch).\n- Expert in Terraform and Infrastructure as Code.\n- Strong CI/CD background with GitHub Actions.\n- Salary Target: $160,000 - $180,000.");
    setResume("NAME: Jordan Rivera\nEXPERIENCE: 6 Years in Cloud Engineering.\n\nSUMMARY: Currently a DevOps Lead. Built and scaled K8s clusters for high-frequency trading apps.\n\nSKILLS:\n- AWS, Terraform, Docker, Kubernetes.\n- Reduced deployment time by 65% via optimized CI/CD.\n- Saved $12k/month in cloud spend by right-sizing EKS instances.");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pdfToText(file)
      .then(text => {
        if (activeTab === 'jd') setJobDescription(text);
        else setResume(text);
      })
      .catch(() => alert("Error reading PDF."));
  };

  const handleAnalyze = () => {
    if (!jobDescription || !resume) return;
    setLoading(true);
    
    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        fitSummary: "Jordan is a high-probability match with deep EKS and Terraform expertise.",
        strengths: ["Direct Terraform alignment", "65% CI/CD optimization", "Strong cost-savings track record"],
        gaps: ["Lacks specific Go proficiency mentioned in JD preferences"],
        marketIntel: { avgPay: "$172,000", demand: "High", competition: "Moderate" },
        optimizedJD: "Focus on 'FinOps' and 'Scalability' to attract more candidates like Jordan."
      });
      setOutreachDraft(`Subject: Your DevOps lead experience\n\nHi Jordan,\n\nI noticed your 65% deployment optimization at your previous role. We're looking for that impact at Recruit-IQ. Are you open to a chat?`);
      setLoading(false);
    }, 1500);
  };

  const handleUpgrade = async (tier) => {
    setShowUpgradeModal(false);
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
      console.error("Stripe Redirect Error", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative">
      
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] max-w-4xl w-full p-8 relative shadow-2xl">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter">Choose Your Intelligence Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-500 mb-2">Standard</span>
                <div className="text-2xl font-black mb-4">Free</div>
                <ul className="text-xs space-y-3 text-slate-400 mb-8 flex-1">
                  <li>• Match Evaluation</li>
                  <li>• Match Score</li>
                </ul>
                <button onClick={() => {setSimTier('standard'); setShowUpgradeModal(false);}} className="w-full py-3 rounded-xl border border-slate-700 text-[10px] font-black uppercase">Current Plan</button>
              </div>
              <div className="p-6 rounded-3xl border-2 flex flex-col relative overflow-hidden bg-slate-950" style={{ borderColor: brand.primary }}>
                <span className="text-[10px] font-black uppercase text-blue-400 mb-2">Professional</span>
                <div className="text-2xl font-black mb-4">$49<span className="text-xs text-slate-500">/mo</span></div>
                <ul className="text-xs space-y-3 text-slate-400 mb-8 flex-1">
                  <li>• Analysis of Strengths/Gaps</li>
                  <li>• Personalized Outreach Emails</li>
                </ul>
                <button onClick={() => handleUpgrade('professional')} className="w-full py-3 rounded-xl text-[10px] font-black uppercase text-white shadow-lg" style={{ backgroundColor: brand.primary }}>Upgrade Now</button>
              </div>
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-[10px] font-black uppercase text-purple-400 mb-2">Executive</span>
                <div className="text-2xl font-black mb-4">$99<span className="text-xs text-slate-500">/mo</span></div>
                <ul className="text-xs space-y-3 text-slate-400 mb-8 flex-1">
                  <li>• Market Pay Intelligence</li>
                  <li>• AI JD Optimizer</li>
                </ul>
                <button onClick={() => handleUpgrade('executive')} className="w-full py-3 rounded-xl text-[10px] font-black uppercase text-white shadow-lg" style={{ backgroundColor: brand.accent }}>Go Executive</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 h-20 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <img 
            src="/CCAI.png" 
            alt="Recruit-IQ" 
            className="h-10 w-auto object-contain" 
            onError={(e) => { e.target.style.display='none'; }} 
          />
          <span className="text-2xl font-black text-white uppercase tracking-tighter">Recruit-IQ</span>
        </div>
        <button onClick={() => setShowUpgradeModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-transform hover:scale-105" style={{ background: `linear-gradient(to right, ${brand.primary}, ${brand.secondary})` }}>
          <Zap size={14} fill="currentColor" /> Upgrade Tier
        </button>
      </header>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800">
            <button onClick={() => setActiveTab('jd')} className="flex-1 py-5 text-xs font-black uppercase" style={{ color: activeTab === 'jd' ? brand.glow : brand.neutral, borderBottom: activeTab === 'jd' ? `3px solid ${brand.primary}` : 'none' }}>Job Description</button>
            <button onClick={() => setActiveTab('resume')} className="flex-1 py-5 text-xs font-black uppercase" style={{ color: activeTab === 'resume' ? brand.glow : brand.neutral, borderBottom: activeTab === 'resume' ? `3px solid ${brand.primary}` : 'none' }}>Resume</button>
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
            <button onClick={handleAnalyze} disabled={loading || !jobDescription || !resume} className="w-full py-5 rounded-3xl text-white font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 disabled:opacity-50" style={{ background: `linear-gradient(to right, ${brand.primary}, ${brand.secondary})` }}>
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles />} EXECUTE AI SYNERGY SCAN
            </button>
          </div>
        </section>

        <section className="space-y-6 overflow-y-auto pr-2">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center opacity-20">
              <BarChart3 size={60} />
              <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Neural Input</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-6xl font-black opacity-10" style={{ color: brand.glow }}>{analysis.matchScore}%</div>
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-400"><Zap size={14} /> Neural Match</h3>
                <p className="text-lg text-white font-light leading-relaxed">{analysis.fitSummary}</p>
              </div>

              {simTier !== 'standard' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/20">
                      <span className="text-emerald-400 text-[10px] font-black uppercase block mb-3">Key Strengths</span>
                      {analysis.strengths.map((s, i) => <div key={i} className="text-xs text-slate-400 mb-1">✓ {s}</div>)}
                    </div>
                    <div className="bg-rose-500/5 p-6 rounded-3xl border border-rose-500/20">
                      <span className="text-rose-400 text-[10px] font-black uppercase block mb-3">Critical Gaps</span>
                      {analysis.gaps.map((g, i) => <div key={i} className="text-xs text-slate-400 mb-1">! {g}</div>)}
                    </div>
                  </div>
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-blue-400"><Mail size={14} /> Outreach Draft</h3>
                    <div className="p-4 bg-slate-950 rounded-2xl text-xs text-slate-400 leading-relaxed">{outreachDraft}</div>
                  </div>
                </>
              )}

              {simTier === 'executive' && (
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800" style={{ borderLeft: `4px solid ${brand.accent}` }}>
                  <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-purple-400"><TrendingUp size={14} /> Executive Market Intel</h3>
                  <div className="flex justify-between">
                    <div><span className="text-[10px] text-slate-500 uppercase">Avg Pay</span><div className="text-xl font-black">{analysis.marketIntel.avgPay}</div></div>
                    <div className="text-right"><span className="text-[10px] text-slate-500 uppercase">Demand</span><div className="text-xl font-black text-emerald-400">{analysis.marketIntel.demand}</div></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
