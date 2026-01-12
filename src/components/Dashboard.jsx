import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react";
import logo from '../logo.png';

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

// --- FULL LENGTH SAMPLE DATA ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

ABOUT THE ROLE:
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
- Strong understanding of financial market data and execution protocols (FIX/FAST).
- Experience building real-time data pipelines and low-latency APIs.
- Expert knowledge of distributed systems and microservices patterns.
- Strategic thinker with excellent communication skills for stakeholder management.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers to deliver 99.99% uptime for global trading platforms.

PROFESSIONAL EXPERIENCE:
Global Quant Solutions | Principal Architect | 2018 - Present
- Architected a serverless data processing pipeline handling 5TB of daily market data.
- Reduced infrastructure costs by 35% through aggressive AWS Graviton migration.
- Led the engineering team through a successful $200M Series D funding round.
- Mentored a team of 15 senior developers, increasing deployment velocity by 40%.

InnovaTrade | Senior Staff Engineer | 2014 - 2018
- Built the core execution engine in Go, achieving a 50% reduction in order latency.
- Implemented automated failover protocols that prevented over $10M in potential slippage.
- Managed the transition of legacy on-prem systems to a containerized AWS environment.

TECHNICAL SKILLS:
- Languages: Go, C++, Python, TypeScript, Java.
- Cloud: AWS (EKS, Lambda, Aurora, SQS), Terraform, Docker, Kubernetes.
- Systems: Kafka, Redis, PostgreSQL, gRPC, FIX Protocol.

EDUCATION:
M.S. in Computer Science | Massachusetts Institute of Technology (MIT)
B.S. in Software Engineering | Stanford University`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [guestUsage, setGuestUsage] = useState(0);
  const GUEST_LIMIT = 3;

  const isPro = user?.publicMetadata?.isPro === true;
  
  // Logic for green checkmarks
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const justPaid = query.get('success');

    if (justPaid && isLoaded && isSignedIn) {
      user.reload().then(() => { 
        window.history.replaceState({}, document.title, "/"); 
      });
    }
    // REDIRECTS DISABLED FOR MAINTENANCE MODE
  }, [isLoaded, isSignedIn, isPro]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
    } catch (err) { alert("Error reading file."); }
  };

  const handleScreen = async () => {
    if (!jdReady || !resumeReady) return alert("Please complete both steps first.");
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analyze JD and Resume. Return JSON: {"score": 0-100, "summary": "..."}. JD: ${jdText} Resume: ${resumeText}` }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      setAnalysis(JSON.parse(data.candidates[0].content.parts[0].text));
    } catch (err) { alert("Analysis failed."); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <img src={logo} alt="Recruit-IQ" className="h-10 w-auto" />
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/10 border border-indigo-500/50 px-4 py-2 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
            {isPro ? "PRO ACCESS ACTIVE" : "MAINTENANCE MODE"}
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {user?.primaryEmailAddress?.emailAddress}
          </div>
        </div>
      </div>

      {/* 1-2-3 QUICK START WITH CHECKMARKS */}
      <div className="grid md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border transition-all ${jdReady ? 'bg-indigo-900/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-[10px] uppercase tracking-widest">1. Define Role</h4>
                {jdReady && <span className="text-emerald-400 text-lg font-bold">✓</span>}
             </div>
             <p className="text-[11px] text-slate-400">Paste the job description.</p>
          </div>

          <div className={`p-6 rounded-3xl border transition-all ${resumeReady ? 'bg-indigo-900/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-[10px] uppercase tracking-widest">2. Load Candidate</h4>
                {resumeReady && <span className="text-emerald-400 text-lg font-bold">✓</span>}
             </div>
             <p className="text-[11px] text-slate-400">Upload or paste the resume.</p>
          </div>

          <div className={`p-6 rounded-3xl border transition-all ${analysis ? 'bg-emerald-900/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-[10px] uppercase tracking-widest">3. Unlock Intel</h4>
                {analysis && <span className="text-emerald-400 text-lg font-bold">✓</span>}
             </div>
             <p className="text-[11px] text-slate-400">Run the AI screening.</p>
          </div>
      </div>

      {/* MAIN INTERFACE */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl relative">
            <div className="flex gap-3 mb-6">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'jd' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                  Job Description {jdReady && <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>}
               </button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'resume' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                  Resume {resumeReady && <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>}
               </button>
            </div>

            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 transition hover:text-white">
                Upload File <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 transition hover:text-white">Load Full Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed mb-6 focus:border-indigo-500/50 transition-colors"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content here..."
            />

            <button onClick={handleScreen} disabled={loading} className="py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-white bg-gradient-to-r from-indigo-600 to-blue-600 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
              {loading ? "Analyzing Candidate Intelligence..." : "Screen Candidate →"}
            </button>
        </div>

        <div className="h-[850px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {analysis ? (
              <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-5xl font-black mb-6 shadow-2xl">{analysis.score}%</div>
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-3">Match Confidence</h3>
                <p className="text-slate-200 text-sm italic font-medium leading-relaxed">"{analysis.summary}"</p>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] gap-4 uppercase tracking-widest">
                 <div className="text-6xl opacity-20 mb-4">📊</div>
                 Waiting for data...
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
