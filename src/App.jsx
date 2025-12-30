import React, { useState, useRef } from 'react';
import { 
  Sparkles, Zap, Loader2, Mail, BarChart3, Briefcase, 
  FileText, Upload, CreditCard, Copy, Send, RefreshCw
} from 'lucide-react';
import pdfToText from 'react-pdftotext';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_your_key_here');

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
  const [analysis, setAnalysis] = useState(null);
  const [outreachDraft, setOutreachDraft] = useState('');
  const fileInputRef = useRef(null);

  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');

  const loadSampleData = () => {
    setJobDescription("JOB TITLE: Senior Cloud Solutions Architect\nCOMPANY: InnoTech Solutions\n\nRequirements:\n- 8+ years experience in AWS Cloud Infrastructure.\n- Expert in React and Node.js.\n- Focus on 99.99% uptime and high scalability.\n- Experience with Docker and Terraform.");
    setResume("NAME: Alex Sterling\nSUMMARY: Cloud Architect with 10 years experience.\n\nSKILLS:\n- AWS (S3, Lambda, EC2), React, Next.js, Docker.\n- Reduced cloud latency by 40% at TechGlobal.\n- Managed a budget of $500k/year in cloud spend.");
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
      const result = {
        matchScore: 88,
        fitSummary: "Alex is an exceptional candidate with a direct match in AWS architecture and React performance optimization.",
        strengths: ["40% latency reduction track record", "10+ years tenure", "Direct AWS stack match"],
        gaps: ["No mention of Terraform in resume", "Lacks specific uptime percentages"],
        quantQuestions: [
          "You mentioned a 40% latency reduction; what was the baseline ms before the fix?",
          "How many concurrent microservices were you managing in your 99.99% environment?",
          "What was the specific ROI on the $500k cloud spend you managed?",
          "What was the largest cluster size (nodes/pods) you managed in Docker?",
          "What percentage of your infrastructure was automated via CI/CD vs manual?"
        ]
      };
      setAnalysis(result);
      setOutreachDraft(`Subject: Interview Invitation: Senior Cloud Architect role at InnoTech\n\nHi Alex,\n\nI was impressed by your work at TechGlobal, specifically the 40% reduction in cloud latency. We are looking for that level of impact at InnoTech. I'd love to discuss our Senior Cloud Architect role with you.\n\nBest regards,\nRecruit-IQ Team`);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 h-20 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <img src="/CCAI.png" alt="Logo" className="h-12 w-auto object-contain" onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=IQ'; }} />
          <span className="text-2xl font-black text-white uppercase tracking-tighter">Recruit-IQ</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
            {['standard', 'professional', 'executive'].map(t => (
              <button key={t} onClick={() => setSimTier(t)} className="px-4 py-1.5 rounded-lg text-[10px] uppercase font-bold" style={{ backgroundColor: simTier === t ? brand.secondary : 'transparent', color: simTier === t ? 'white' : '#64748b' }}>{t}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-slate-900 rounded-[2rem] border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800">
            <button onClick={() => setActiveTab('jd')} className="flex-1 py-4 text-xs font-black uppercase tracking-widest" style={{ color: activeTab === 'jd' ? brand.glow : brand.neutral, borderBottom: activeTab === 'jd' ? `3px solid ${brand.primary}` : 'none' }}>Job Description</button>
            <button onClick={() => setActiveTab('resume')} className="flex-1 py-4 text-xs font-black uppercase tracking-widest" style={{ color: activeTab === 'resume' ? brand.glow : brand.neutral, borderBottom: activeTab === 'resume' ? `3px solid ${brand.primary}` : 'none' }}>Resume</button>
          </div>

          <div className="flex justify-between p-3 bg-slate-950/20">
            <button onClick={loadSampleData} className="text-[10px] font-bold flex items-center gap-2 px-3 py-1 text-slate-400 hover:text-white"><RefreshCw size={12} /> LOAD SAMPLE DATA</button>
            <div className="flex gap-4">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />
              <button onClick={() => fileInputRef.current.click()} className="text-[10px] font-bold flex items-center gap-2 px-3 py-1 text-slate-500 hover:text-white"><Upload size={12} /> UPLOAD PDF</button>
            </div>
          </div>

          <textarea className="flex-1 p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" value={activeTab === 'jd' ? jobDescription : resume} onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} placeholder="Paste data or click 'Load Sample'..." />

          <div className="p-6 bg-slate-950/50 border-t border-slate-800">
            <button onClick={handleAnalyze} disabled={loading} className="w-full py-4 rounded-2xl text-white font-black uppercase flex items-center justify-center gap-2 shadow-lg disabled:opacity-50" style={{ background: `linear-gradient(to right, ${brand.primary}, ${brand.secondary})` }}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} Run Synergy Scan
            </button>
          </div>
        </section>

        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-700 uppercase text-[10px] tracking-[0.3em] space-y-4">
              <BarChart3 size={48} className="opacity-10" /> <p>Awaiting Neural Input</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-700">
              {/* Score Card */}
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl font-black" style={{ color: brand.glow }}>{analysis.matchScore}%</div>
                <h3 className="text-[10px] font-black uppercase mb-4 tracking-widest flex items-center gap-2" style={{ color: brand.glow }}><Zap size={14} /> Analysis Result</h3>
                <p className="text-xl text-white font-medium mb-6">{analysis.fitSummary}</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-slate-400">
                    <span className="text-emerald-400 font-bold block mb-2 uppercase tracking-tighter">Strengths</span>
                    {analysis.strengths.map((s, i) => <div key={i}>✓ {s}</div>)}
                  </div>
                  <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-slate-400">
                    <span className="text-rose-400 font-bold block mb-2 uppercase tracking-tighter">Gaps</span>
                    {analysis.gaps.map((g, i) => <div key={i}>! {g}</div>)}
                  </div>
                </div>
              </div>

              {/* Quantifiable Questions */}
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
                <h3 className="text-[10px] font-black uppercase mb-4 tracking-widest flex items-center gap-2" style={{ color: brand.accent }}><BarChart3 size={14} /> Quantifiable Interview Questions</h3>
                <div className="space-y-3">
                  {analysis.quantQuestions.map((q, i) => (
                    <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-400 border-l-4" style={{ borderLeftColor: brand.accent }}>{q}</div>
                  ))}
                </div>
              </div>

              {/* Outreach Email */}
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: brand.primary }}><Mail size={14} /> Candidate Outreach</h3>
                  <button onClick={() => { navigator.clipboard.writeText(outreachDraft); alert('Copied!'); }} className="text-slate-500 hover:text-white"><Copy size={16} /></button>
                </div>
                <textarea className="w-full h-48 bg-slate-950 p-4 rounded-xl text-xs text-slate-400 border border-slate-800 outline-none" value={outreachDraft} onChange={(e) => setOutreachDraft(e.target.value)} />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
