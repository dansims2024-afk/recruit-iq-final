import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Zap, Loader2, Mail, BarChart3, Briefcase, 
  FileText, Upload, CreditCard, Copy, RefreshCw, X, TrendingUp, Wand2
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [outreachDraft, setOutreachDraft] = useState('');
  const fileInputRef = useRef(null);

  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');

  // Sample IT Candidate Data
  const loadSampleData = () => {
    setJobDescription("POSITION: Senior DevOps Engineer\nLOCATION: Remote / New York\n\nREQUIRED SKILLS:\n- 5+ years managing AWS infrastructure (EKS, S3, CloudWatch).\n- Expert in Terraform and Infrastructure as Code.\n- Strong CI/CD background with GitHub Actions or GitLab.\n- Proficiency in Python or Go for automation scripting.\n- Salary Target: $160,000 - $180,000.");
    setResume("NAME: Jordan Rivera\nEXPERIENCE: 6 Years in Cloud Engineering.\n\nSUMMARY: Currently a DevOps Lead at FinStream. Built and scaled K8s clusters for high-frequency trading apps.\n\nSKILLS:\n- AWS (Certified Architect), Terraform, Docker, Kubernetes.\n- Python (Automation scripts), Bash.\n- Reduced deployment time by 65% via optimized CI/CD.\n- Saved $12k/month in cloud spend by right-sizing EKS instances.");
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
        fitSummary: "Jordan is a high-probability match. Their specific experience with EKS and cost-savings at FinStream aligns perfectly with the JD's requirement for AWS expertise and infrastructure management.",
        strengths: ["Direct Terraform/AWS alignment", "Proven 65% CI/CD optimization", "Strong EKS scaling experience"],
        gaps: ["No explicit mention of GitLab (though GitHub Actions is present)", "Go proficiency not detailed"],
        marketIntel: { avgPay: "$172,000", demand: "High", competition: "Moderate" },
        optimizedJD: "We have enhanced your JD to emphasize Kubernetes scaling and FinOps, which aligns with the top 5% of candidate profiles in the current DevOps market."
      });
      setOutreachDraft(`Subject: Your DevOps lead experience at FinStream\n\nHi Jordan,\n\nI noticed your work scaling K8s clusters at FinStream. We're looking for a Senior DevOps Engineer who can drive similar efficiency in our AWS environment. Your 65% deployment optimization is exactly the impact we need. Are you open to a chat?`);
      setLoading(false);
    }, 1500);
  };

  const handleUpgrade = async (tier) => {
    setShowUpgradeModal(false);
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
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans relative">
      
      {/* 2. Upgrade Pop-up Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] max-w-4xl w-full p-8 relative shadow-2xl">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter">Choose Your Intelligence Level</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Standard */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-500 mb-2">Standard</span>
                <div className="text-2xl font-black mb-4">Free</div>
                <ul className="text-xs space-y-3 text-slate-400 mb-8 flex-1">
                  <li>• Match Evaluation</li>
                  <li>• Match Score</li>
                </ul>
                <button onClick={() => {setSimTier('standard'); setShowUpgradeModal(false);}} className="w-full py-3 rounded-xl border border-slate-700 text-[10px] font-black uppercase hover:bg-slate-800 transition-colors">Current Plan</button>
              </div>

              {/* Professional */}
              <div className="p-6 rounded-3xl border-2 flex flex-col relative overflow-hidden" style={{ borderColor: brand.primary }}>
                <div className="absolute top-0 right-0 bg-blue-500 text-[8px] font-black px-3 py-1 uppercase text-white">Popular</div>
                <span className="text-[10px] font-black uppercase text-blue-400 mb-2">Professional</span>
                <div className="text-2xl font-black mb-4">$49<span className="text-xs text-slate-500">/mo</span></div>
                <ul className="text-xs space-y-3 text-slate-400 mb-8 flex-1">
                  <li className="text-white">• Everything in Standard</li>
                  <li className="text-white">• Analysis of Strengths/Gaps</li>
                  <li className="text-white">• Personalized Outreach Emails</li>
                </ul>
                <button onClick={() => handleUpgrade('professional')} className="w-full py-3 rounded-xl text-[10px] font-black uppercase text-white shadow-lg" style={{ backgroundColor: brand.primary }}>Upgrade Now</button>
              </div>

              {/* Executive */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col">
                <span className="text-[10px] font-black uppercase text-purple-400 mb-2">Executive</span>
                <div className="text-2xl font-black mb-4">$99<span className="text-xs text-slate-500">/mo</span></div>
                <ul className="text-xs space-y-3 text-slate-400 mb-8 flex-1">
                  <li className="text-white">• Everything in Professional</li>
                  <li className="text-white">• Market Pay Intelligence</li>
                  <li className="text-white">• AI JD Optimizer</li>
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
          <img src="/CCAI.png" alt="Recruit-IQ" className="h-10 w-auto" />
          <span className="text-2xl font-black text-white uppercase tracking-tighter">Recruit-IQ</span>
        </div>
        <button onClick={() => setShowUpgradeModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-transform hover:scale-105" style={{ background: `linear-gradient(to right, ${brand.primary}, ${brand.secondary})` }}>
          <Zap size={14} fill="currentColor" /> Upgrade Tier
        </button>
      </header>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2
