import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser } from "@clerk/clerk-react";
import logo from '../logo.png';

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

ABOUT THE COMPANY:
Vertex Financial Systems is a global leader in high-frequency trading technology, processing over $50B in daily transaction volume. We are seeking a visionary Architect to lead the evolution of our next-generation platform.

KEY RESPONSIBILITIES:
- Design and implement high-availability microservices using AWS EKS and Fargate to ensure 99.999% uptime.
- Lead the migration from legacy monolithic structures to a modern, event-driven architecture using Kafka and gRPC.
- Optimize C++ and Go-based trading engines for sub-millisecond latency under extreme market volatility.
- Collaborate with quantitative researchers to productionalize complex trading models and algorithms.
- Establish CI/CD best practices, automated testing frameworks, and mentor a global team of 15+ senior engineers.

REQUIREMENTS:
- 12+ years of software engineering experience in FinTech, Capital Markets, or High-Frequency Trading.
- Deep expertise in AWS Cloud Architecture (AWS Certified Solutions Architect Professional preferred).
- Proven track record with Kubernetes, Docker, Kafka, Redis, and Terraform at enterprise scale.
- Strong proficiency in Go (Golang), C++, Python, and TypeScript.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com | (555) 019-2834

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations, low-latency system design, and distributed systems. Managed teams of 20+ engineers to deliver 99.99% uptime for global trading platforms.

PROFESSIONAL EXPERIENCE:
Global Quant Solutions | Principal Architect | New York, NY | 2018 - Present
- Architected a serverless data processing pipeline handling 5TB of daily market data using AWS Lambda and Kinesis.
- Reduced infrastructure costs by 35% ($1.2M annually) through aggressive AWS Graviton migration and spot instance orchestration.
- Led the engineering team through a successful $200M Series D funding round, presenting technical roadmaps to investors.

InnovaTrade | Senior Staff Engineer | Chicago, IL | 2014 - 2018
- Built the core execution engine in Go, achieving a 50% reduction in order latency (from 5ms to 2.5ms).
- Implemented automated failover protocols that prevented over $10M in potential slippage during market flash crashes.

TECHNICAL SKILLS:
- Languages: Go, C++, Python, TypeScript, Java, Rust.
- Cloud: AWS (EKS, Lambda, Aurora, SQS), Terraform, Docker, Kubernetes.
- Data: Kafka, Redis, PostgreSQL, DynamoDB, Elasticsearch.`;

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
        alert("PDF detected. For best results, copy and paste text directly.");
      } else {
        const text = await file.text();
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      }
    } catch (err) { alert("Error reading file."); }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF();
    
    // Header Section
    doc.setFillColor(79, 70, 229); // Indigo Brand Color
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Recruit-IQ Intelligence Report", 20, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Candidate Match Analysis & Interview Guide`, 20, 30);

    // Score & Summary
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Match Score: ${analysis.score}%`, 20, 55);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(analysis.summary, 170), 20, 65);

    // Strengths & Gaps
    let yPos = 100;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); // Emerald Green
    doc.text("Key Strengths", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    analysis.strengths.forEach((s) => {
      yPos += 7;
      doc.text(`• ${s}`, 20, yPos);
    });

    yPos += 15;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(244, 63, 94); // Rose Red
    doc.text("Critical Gaps", 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    analysis.gaps.forEach((g) => {
      yPos += 7;
      doc.text(`• ${g}`, 20, yPos);
    });

    // Interview Guide
    doc.addPage();
    doc.setFillColor(243, 244, 246); // Light Gray Background
    doc.rect(0, 0, 210, 300, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.text("Strategic Interview Guide", 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "italic");
    doc.text("Ask these targeted questions to validate skills and probe gaps:", 20, 45);

    doc.setFont("helvetica", "normal");
    let qPos = 60;
    analysis.questions.forEach((q, i) => {
      doc.text(`${i+1}. ${q}`, 20, qPos, { maxWidth: 170 });
      qPos += 20;
    });

    doc.save(`Recruit-IQ-Report.pdf`);
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
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Return JSON ONLY: {
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
      
      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-[#111827] border-2 border-indigo-500 rounded-3xl p-8 max-w-md text-center shadow-2xl relative animate-in fade-in zoom-in">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Limit Reached</div>
              <h2 className="text-2xl font-black text-white mb-2">Unlock Unlimited Intel</h2>
              <p className="text-slate-400 text-sm mb-6">You've used your 3 free screenings. Upgrade to Recruit-IQ Pro to continue without limits.</p>
              <div className="space-y-3">
                <a href={STRIPE_URL} className="block w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl font-bold uppercase text-xs tracking-widest hover:scale-105 transition-transform">Upgrade Now - $29/mo</a>
                <button onClick={() => window.location.reload()} className="block w-full py-3 bg-slate-800 rounded-xl font-bold uppercase text-[10px] text-slate-400 hover:text-white">I'll Upgrade Later</button>
              </div>
           </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <img src={logo} alt="Recruit-IQ" className="h-10 w-auto" />
        <div className="bg-indigo-500/10 border border-indigo-500/50 px-4 py-2 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
           {isPro ? "PRO INTEL ACTIVE" : `FREE TRIAL: ${3 - scanCount} SCANS LEFT`}
        </div>
      </div>

      {/* QUICK START WITH GREEN CHECKMARKS */}
      <div className="grid md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border transition-all ${jdReady ? 'bg-indigo-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-center mb-2">
                <h4 className={`font-bold text-[10px] uppercase tracking-widest ${jdReady ? 'text-emerald-400' : 'text-slate-400'}`}>1. Define Requirements</h4>
                {jdReady && <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✓</span>}
             </div>
             <p className="text-[11px] text-slate-300">Paste the Job Description to set the screening standard.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${resumeReady ? 'bg-indigo-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-center mb-2">
                <h4 className={`font-bold text-[10px] uppercase tracking-widest ${resumeReady ? 'text-emerald-400' : 'text-slate-400'}`}>2. Input Candidate</h4>
                {resumeReady && <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✓</span>}
             </div>
             <p className="text-[11px] text-slate-300">Upload Resume to analyze skills and experience.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${analysis ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700'}`}>
             <h4 className="font-bold text-[10px] uppercase tracking-widest mb-2 text-indigo-400">3. Analyze & Act</h4>
             <p className="text-[11px] text-slate-300">Get match score, interview guide, and outreach email.</p>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* INPUT COLUMN */}
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl">
            <div className="flex gap-3 mb-6">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider ${activeTab === 'jd' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>Job Description</button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>Resume</button>
            </div>
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 hover:text-white transition-colors">
                Upload File <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400">Load Full Samples</button>
            </div>
            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed mb-6"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
            />
            <button onClick={handleScreen} disabled={loading} className="py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-white bg-gradient-to-r from-indigo-600 to-blue-600 shadow-xl hover:shadow-indigo-500/25 transition-all">
              {loading ? "Analyzing..." : `Screen Candidate (${isPro ? 'Unlimited' : `${3 - scanCount} Free Left`}) →`}
            </button>
        </div>

        {/* RESULTS COLUMN - REORDERED */}
        <div className="h-[850px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in">
                
                {/* 1. MATCH SCORE & TOP BUTTON */}
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">Match Confidence</h3>
                  <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto border border-slate-700">
                    <span>📄</span> Download PDF Intelligence Report & Interview Guide
                  </button>
                </div>

                {/* 2. STRENGTHS & GAPS (MOVED UP) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl">
                    <h4 className="text-emerald-400 font-bold uppercase text-[10px] mb-3">Strengths</h4>
                    <ul className="text-[11px] text-slate-300 space-y-2">{analysis.strengths?.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl">
                    <h4 className="text-rose-400 font-bold uppercase text-[10px] mb-3">Gaps</h4>
                    <ul className="text-[11px] text-slate-300 space-y-2">{analysis.gaps?.map((g, i) => <li key={i}>• {g}</li>)}</ul>
                  </div>
                </div>

                {/* 3. INTERVIEW QUESTIONS & SECOND BUTTON */}
                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-indigo-400 font-bold uppercase text-[10px]">Targeted Interview Questions</h4>
                    <button onClick={downloadPDF} className="text-slate-400 hover:text-white text-[10px] underline">Download Guide</button>
                  </div>
                  <ul className="text-[11px] text-slate-300 space-y-3">
                    {analysis.questions?.map((q, i) => <li key={i} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">"{q}"</li>)}
                  </ul>
                </div>

                {/* 4. OUTREACH EMAIL */}
                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <h4 className="text-blue-400 font-bold uppercase text-[10px] mb-3">AI Outreach Email</h4>
                  <p className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed bg-[#0B1120] p-5 rounded-xl border border-slate-800">{analysis.outreach_email}</p>
                  <button onClick={() => navigator.clipboard.writeText(analysis.outreach_email)} className="mt-4 w-full py-3 bg-slate-800 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-700 transition-colors">Copy to Clipboard</button>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] gap-4 uppercase tracking-widest">
                 Waiting for screening data...
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
