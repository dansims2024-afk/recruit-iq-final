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
      .then(text => activeTab === 'jd' ? setJobDescription(text) : setResume(text))
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
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-[2.5rem] max-w-4xl w-full p-8 relative shadow-2xl">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter">Choose Your Intelligence Level</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-500">Standard</span>
                <div className="text-2xl font-black my-4">Free</div>
                <ul className="text-xs space-y-2 text-slate-400 mb-6"><li>• Match Score</li><li>• Basic Evaluation</li></ul>
                <button onClick={() => {setSimTier('standard'); setShowUpgradeModal(false);}} className="w-full py-2 rounded-xl border border
