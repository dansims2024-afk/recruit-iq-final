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

const stripePromise = loadStripe('pk_test_your_key_here');

// BRAND KIT COLORS
const colors = {
  primary: '#2B81B9',
  secondary: '#52438E',
  accent1: '#8C50A1',
  textLight: '#b2acce',
  glow: '#00c9ff'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('jd');
  const [jobDescription, setJobDescription] = useState(`JOB TITLE: Senior Cloud Architect
COMPANY: InnoTech Solutions

Requirements:
- 8+ years experience in Cloud Architecture (AWS/Azure).
- Expert proficiency in React.js and Node.js microservices.
- Experience with Kubernetes, Docker, and Terraform.
- Strong focus on 99.99% uptime and high scalability.
- Deep knowledge of Golang for high-performance backend systems.`);

  const [resume, setResume] = useState(`NAME: Alex Sterling
SUMMARY: Cloud Solutions Expert with 10 years of experience.

TECHNICAL SKILLS:
- AWS (EC2, S3, Lambda, RDS), GCP.
- Frontend: React, Tailwind, Next.js.
- DevOps: Docker, CI/CD Pipelines, Jenkins.
- Languages: JavaScript, Python, Java. (Learning Golang).

EXPERIENCE:
- Lead Architect at TechGlobal Corp. Reduced latency by 40% using AWS Lambda.
- Built scalable React dashboards used by 50k+ daily active users.`);

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simTier, setSimTier] = useState('standard');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pdfToText(file)
      .then(text => activeTab === 'jd' ? setJobDescription(text) : setResume(text))
      .catch(() => alert("Error reading PDF. Please try pasting text directly."));
  };

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 82,
        fitSummary: "Strong technical match, particularly in AWS and React. Major gap identified in Golang requirements.",
        strengths: ["10+ Years Cloud Experience", "Expert React knowledge", "Proven Scalability track record"],
        gaps: ["No professional Golang experience", "Lacks Terraform specific projects"],
        interviewQuestions: [
          "How would you migrate a legacy Node.js service to Golang to improve performance?",
          "Describe your experience managing state in large-scale React applications."
        ]
      });
      setLoading(false);
    }, 1500);
  };

  const handleUpgrade = async (tier) => {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier })
    });
    const session = await response.json();
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: session.id });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 h-20 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          {/* Custom Swirl Logo */}
          <div className="relative flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 100 100" className="animate-[spin_8s_linear_infinite]">
              <defs>
                <linearGradient id="swirlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={colors.glow} />
                  <stop offset="50%" stopColor={colors.primary} />
                  <stop offset="100%" stopColor={colors.accent1} />
                </linearGradient>
              </defs>
              <path 
                d="M50 10 C 20 10, 10 40, 10 50 C 10 70, 40 90, 50 90 C 80 90, 90 60, 90 50 C 90 30, 60 10, 50 10 Z" 
                fill="none" 
                stroke="url(#swirlGrad)" 
                strokeWidth="8" 
                strokeDasharray="150" 
                className="opacity-80"
              />
              <circle cx="50" cy="50" r="10" fill={colors.glow} className="animate-pulse" />
            </svg>
            <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full"></div>
          </div>
          <span className="text-2xl font-black text-white uppercase tracking-tighter">Recruit-IQ</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-800 rounded-xl p-1 shadow-inner border border-slate-700">
            {['standard', 'professional', 'executive'].map(t => (
              <button 
                key={t} 
                onClick={() => setSimTier(t)} 
                className={`px-4 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all ${
                  simTier === t ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
                style={{ backgroundColor: simTier === t ? colors.secondary : 'transparent' }}
              >
                {t}
              </button>
            ))}
          </div>
          {simTier !== 'standard' && (
            <button 
              onClick={() => handleUpgrade(simTier)}
              className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-2 transition-transform hover:scale-105"
              style={{ backgroundColor: colors.primary }}
            >
              <CreditCard size={14} /> Upgrade to {simTier}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Input Section */}
        <section className="bg-slate-900 rounded-[2.5rem] border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl relative">
          <div className="flex bg-slate-950/80 border-b border-slate-800">
            <button 
              onClick={() => setActiveTab('jd')} 
              className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'jd' ? 'bg-slate-900' : 'opacity-40'}`}
              style={{ color: activeTab === 'jd' ? colors.glow : colors.textLight, borderBottom: activeTab === 'jd' ? `3px solid ${colors.primary}` : 'none' }}
            >
              <Briefcase size={16} className="inline mr-2" /> Job Description
            </button>
            <button 
              onClick={() => setActiveTab('resume')} 
              className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'resume' ? 'bg-slate-900' : 'opacity-40'}`}
              style={{ color: activeTab === 'resume' ? colors.glow : colors.textLight, borderBottom: activeTab === 'resume' ? `3px solid ${colors.primary}` : 'none' }}
            >
              <FileText size={16} className="inline mr-2" /> Candidate Resume
            </button>
          </div>

          <div className="flex justify-end p-3 bg-slate-900">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf" />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="text-[10px] font-bold flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 hover:border-slate-500 transition-colors"
              style={{ color: colors.textLight }}
            >
              <Upload size={14} /> Import Document (PDF)
            </button>
          </div>

          <textarea 
            className="flex-1 p-8 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed font-mono" 
            value={activeTab === 'jd' ? jobDescription : resume} 
            onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)} 
          />

          <div className="p-8 bg-slate-950/50 border-t border-slate-800">
            <button 
              onClick={handleAnalyze} 
              disabled={loading}
              className="w-full py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
              style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
              {loading ? 'Synthesizing...' : 'Execute Synergy Scan'}
            </button>
          </div>
        </section>

        {/* Results Section */}
        <section className="space-y-8">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center space-y-6 opacity-30">
              <BarChart3 size={80} style={{ color: colors.primary }} />
              <p className="uppercase tracking-[0.3em] text-[10px] font-bold" style={{ color: colors.textLight }}>Awaiting Neural Input</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-1000">
              <div
