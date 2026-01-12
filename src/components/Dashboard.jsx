import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser } from "@clerk/clerk-react";
// Note: Ensure jspdf is loaded in index.html via CDN
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

import logo from '../logo.png';

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

ABOUT THE COMPANY:
Vertex Financial Systems is a global leader in high-frequency trading technology. We are seeking a visionary Architect to lead the evolution of our next-generation platform.

KEY RESPONSIBILITIES:
- Design and implement high-availability microservices using AWS EKS and Fargate to ensure 99.999% uptime.
- Lead the migration from legacy monolithic structures to a modern, event-driven architecture using Kafka and gRPC.
- Optimize C++ and Go-based trading engines for sub-millisecond latency.
- Establish CI/CD best practices and mentor a global team of 15+ senior engineers.

REQUIREMENTS:
- 12+ years of software engineering experience in FinTech or Capital Markets.
- Deep expertise in AWS Cloud Architecture (AWS Certified Solutions Architect preferred).
- Proven track record with Kubernetes, Docker, Kafka, Redis, and Terraform.
- Strong proficiency in Go (Golang), C++, Python, and TypeScript.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers.

PROFESSIONAL EXPERIENCE:
Global Quant Solutions | Principal Architect | New York, NY | 2018 - Present
- Architected a serverless data processing pipeline handling 5TB of daily market data using AWS Lambda.
- Reduced infrastructure costs by 35% through aggressive AWS Graviton migration.

InnovaTrade | Senior Staff Engineer | Chicago, IL | 2014 - 2018
- Built the core execution engine in Go, achieving a 50% reduction in order latency.
- Implemented automated failover protocols that prevented over $10M in potential slippage.

TECHNICAL SKILLS:
- Languages: Go, C++, Python, TypeScript, Java.
- Cloud: AWS (EKS, Lambda, Aurora, SQS), Terraform, Docker, Kubernetes.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const isPro = user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        activeTab === 'jd' ? setJdText(result.value) : setResumeText(result.value);
      } else if (file.name.endsWith('.pdf')) {
        alert("PDF Parsing Limit: Please copy and paste the text from your PDF directly into the text box for the best accuracy.");
      } else {
        const text = await file.text();
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      }
    } catch (err) { alert("Error reading file. Please try copying and pasting the text."); }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF();
    
    // --- HEADER ---
    doc.setFillColor(79, 70, 229); // Indigo Brand Color
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Recruit-IQ Intelligence Report", 20, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Candidate Match Analysis & Interview Guide`, 20, 30);

    // --- CANDIDATE INFO & SCORE ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const cName = analysis.candidate_name || "Candidate Report";
    doc.text(`${cName}`, 20, 55);
    doc.setTextColor(79, 70, 229);
    doc.text(`Match Score: ${analysis.score}%`, 140, 55);
    
    // --- SUMMARY ---
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysis.summary, 170);
    doc.text(summaryLines, 20, 70);
    let currentY = 70 + (summaryLines.length * 6) + 15;

    // --- STRENGTHS ---
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); // Emerald Green
    doc.text("Key Strengths", 20, currentY);
    currentY += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    analysis.strengths.forEach((s) => {
      if (currentY > 280) { doc.addPage(); currentY = 20; }
      const sLines = doc.splitTextToSize(`• ${s}`, 170);
      doc.text(sLines, 20, currentY);
      currentY += (sLines.length * 6) + 2;
    });
    currentY += 10;

    // --- GAPS ---
    doc.setFont("helvetica", "bold");
    doc.setTextColor(244, 63, 94); // Rose Red
    doc.text("Critical Gaps", 20, currentY);
    currentY += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    analysis.gaps.forEach((g) => {
      if (currentY > 280) { doc.addPage(); currentY = 20; }
      const gLines = doc.splitTextToSize(`• ${g}`, 170);
      doc.text(gLines, 20, currentY);
      currentY += (gLines.length * 6) + 2;
    });

    // --- INTERVIEW GUIDE (New Page) ---
    doc.addPage();
    doc.setFillColor(243, 244, 246); // Light Gray Header
    doc.rect(0, 0, 210, 300, 'F');
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.text("Strategic Interview Guide", 20, 30);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "italic");
    doc.text(`Suggested questions for ${cName}:`, 20, 45);
    doc.setFont("helvetica", "normal");
    let qPos = 60;
    analysis.questions.forEach((q, i) => {
      const qLines = doc.splitTextToSize(`${i+1}. ${q}`, 170);
      doc.text(qLines, 20, qPos);
      qPos += (qLines.length * 6) + 10;
    });

    doc.save(`${cName.replace(/\s+/g, '_')}_Report.pdf`);
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) {
      setShowUpgradeModal(true);
      return;
    }
    if (!jdReady || !resumeReady) return alert("Please complete Step 1 and 2.");
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. 
      Extract the candidate's name.
      Return JSON ONLY: {
        "candidate_name": "First Last",
        "score": 0-100,
        "summary": "...",
        "strengths": ["...", "..."],
        "gaps": ["...", "..."],
        "questions": ["...", "...", "..."],
        "outreach_email": "Subject: ...\\n\\n..."
      }`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      setAnalysis(JSON.parse(data.candidates[0].content.parts[0].text));
      
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
    } catch (err) { alert("Analysis failed."); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen font-sans">
      
      {/* --- NEW GLASSMORPHISM UPGRADE MODAL --- */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/60 animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl group animate-in zoom-in-95 duration-300">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[2.5rem] blur-2xl opacity-30 animate-pulse"></div>
            
            {/* Main Card */}
            <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
              
              {/* Left Side: Pitch */}
              <div className="p-10 md:w-3/5 flex flex-col justify-center relative">
                 <div className="mb-6">
                    <img src={logo} alt="Recruit-IQ Logo" className="h-10 w-auto opacity-90" /> 
                 </div>
                 <h2 className="text-2xl font-black text-white mb-2 leading-tight">
                    Scale Your Hiring <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Without Limits.</span>
                 </h2>
                 <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    You've used your 3 free screenings. Upgrade to unlock unlimited AI analysis and cut screening time by 90%.
                 </p>
                 <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                       <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">⚡</div>
                       <span>Unlimited AI Candidate Screening</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                       <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">📄</div>
                       <span>Export PDF Intelligence Reports</span>
                    </div>
                 </div>
                 <a href={STRIPE_URL} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-bold rounded-xl uppercase tracking-wider shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all text-xs">
                    Upgrade Now - $29/mo
                 </a>
                 <button onClick={() => window.location.reload()} className="text-center text-[10px] text-slate-500 mt-4 hover:text-white transition-colors w-full">I'll Upgrade Later</button>
              </div>

              {/* Right Side: Visual */}
              <div className="hidden md:flex md:w-2/5 bg-slate-900/50 border-l border-slate-800 items-center justify-center p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                 <div className="text-center relative z-10">
                    <div className="text-6xl mb-4">💎</div>
                    <h3 className="font-bold text-white text-lg">Pro Access</h3>
                    <p className="text-xs text-slate-
