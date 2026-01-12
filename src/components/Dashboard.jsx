import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser } from "@clerk/clerk-react";
import logo from '../logo.png';

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

Vertex Financial Systems is seeking a visionary Architect to lead the evolution of our next-generation high-frequency trading platform. You will be responsible for defining the technical roadmap, mentoring lead engineers, and ensuring our systems maintain sub-millisecond latency under extreme market volatility.

KEY RESPONSIBILITIES:
- Design and implement high-availability microservices using AWS EKS and Fargate.
- Lead the migration from legacy monolithic structures to a event-driven architecture.
- Optimize C++ and Go-based trading engines for maximum throughput.
- Collaborate with quantitative researchers to productionalize complex trading models.
- Establish CI/CD best practices and mentor a global team of 15+ senior engineers.

REQUIREMENTS:
- 12+ years of software engineering experience in FinTech or High-Growth SaaS.
- Deep expertise in AWS Cloud Architecture (AWS Certified Architect preferred).
- Proven track record with Kubernetes, Kafka, and Redis at scale.
- Strong understanding of financial market data and execution protocols (FIX/FAST).`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers to deliver 99.99% uptime for global trading platforms.

PROFESSIONAL EXPERIENCE:
Global Quant Solutions | Principal Architect | 2018 - Present
- Architected a serverless data processing pipeline handling 5TB of daily market data.
- Reduced infrastructure costs by 35% through aggressive AWS Graviton migration.
- Led the engineering team through a successful $200M Series D funding round.

InnovaTrade | Senior Staff Engineer | 2014 - 2018
- Built the core execution engine in Go, achieving a 50% reduction in order latency.
- Implemented automated failover protocols that prevented over $10M in potential slippage.

TECHNICAL SKILLS:
- Languages: Go, C++, Python, TypeScript, Java.
- Cloud: AWS (EKS, Lambda, Aurora, SQS), Terraform, Docker, Kubernetes.
- Systems: Kafka, Redis, PostgreSQL, gRPC, FIX Protocol.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const isPro = user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  // --- ANALYSIS + EMAIL GENERATION ---
  const handleScreen = async () => {
    if (!jdReady || !resumeReady) return alert("Please complete Step 1 and 2.");
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. 
      Return JSON ONLY: {
        "score": 0-100,
        "summary": "...",
        "strengths": ["...", "..."],
        "gaps": ["...", "..."],
        "outreach_email": "Subject: ...\\n\\nHi [Name], ..."
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
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      setAnalysis(result);
      setEmail(result.outreach_email);
    } catch (err) { alert("Analysis failed. Check your Gemini API Key."); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <img src={logo} alt="Recruit-IQ" className="h-10 w-auto" />
        <div className="bg-indigo-500/10 border border-indigo-500/50 px-4 py-2 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
           {isPro ? "PRO INTEL ACTIVE" : "MAINTENANCE MODE"}
        </div>
      </div>

      {/* QUICK START INSTRUCTIONS */}
      <div className="grid md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border transition-all ${jdReady ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700'}`}>
             <h4 className="font-bold text-[10px] uppercase tracking-widest mb-1">1. Set Requirements</h4>
             <p className="text-[11px] text-slate-400 leading-relaxed">Paste your full Job Description or use 'Load Samples' to see the target format.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${resumeReady ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700'}`}>
             <h4 className="font-bold text-[10px] uppercase tracking-widest mb-1">2. Target Candidate</h4>
             <p className="text-[11px] text-slate-400 leading-relaxed">Upload a .docx resume or paste text. Ensure full experience history is included.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${analysis ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700'}`}>
             <h4 className="font-bold text-[10px] uppercase tracking-widest mb-1">3. Generate Intel</h4>
             <p className="text-[11px] text-slate-400 leading-relaxed">Run the screen to get a match score, gap analysis, and a custom outreach email.</p>
          </div>
      </div>

      {/* MAIN ENGINE */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl">
            <div className="flex gap-3 mb-6">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider ${activeTab === 'jd' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>Job Description</button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>Resume</button>
            </div>
            <div className="flex gap-3 mb-4">
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 hover:text-white transition-colors">Load Full Samples</button>
            </div>
            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed mb-6"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content here..."
            />
            <button onClick={handleScreen} disabled={loading} className="py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-white bg-gradient-to-r from-indigo-600 to-blue-600 shadow-xl">
              {loading ? "Analyzing Intelligence..." : "Screen Candidate →"}
            </button>
        </div>

        {/* PRO INTELLIGENCE & EMAIL PANEL */}
        <div className="h-[850px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Match Confidence</h3>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <h4 className="text-emerald-400 font-bold uppercase text-[10px] mb-3">Custom Outreach Email</h4>
                  <textarea 
                    readOnly 
                    className="w-full bg-[#0B1120] p-4 rounded-xl text-[11px] text-slate-300 h-64 border border-slate-800 focus:outline-none"
                    value={email}
                  />
                  <button onClick={() => navigator.clipboard.writeText(email)} className="mt-4 w-full py-3 bg-slate-800 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-700 transition-colors">Copy to Clipboard</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl">
                    <h4 className="text-emerald-400 font-bold uppercase text-[10px] mb-3">Strengths</h4>
                    <ul className="text-[11px] text-slate-300 space-y-2">
                      {analysis.strengths?.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl">
                    <h4 className="text-rose-400 font-bold uppercase text-[10px] mb-3">Gaps</h4>
                    <ul className="text-[11px] text-slate-300 space-y-2">
                      {analysis.gaps?.map((g, i) => <li key={i}>• {g}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] gap-4 uppercase tracking-widest">
                 Waiting for data...
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
