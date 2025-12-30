import React, { useState, useRef } from 'react';
import { 
  Sparkles, Zap, Loader2, Mail, BarChart3, Briefcase, 
  FileText, Upload, CreditCard, Copy, RefreshCw, X, TrendingUp, Wand2, Shield, Info, LifeBuoy
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
        strengths: ["Direct Terraform alignment", "65% CI/CD optimization", "Strong FinOps record"],
        gaps: ["Lacks specific Go proficiency mentioned in preferences"],
        marketIntel: { avgPay: "$172,500", demand: "High", rangeMatch: "92%" },
        optimizedJD: "Based on Jordan's profile, consider adding 'High-Frequency Trading Experience' to attract similar top-tier talent."
      });
      setOutreachDraft(`Hi Jordan, I noticed your 65% deployment optimization at your previous role. We're looking for that impact at Recruit-IQ. Open to a chat?`);
      setLoading(false);
    }, 1500);
  };

  const handleUpgrade = async (tier) => {
    setShowUpgradeModal(false);
    setSimTier(tier); // For simulation; replace with Stripe redirect in production
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative">
      
      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] max-w-lg w-full p-10 relative text-center">
            <button onClick={() => setShowSupportModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
              <LifeBuoy size={32} />
            </div>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">Support Center</h2>
            <p className="text-slate-400 mb-8 text-sm">Need help with Recruit-IQ? Send your concerns to our team.</p>
            <a href="mailto:hello@corecreaqtivityai.com" className="block w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Email Support</a>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] max-w-4xl w-full p-8 relative shadow-2xl">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter">Choose Your Tier</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-500">Standard</span>
                <div className="text-2xl font-black my-4">Free</div>
                <ul className="text-xs space-y-2 text-slate-400 mb-6 flex-1"><li>• Match Score</li></ul>
                <button onClick={() => handleUpgrade('standard')} className="w-full py-2 rounded-xl border border-slate-700 text-[10px] font-black uppercase">Current Plan</button>
              </div>
              <div className="p-6 rounded-3xl border-2 bg-slate-950 flex flex-col" style={{ borderColor: brand.primary }}>
                <span className="text-[10px] font-black uppercase text-blue-400">Professional</span>
                <div className="text-2xl font-black my-4">$49/mo</div>
                <ul className="text-xs space-y-2 text-slate-400 mb-6 flex-1"><li>• Strengths/Gaps</li><li>• Outreach Emails</li></ul>
                <button onClick={() => handleUpgrade('professional')} className="w-full py-2 rounded-xl text-[10px] font-black uppercase text-white shadow-lg" style={{ backgroundColor: brand.primary }}>Upgrade</button>
              </div>
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-[10px] font-black uppercase text-purple-400">Executive</span>
                <div className="text-2xl font-black my-4">$99/mo</div>
                <ul className="text-xs space-y-2 text-slate-400 mb-6 flex-1"><li>• Market Pay Intel</li><li>• JD Optimizer</li></ul>
                <button onClick={() => handleUpgrade('executive')} className="w-full py-2 rounded-xl text-[10px] font-black uppercase text-white shadow-lg" style={{ backgroundColor: brand.accent }}>Go Executive</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 h-24 flex items-center justify-between px-10">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-black text-white uppercase tracking-tighter">Recruit-IQ</span>
          <div className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-black text-blue-400 uppercase border border-slate-700">{simTier}</div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setShowUpgradeModal(true)} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl flex items-center gap-2 transition-transform hover:scale-105" style={{ background: `linear-gradient(to right, ${brand.primary}, ${brand.secondary})` }}>
            <Zap size={14} fill="currentColor" /> Upgrade
          </button>
          <img src="/CCAI.png" alt="Recruit-IQ" className="h-14 w-auto object-contain" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Input Card */}
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800">
            <button onClick={() => setActiveTab('jd')} className="flex-1 py-5 text-xs font-black uppercase tracking-widest" style={{ color: activeTab === 'jd' ? brand.glow : brand.neutral, borderBottom: activeTab === 'jd' ? `3px solid ${brand.primary}` : 'none' }}>Job Description</button>
            <button onClick={() => setActiveTab('resume')} className="flex-1 py-5 text-xs font-black uppercase tracking-widest" style={{ color: activeTab === 'resume' ? brand.glow : brand.neutral, borderBottom: activeTab === 'resume' ? `3px solid ${brand.primary}` : 'none' }}>Resume</button>
          </div>
          <div className="flex justify-between p-3 bg-slate-950/20">
            <button onClick={loadSampleData} className="text-[10px] font-black flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"><RefreshCw size={12} /> LOAD IT SAMPLE</button>
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

        {/* Results Card */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center opacity-20">
              <BarChart3 size={60} />
              <p className="text-[10px] font-black uppercase tracking-widest mt-4">Awaiting Data Input</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-700">
              <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
                <div className="p-10 text-center border-b border-slate-800/50 bg-slate-950/30">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">Match Score</div>
                  <div className="text-8xl font-black tracking-tighter" style={{ color: brand.glow }}>{analysis.matchScore}%</div>
                </div>
                <div className="p-10">
                  <h3 className="text-[10px] font-black uppercase mb-4 tracking-widest opacity-50 flex items-center gap-2"><FileText size={14} /> Fit Summary</h3>
                  <p className="text-xl text-white font-light leading-relaxed">{analysis.fitSummary}</p>
                </div>
              </div>

              {simTier !== 'standard' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/20">
                    <span className="text-emerald-400 text-[10px] font-black uppercase block mb-2 tracking-widest">Strengths</span>
                    {analysis.strengths.map((s, i) => <div key={i} className="text-xs text-slate-400 mb-1 leading-relaxed">✓ {s}</div>)}
                  </div>
                  <div className="bg-rose-500/5 p-6 rounded-3xl border border-rose-500/20">
                    <span className="text-rose-400 text-[10px] font-black uppercase block mb-2 tracking-widest">Gaps</span>
                    {analysis.gaps.map((g, i) => <div key={i} className="text-xs text-slate-400 mb-1 leading-relaxed">! {g}</div>)}
                  </div>
                </div>
              )}

              {simTier !== 'standard' && (
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2"><Mail size={14} /> Outreach Draft</h3>
                    <button onClick={() => {navigator.clipboard.writeText(outreachDraft); alert('Email Copied!')}} className="text-slate-500 hover:text-white"><Copy size={14} /></button>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-2xl text-xs text-slate-400 font-mono leading-relaxed">{outreachDraft}</div>
                </div>
              )}

              {simTier === 'executive' && (
                <div className="space-y-6">
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl" style={{ borderLeft: `6px solid ${brand.accent}` }}>
                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-purple-400"><TrendingUp size={14} /> Local Market Intel</h3>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Avg Market Pay</div>
                        <div className="text-3xl font-black">{analysis.marketIntel.avgPay}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Offer Competitiveness</div>
                        <div className="text-2xl font-black text-emerald-400">{analysis.marketIntel.rangeMatch} Match</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-cyan-400"><Wand2 size={14} /> AI JD Optimizer</h3>
                    <div className="p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/20 text-xs text-slate-300 italic leading-relaxed">"{analysis.optimizedJD}"</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer Navigation */}
      <footer className="bg-slate-900 border-t border-slate-800 h-20 flex items-center justify-center gap-12">
        <a href="https://www.corecreativityai.com/blank" target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 transition-colors"><Shield size={12} /> Privacy Policy</a>
        <a href="https://www.corecreativityai.com/blank-2" target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 transition-colors"><Info size={12} /> Terms</a>
        <button onClick={() => setShowSupportModal(true)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 transition-colors"><LifeBuoy size={12} /> Support</button>
      </footer>
    </div>
  );
}
