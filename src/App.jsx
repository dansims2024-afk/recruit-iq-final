import React, { useState, useRef } from 'react';
import { 
  Sparkles, Zap, Loader2, Mail, BarChart3, Upload, Copy, RefreshCw, X, TrendingUp, Info, Lock, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import pdfToText from 'react-pdftotext';

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
    setJobDescription(`JOB TITLE: Senior Lead Cloud Architect\nLOCATION: New York, NY (Hybrid)\nSALARY: $195,000 - $225,000\n\nREQUIREMENTS:\n- 10+ years AWS infrastructure.\n- Terraform/IaC at enterprise scale.\n- Kubernetes (EKS) and Docker expert.\n- Deep understanding of Vector Databases for AI.`);
    setResume(`NAME: Jordan A. Rivera\nSUMMARY: 12 years of AWS architecture experience. Led infrastructure at FinStream Global, managing 500+ AWS resources via Terraform. Expert in Kubernetes and scaling AI-driven microservices. Currently specialized in Vector DB optimization.`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pdfToText(file)
      .then(text => activeTab === 'jd' ? setJobDescription(text) : setResume(text))
      .catch(() => alert("Error reading PDF."));
  };

  const generateEmail = () => {
    setOutreachDraft(`Subject: Strategic Cloud Architect Opportunity | Core Creativity AI\n\nHi Jordan,\n\nI was specifically impressed by your tenure at FinStream Global, particularly your management of 500+ AWS resources using Terraform. Given our current focus on scaling AI-driven microservices here at Core Creativity AI, your expertise in Vector DB optimization is exactly the "missing piece" we are looking for.\n\nYour background in EKS and enterprise-scale IaC aligns with our 2025 roadmap. I'd love to discuss how your 12 years of experience can shape our infrastructure. \n\nAre you open to a brief introductory call this Thursday?\n\nBest regards,\n\nRecruiting Lead\nCore Creativity AI`);
  };

  const handleAnalyze = () => {
    if (!jobDescription || !resume) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 96,
        fitSummary: "Jordan is an elite-level match. Their 12 years of AWS experience and specific history with EKS and Terraform at scale perfectly mirrors your requirements for a Lead Architect.",
        pros: [
          { title: "Senior Enterprise Tenure", desc: "12 years of direct cloud experience exceeds your 10-year requirement, indicating high technical maturity." },
          { title: "Scale Competency", desc: "Proven history managing 500+ AWS resources via IaC suggests they can handle your enterprise-level environment without a learning curve." },
          { title: "AI/Vector Specialization", desc: "Explicit experience with Vector DB optimization matches your specific need for AI-driven application support." }
        ],
        cons: [
          { title: "Tooling Gap", desc: "While an AWS expert, the resume lacks mention of secondary cloud providers (Azure/GCP) which may be needed for multi-cloud initiatives." },
          { title: "Certification Visibility", desc: "Does not explicitly list active AWS Solutions Architect Professional credentials, which may be required for certain compliance audits." }
        ],
        marketIntel: {
          area: "New York, NY",
          avgPay: "$161,081",
          localRange: "$142,200 - $211,100",
          topPercentile: "$219,477",
          status: "Hyper-Competitive"
        }
      });
      setLoading(false);
    }, 1500);
  };

  const LockedFeature = ({ tierRequired, title, description, children }) => {
    const isLocked = (tierRequired === 'professional' && simTier === 'standard') || 
                     (tierRequired === 'executive' && (simTier === 'standard' || simTier === 'professional'));
    return (
      <div className="relative overflow-hidden group">
        <div className={isLocked ? "blur-md pointer-events-none opacity-40 select-none" : ""}>{children}</div>
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-900/40 backdrop-blur-sm rounded-[2rem] border border-white/5">
            <Lock size={20} className="text-amber-500 mb-3" />
            <h4 className="text-sm font-black text-white uppercase mb-1">{title}</h4>
            <p className="text-[10px] text-slate-300 max-w-[200px] mb-4">{description}</p>
            <button onClick={() => setShowUpgradeModal(true)} className="px-4 py-1.5 bg-blue-600 rounded-lg text-[10px] font-black uppercase text-white">Upgrade</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative">
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 h-24 flex items-center justify-between px-10 print:hidden">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-white uppercase tracking-tighter">Recruit-IQ</span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">{simTier} intelligence</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm font-black text-white uppercase tracking-widest leading-none">Recruit-IQ</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">by Core Creativity AI</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Left Side: Inputs */}
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800">
            <button onClick={() => setActiveTab('jd')} className="flex-1 py-5 text-xs font-black uppercase tracking-widest" style={{ color: activeTab === 'jd' ? brand.glow : brand.neutral, borderBottom: activeTab === 'jd' ? `3px solid ${brand.primary}` : 'none' }}>Job Description</button>
            <button onClick={() => setActiveTab('resume')} className="flex-1 py-5 text-xs font-black uppercase tracking-widest" style={{ color: activeTab === 'resume' ? brand.glow : brand.neutral, borderBottom: activeTab === 'resume' ? `3px solid ${brand.primary}` : 'none' }}>Resume</button>
          </div>
          <div className="flex justify-between p-3 bg-slate-950/20">
            <button onClick={loadSampleData} className="text-[10px] font-black flex items-center gap-2 px-6 py-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-all"><RefreshCw size={12} /> SAMPLE</button>
            <button onClick={() => fileInputRef.current.click()} className="text-[10px] font-black flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-700 text-slate-500 hover:text-white"><Upload size={12} /> UPLOAD PDF</button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />
          </div>
          <textarea className="flex-1 p-8 bg-transparent text-slate-300 outline-none resize-none text-sm font-mono" value={activeTab === 'jd' ? jobDescription : resume} onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} placeholder="Paste data here..." />
          <div className="p-8 bg-slate-950/50 border-t border-slate-800">
            <button onClick={handleAnalyze} disabled={loading || !jobDescription || !resume} className="w-full py-5 rounded-3xl text-white font-black uppercase tracking-widest shadow-2xl transition-all hover:brightness-110 disabled:opacity-50" style={{ background: `linear-gradient(to right, ${brand.primary}, ${brand.secondary})` }}>
              {loading ? <Loader2 className="animate-spin mx-auto" /> : <Sparkles className="inline mr-2" />} {loading ? "Analyzing..." : "Execute Synergy Scan"}
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
            <div className="space-y-6 animate-in fade-in duration-700">
              <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
                <div className="p-10 text-center border-b border-slate-800/50 bg-slate-950/30">
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2">Match Score</div>
                  <div className="text-8xl font-black tracking-tighter" style={{ color: brand.glow }}>{analysis.matchScore}%</div>
                </div>
                <div className="p-8 text-center italic text-slate-400 text-sm leading-relaxed">"{analysis.fitSummary}"</div>
              </div>

              {/* Detailed Pros & Cons */}
              <div className="space-y-4">
                <div className="bg-emerald-500/5 p-8 rounded-[2.5rem] border border-emerald-500/20">
                  <span className="text-emerald-400 text-[10px] font-black uppercase block mb-6 tracking-widest flex items-center gap-2"><CheckCircle2 size={14} /> Key Strengths (Deep Analysis)</span>
                  <div className="space-y-4">
                    {analysis.pros.map((p, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="h-2 w-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <div className="text-xs font-black text-emerald-100 uppercase mb-1">{p.title}</div>
                          <div className="text-[11px] text-slate-400 leading-normal">{p.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-rose-500/5 p-8 rounded-[2.5rem] border border-rose-500/20">
                  <span className="text-rose-400 text-[10px] font-black uppercase block mb-6 tracking-widest flex items-center gap-2"><AlertCircle size={14} /> Potential Gaps</span>
                  <div className="space-y-4">
                    {analysis.cons.map((c, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="h-2 w-2 mt-1.5 rounded-full bg-rose-500 shrink-0" />
                        <div>
                          <div className="text-xs font-black text-rose-100 uppercase mb-1">{c.title}</div>
                          <div className="text-[11px] text-slate-400 leading-normal">{c.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Market Intelligence */}
              <LockedFeature tierRequired="executive" title="Market Intelligence" description="Localized 2025 NYC salary data and competitive indexing.">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
                  <h3 className="text-[10px] font-black uppercase text-purple-400 mb-6 flex items-center gap-2"><TrendingUp size={14} /> Market Intelligence ({analysis.marketIntel.area})</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase mb-1 font-bold">Local Average</div>
                      <div className="text-2xl font-black text-white">{analysis.marketIntel.avgPay}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase mb-1 font-bold">Market Status</div>
                      <div className="text-xs font-black text-emerald-400 uppercase tracking-widest">{analysis.marketIntel.status}</div>
                    </div>
                    <div className="col-span-2 pt-4 border-t border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase mb-2 font-bold">Competitive Salary Range</div>
                      <div className="flex justify-between items-center text-sm font-mono">
                        <span className="text-slate-400">{analysis.marketIntel.localRange.split(' - ')[0]}</span>
                        <div className="h-1.5 flex-1 mx-4 bg-slate-800 rounded-full relative">
                          <div className="absolute left-1/4 right-1/4 h-full bg-purple-500/50 rounded-full" />
                        </div>
                        <span className="text-slate-400">{analysis.marketIntel.localRange.split(' - ')[1]}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 mt-3 text-center italic">Top 10% in NYC: {analysis.marketIntel.topPercentile}+</div>
                    </div>
                  </div>
                </div>
              </LockedFeature>

              {/* AI Email Generator */}
              <LockedFeature tierRequired="professional" title="AI Outreach" description="Automated personalized outreach for high-match candidates.">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-2"><Mail size={14} /> AI Outreach Draft</h3>
                    {!outreachDraft ? (
                      <button onClick={generateEmail} className="text-[10px] font-black px-4 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors uppercase">Generate Email</button>
                    ) : (
                      <button onClick={() => {navigator.clipboard.writeText(outreachDraft); alert('Copied!');}} className="text-slate-500 hover:text-white transition-colors"><Copy size={16} /></button>
                    )}
                  </div>
                  {outreachDraft ? (
                    <div className="p-6 bg-slate-950 rounded-2xl text-[11px] text-slate-400 font-mono leading-relaxed whitespace-pre-line border border-slate-800 animate-in slide-in-from-top-2 duration-300">
                      {outreachDraft}
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-[10px] text-slate-600 uppercase font-black tracking-widest">Click generate to build email</div>
                  )}
                </div>
              </LockedFeature>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 h-24 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-12 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <button onClick={() => setShowSupportModal(true)} className="hover:text-white uppercase">Support</button>
        </div>
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">© 2025 Core Creativity AI</div>
      </footer>
    </div>
  );
}
