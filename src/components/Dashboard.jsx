import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react";

// --- UPDATED IMPORT ---
// This looks for logo.png in the 'src' folder (one level up from components)
import logo from '../logo.png';

// --- CONFIGURATION ---
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
- Strong understanding of financial market data and execution protocols (FIX/FAST).`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | m.vandelay@email.com | (555) 123-4567

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
- Languages: Go, C++, Python, TypeScript.
- Cloud: AWS (EKS, Lambda, Aurora, SQS), Terraform, Docker.
- Systems: Kafka, Redis, PostgreSQL, gRPC.

EDUCATION:
M.S. in Computer Science | Massachusetts Institute of Technology (MIT)`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  
  // App State
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Freemium State
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [guestUsage, setGuestUsage] = useState(0);
  const GUEST_LIMIT = 3;

  // READ FROM ZAPIER METADATA
  const isPro = user?.publicMetadata?.isPro === true;

  // Completion Logic
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  // --- EFFECTS ---
  useEffect(() => {
    const storedUsage = localStorage.getItem('riq_guest_usage');
    if (storedUsage) setGuestUsage(parseInt(storedUsage));

    const query = new URLSearchParams(window.location.search);
    if (query.get('success') && isLoaded && isSignedIn) {
      user.reload().then(() => { 
        window.history.replaceState({}, document.title, "/"); 
      });
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (isLoaded && isSignedIn && !isPro && !query.get('success')) {
       window.location.href = STRIPE_URL;
    }
  }, [isLoaded, isSignedIn, isPro]);

  // --- HANDLERS ---
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
    if (!isSignedIn && guestUsage >= GUEST_LIMIT) return setShowUpgrade(true);
    if (isSignedIn && !isPro) return setShowUpgrade(true);
    if (!jdReady || !resumeReady) return alert("Please complete Step 1 (Job Description) and Step 2 (Resume).");
    
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Act as a recruiter. Analyze JD and Resume. Return JSON: {"score": 0-100, "summary": "...", "strengths": [], "gaps": [], "questions": [], "email_subject": "...", "email_body": "..."}. JD: ${jdText} Resume: ${resumeText}` }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      setAnalysis(JSON.parse(data.candidates[0].content.parts[0].text));
      if (!isSignedIn) {
        const newUsage = guestUsage + 1;
        setGuestUsage(newUsage);
        localStorage.setItem('riq_guest_usage', newUsage.toString());
      }
    } catch (err) { alert("Analysis failed."); } finally { setLoading(false); }
  };

  // --- LOADING STATES ---
  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;
  if (isSignedIn && !isPro) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center text-white">
         <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
         <h2 className="text-xl font-bold uppercase tracking-widest italic text-indigo-400">Syncing Pro Access...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen relative font-sans">
      
      {/* --- QUICK START (1-2-3) --- */}
      <div className="grid md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 ${jdReady ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-start mb-3">
                <span className={`text-3xl font-black ${jdReady ? 'text-indigo-400' : 'text-slate-600'}`}>1</span>
                {jdReady && <span className="flex items-center justify-center w-6 h-6 bg-indigo-500 rounded-full text-white text-xs font-bold">✓</span>}
             </div>
             <h4 className={`font-bold text-xs uppercase tracking-widest mb-2 ${jdReady ? 'text-white' : 'text-slate-400'}`}>Define Role</h4>
             <p className="text-[11px] text-slate-400 leading-relaxed">Paste the Job Description to benchmark key requirements.</p>
          </div>

          {/* Step 2 */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 ${resumeReady ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-start mb-3">
                <span className={`text-3xl font-black ${resumeReady ? 'text-indigo-400' : 'text-slate-600'}`}>2</span>
                {resumeReady && <span className="flex items-center justify-center w-6 h-6 bg-indigo-500 rounded-full text-white text-xs font-bold">✓</span>}
             </div>
             <h4 className={`font-bold text-xs uppercase tracking-widest mb-2 ${resumeReady ? 'text-white' : 'text-slate-400'}`}>Load Candidate</h4>
             <p className="text-[11px] text-slate-400 leading-relaxed">Upload resume. We extract skills, history, and gaps.</p>
          </div>

          {/* Step 3 */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 ${analysis ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-start mb-3">
                <span className={`text-3xl font-black ${analysis ? 'text-emerald-400' : 'text-slate-600'}`}>3</span>
                {analysis && <span className="flex items-center justify-center w-6 h-6 bg-emerald-500 rounded-full text-white text-xs font-bold">✓</span>}
             </div>
             <h4 className={`font-bold text-xs uppercase tracking-widest mb-2 ${analysis ? 'text-white' : 'text-slate-400'}`}>Unlock Intel</h4>
             <p className="text-[11px] text-slate-400 leading-relaxed">Get Match Score, Interview Guide, and Outreach.</p>
          </div>
      </div>

      {/* --- MAIN DASHBOARD GRID --- */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* INPUT PANEL */}
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl relative">
            
            {/* Tabs */}
            <div className="flex gap-3 mb-6">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'jd' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                  Job Description {jdReady && <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>}
               </button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'resume' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                  Resume {resumeReady && <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>}
               </button>
            </div>

            {/* Tools */}
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 transition hover:text-white">
                Upload File <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 hover:bg-slate-700/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 transition hover:text-white">Load Full Samples</button>
            </div>

            {/* Text Area */}
            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed mb-6 focus:border-indigo-500/50 transition-colors"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={activeTab === 'jd' ? "Paste Job Description here..." : "Paste Candidate Resume here..."}
            />

            {/* Dynamic Action Button */}
            <button onClick={handleScreen} disabled={loading} className={`py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group ${jdReady && resumeReady ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
               {!jdReady ? (
                 <><span>Step 1: Paste Job Description</span></>
               ) : !resumeReady ? (
                 <><span>Step 2: Add Resume</span></>
               ) : loading ? (
                 <span className="animate-pulse">Analyzing Assets...</span>
               ) : (
                 <><span>Step 3: Screen Candidate</span> <span className="group-hover:translate-x-1 transition-transform">→</span></>
               )}
            </button>
        </div>

        {/* RESULTS PANEL */}
        <div className="h-[850px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {analysis ? (
              <div className="animate-in fade-in slide-in-from-right-8 space-y-6">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                  <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-5xl font-black mb-6 shadow-2xl ${analysis.score > 75 ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white' : 'bg-gradient-to-br from-amber-500 to-amber-700 text-white'}`}>{analysis.score}%</div>
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-3">Match Confidence</h3>
                  <p className="text-slate-200 text-sm italic font-medium">"{analysis.summary}"</p>
                </div>
                
                <div className="bg-indigo-950/30 p-8 rounded-[2.5rem] border border-indigo-500/20">
                    <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-6 tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span> AI Interview Guide
                    </h4>
                    <ul className="space-y-4">{analysis.questions.map((q, i) => (
                      <li key={i} className="text-sm text-slate-300 bg-[#0B1120] p-4 rounded-xl border border-slate-800 leading-relaxed shadow-sm">
                        <span className="text-indigo-500 font-bold mr-2">Q{i+1}.</span> {q}
                      </li>
                    ))}</ul>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] gap-6 px-12 text-center opacity-50 uppercase tracking-widest">
                 <div className="text-6xl opacity-20">📊</div>
                 Waiting for data...
              </div>
            )}
        </div>
      </div>

      {/* --- NEW HIGH-CONVERSION UPGRADE MODAL --- */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/60">
          <div className="relative w-full max-w-2xl group animate-in zoom-in-95 duration-300">
            
            {/* The "Glow" Behind */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[2.5rem] blur-2xl opacity-30 animate-pulse"></div>
            
            {/* Main Card */}
            <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
              
              {/* Left Side: The "Pitch" */}
              <div className="p-10 md:w-3/5 flex flex-col justify-center relative">
                 {/* Replaced Rocket with Local Logo */}
                 <div className="mb-6">
                    <img src={logo} alt="Recruit-IQ Logo" className="h-10 w-auto opacity-90" /> 
                 </div>

                 <h2 className="text-3xl font-black text-white mb-2 leading-tight">
                    Scale Your Hiring <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r
