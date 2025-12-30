import React, { useState, useRef } from 'react';
import { 
  Sparkles, Zap, Loader2, Mail, BarChart3, Briefcase, 
  FileText, Upload, CreditCard, Copy, RefreshCw, X, TrendingUp, Wand2, Shield, Info, LifeBuoy, Heart, Target, Download, Edit3
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
        cultureScore: 88,
        cultureFit: "High alignment. The candidate's focus on efficiency matches the fast-paced, ROI-driven tone of the JD.",
        rewriter: ["Add 'Managed multi-region EKS clusters' to Summary.", "Quantify Terraform experience: 'Managed 200+ resources via IaC'."],
        benchmarking: "Your JD requires 5 years exp; Industry avg (Google/AWS) for this level is 6.5 years. You are positioned competitively.",
        cheatSheet: [
          { q: "Explain your EKS scaling strategy.", listenFor: "Look for mention of Horizontal Pod Autoscaler and node-level scaling." }
        ],
        marketIntel: { avgPay: "$172,500", demand: "High", rangeMatch: "92%" },
        optimizedJD: "Based on Jordan's profile, consider adding 'High-Frequency Trading Experience' to attract similar top-tier talent."
      });
      setOutreachDraft(`Hi Jordan, I noticed your 65% deployment optimization at your previous role...`);
      setLoading(false);
    }, 1500);
  };

  const handleUpgrade = async (tier) => {
    setShowUpgradeModal(false);
    setSimTier(tier);
  };

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative">
      
      {/* Support Modal (Keep existing logic) */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] max-w-lg w-full p-10 relative text-center">
            <button onClick={() => setShowSupportModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tighter">Support</h2>
            <a href="mailto:hello@corecreaqtivityai.com" className="block w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Email Support</a>
          </div>
        </div>
      )}

      {/* Upgrade Modal (Keep existing tiers) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] max-w-4xl w-full p-8 relative shadow-2xl">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter">Upgrade Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Standard, Pro, Executive Tiers */}
                {['standard', 'professional', 'executive'].map((tier) => (
                    <div key={tier} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col">
                        <span className="text-[10px] font-black uppercase mb-2">{tier}</span>
                        <button onClick={() => handleUpgrade(tier)} className="w-full py-2 rounded-xl bg-blue-600 text-[10px] font-black uppercase text-white">Select</button>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 h-24 flex items-center justify-between px-10 print:hidden">
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

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 print:block">
        {/* Left Side: Inputs (Hidden on print) */}
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl print:hidden">
            <div className="flex bg-slate-950/50 border-b border-slate-800">
                <button onClick={() => setActiveTab('jd')} className="flex-1 py-5 text-xs font-black uppercase tracking-widest" style={{ color: activeTab === 'jd' ? brand.glow : brand.neutral, borderBottom: activeTab === 'jd' ? `3px solid ${brand.primary}` : 'none' }}>Job Description</button>
                <button onClick={() => setActiveTab('resume')} className="flex-1 py-5 text-xs font-black uppercase tracking-widest" style={{ color: activeTab === 'resume' ? brand.glow : brand.neutral, borderBottom: activeTab === 'resume' ? `3px solid ${brand.primary}` : 'none' }}>Resume</button>
            </div>
            <textarea className="flex-1 p-8 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" value={activeTab === 'jd' ? jobDescription : resume} onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} placeholder="Paste data here..." />
            <div className="p-8 bg-slate-950/50 border-t border-slate-800">
                <button onClick={handleAnalyze} className="w-full py-5 rounded-3xl text-white font-black uppercase tracking-widest shadow-2xl transition-all" style={{ background: `linear-gradient(to right, ${brand.primary}, ${brand.secondary})` }}>
                    <Sparkles size={20} className="inline mr-2" /> Execute Synergy Scan
                </button>
            </div>
        </section>

        {/* Right Side: Enhanced Results */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar print:space-y-10">
          {!analysis ? (
             <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center opacity-20"><BarChart3 size={60} /><p className="text-[10px] font-black uppercase tracking-widest mt-4">Awaiting Scan</p></div>
          ) : (
            <div className="space-y-6">
              {/* Score & Fit */}
              <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden print:border-none">
                <div className="p-10 text-center bg-slate-950/30">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">Neural Match Score</div>
                  <div className="text-8xl font-black tracking-tighter" style={{ color: brand.glow }}>{analysis.matchScore}%</div>
                </div>
                <div className="p-10">
                  <p className="text-xl text-white font-light leading-relaxed">{analysis.fitSummary}</p>
                </div>
              </div>

              {/* NEW: Culture Fit (Pro+) */}
              {simTier !== 'standard' && (
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl" style={{ borderLeft: `6px solid ${brand.accent}` }}>
                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-purple-400"><Heart size={14} /> Culture Synergy</h3>
                    <div className="flex items-center gap-4">
                        <div className="text-2xl font-black text-white">{analysis.cultureScore}%</div>
                        <p className="text-xs text-slate-400 italic">{analysis.cultureFit}</p>
                    </div>
                </div>
              )}

              {/* NEW: Resume Rewriter (Pro+) */}
              {simTier !== 'standard' && (
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 mb-4"><Edit3 size={14} /> AI Resume Optimization</h3>
                    <ul className="space-y-2">
                        {analysis.rewriter.map((r, i) => <li key={i} className="text-xs text-slate-400 flex gap-2"><span>+</span> {r}</li>)}
                    </ul>
                  </div>
              )}

              {/* NEW: Benchmarking & Cheat Sheet (Executive) */}
              {simTier === 'executive' && (
                <>
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2 mb-4"><Target size={14} /> Competitive Benchmarking</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">{analysis.benchmarking}</p>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 print:bg-white print:text-black">
                    <div className="flex justify-between items-center mb-6 print:hidden">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2"><Download size={14} /> Interview Cheat Sheet</h3>
                        <button onClick={handlePrint} className="text-[10px] font-black uppercase bg-blue-600 px-3 py-1 rounded-lg text-white">Export PDF</button>
                    </div>
                    {analysis.cheatSheet.map((item, i) => (
                        <div key={i} className="space-y-2">
                            <div className="text-sm font-bold text-white print:text-black">Q: {item.q}</div>
                            <div className="text-xs text-slate-400 italic print:text-slate-700">Listen For: {item.listenFor}</div>
                        </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer (Same as before) */}
      <footer className="bg-slate-900 border-t border-slate-800 h-20 flex items-center justify-center gap-12 print:hidden">
          <button onClick={() => setShowSupportModal(true)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">Support</button>
      </footer>
    </div>
  );
}
