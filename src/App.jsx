import React, { useState, useRef } from 'react';
import { 
  Upload, CheckCircle, FileText, BrainCircuit, Target, Lock, 
  Search, BookOpen, X, ShieldCheck, Layers, Printer, 
  Zap, ListChecks, Loader2, Sparkles, HelpCircle, TrendingUp, AlertCircle,
  LogIn, User, ArrowRight, LayoutGrid, CreditCard, History, Database, EyeOff, Server, LayoutList
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";

// --- BACKEND SIMULATION UTILITIES ---

// 1. PII Redaction Service (Privacy Shield)
const scrubPII = (text) => {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
  return text.replace(emailRegex, "[EMAIL REDACTED]").replace(phoneRegex, "[PHONE REDACTED]");
};

// 2. Token Usage Guardian (Cost Control)
const checkTokenSafety = (textLength, fileCount) => {
  const ESTIMATED_TOKENS = (textLength / 4) + (fileCount * 500);
  const MAX_LIMIT = 8000; 
  return { safe: ESTIMATED_TOKENS < MAX_LIMIT, usage: ESTIMATED_TOKENS };
};

// 3. Mock Database for Batch Leaderboard
const generateLeaderboardData = () => [
  { rank: 1, name: "Alex R. Candidate", score: 88, status: "Interview Ready", match: "High" },
  { rank: 2, name: "Sarah Jenkins", score: 82, status: "Review", match: "High" },
  { rank: 3, name: "Mike Chen", score: 76, status: "Potential", match: "Medium" },
  { rank: 4, name: "David Miller", score: 65, status: "Rejected", match: "Low" },
  { rank: 5, name: "Emily Davis", score: 45, status: "Rejected", match: "Low" },
];

const RecruitIQApp = () => {
  // --- APP STATE ---
  const [textData, setTextData] = useState({ jd: "", resume: "" });
  const [activeTab, setActiveTab] = useState(1);
  const [inputCategory, setInputCategory] = useState('single'); // 'single' or 'batch'
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [cache, setCache] = useState({}); 
  const { user } = useUser(); // Get logged-in user details

  // --- BRAND LOGO ---
  const SwirlLogo = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <defs>
        <linearGradient id="swirlGrad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path d="M20 4C11.1 4 4 11.1 4 20C4 28.8 11.1 36 20 36" stroke="url(#swirlGrad)" strokeWidth="6" strokeLinecap="round" />
      <path d="M36 20C36 11.1 28.8 4 20 4" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      <path d="M20 36C28.8 36 36 28.8 36 20" stroke="#a855f7" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
    </svg>
  );

  // --- LOGIC HANDLERS ---
  const useSample = () => {
    setTextData({
      jd: `SENIOR PRODUCT MANAGER - AI PLATFORM\n\nKey Requirements:\n- 8+ years experience in technical PM roles.\n- Direct experience with LLM orchestration and MLOps.\n- Proficiency in SQL, Python, and Data Visualization.\n- Experience in Series B+ high-growth environments.`,
      resume: `ALEX R. CANDIDATE\n\nProfessional Summary:\nTechnical Product Leader with 6.5 years experience.\n\nKey Achievements:\n- Led OpenAI bot transition at TechFlow, reducing latency by 40%.\n- Managed SQL enterprise analytics dashboards at DataSync.\n- Technical Skills: Python, AWS, S3, LLM Fine-tuning.`
    });
  };

  const handleScreenCandidate = () => {
    // 1. Guardian Check
    const safetyCheck = checkTokenSafety(textData.jd.length + textData.resume.length, inputCategory === 'batch' ? 5 : 1);
    if (!safetyCheck.safe) {
      alert("Input too large! Reduce batch size to prevent server timeout.");
      return;
    }

    // 2. Cache Check
    const cacheKey = inputCategory + textData.jd.length;
    if (cache[cacheKey]) {
      console.log("Serving from Smart Cache (Zero Cost)");
      setShowResultsModal(true);
      return;
    }

    setIsProcessing(true);
    
    // 3. Simulate Backend Steps
    const sequence = [
      { msg: "Scrubbing PII (Privacy Shield)...", delay: 800 },
      { msg: "Tokenizing & Chunking Data...", delay: 1500 },
      { msg: inputCategory === 'batch' ? "Ranking 5 Candidates..." : "Calculating Synergy Score...", delay: 2500 }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex >= sequence.length) {
        clearInterval(interval);
        setIsProcessing(false);
        setShowResultsModal(true);
        setCache(prev => ({...prev, [cacheKey]: true})); 
      } else {
        if (stepIndex === 0) {
           const cleanJD = scrubPII(textData.jd);
           console.log("Redacted PII for Privacy:", cleanJD.substring(0, 50) + "...");
        }
        setProcessingStep(sequence[stepIndex].msg);
        stepIndex++;
      }
    }, 1000);
  };

  const isReady = textData.jd.length > 50 && (inputCategory === 'batch' || textData.resume.length > 50);

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 font-sans relative overflow-x-hidden">
      
      {/* =====================================================================================
          STATE 1: SIGNED OUT (Landing Page)
          - This is visible to everyone.
          - Because you set "Restricted Mode", only YOU can log in here.
      ===================================================================================== */}
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-
