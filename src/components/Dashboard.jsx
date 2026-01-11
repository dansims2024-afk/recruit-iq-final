import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react"; 

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
  const jdReady = jdText.trim().length > 100;
  const resumeReady = resumeText.trim().length > 100;

  useEffect(() => {
    const storedUsage = localStorage.getItem('riq_guest_usage');
    if (storedUsage) setGuestUsage(parseInt(storedUsage));

    const query = new URLSearchParams(window.location.search);
    if (query.get('success') && isLoaded && isSignedIn) {
      setTimeout(() => {
        user.reload().then(() => { window.history.replaceState({}, document.title, "/"); });
      }, 1500); 
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (isLoaded && isSignedIn && !isPro) {
       const query = new URLSearchParams(window.location.search);
       if (!query.get('success')) { window.location.href = STRIPE_URL; }
    }
  }, [isLoaded, isSignedIn, isPro]);

  // --- LOGIC FUNCTIONS ---
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
    if (!jdReady || !resumeReady) return alert("Please fill both sections before screening.");
    
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analyze JD and Resume. Return JSON: {"score": 0-100, "summary": "...", "strengths": [], "gaps": [], "questions": [], "email_subject": "...", "email_body": "..."}. JD: ${jdText} Resume: ${resumeText}` }] }],
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

  if (isSignedIn && !isPro && isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-10">
         <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
         <h2 className="text-xl font-bold uppercase tracking-widest">Activating Pro Intel...</h2>
         <p className="text-slate-400 text-sm mt-2">Zapier is syncing your account. This takes a moment.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-slate-950 min-h-screen font-sans relative">
      
      {/* PREMIUM UPGRADE MODAL */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/80">
          <div className="relative w-full max-w-lg group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 rounded-[2.5rem] blur-xl opacity-40 animate-pulse"></div>
            <div className="relative bg-slate-900 border border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-b from-emerald-900/40 to-slate-900 p-10 text-center border-b border-slate-800">
                 <button onClick={() => setShowUpgrade(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition">✕</button>
                 <div className="text-5xl mb-4 font-bold tracking-tighter text-emerald-400">Recruit-IQ <span className="text-white">PRO</span></div>
                 <h2 className="text-2xl font-black text-white mb-2">3 DAYS OF UNLIMITED ACCESS</h2>
                 <p className="text-slate-400 text-sm">3 Free screens used. Don't lose your momentum.</p>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-700">
                       <span className="text-xl">📊</span>
                       <div>
                          <p className="text-sm font-bold text-white">Advanced Match Logic</p>
                          <p className="text-[10px] text-slate-500">Deeper semantic analysis and skill-gap identification.</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-700">
                       <span className="text-xl">📄</span>
                       <div>
                          <p className="text-sm font-bold text-white">Professional Reports</p>
                          <p className="text-[10px] text-slate-500">Download beautifully formatted Word Intelligence reports.</p>
                       </div>
                    </div>
                 </div>
                 <SignUpButton mode="modal" forceRedirectUrl={STRIPE_URL}>
                    <button className="w-full py-5 bg-emerald-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest hover:scale-[1.02] transition shadow-lg shadow-emerald-500/20">Claim My 3-Day Free Trial →</button>
                 </SignUpButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COLOR CODED QUICK START */}
      <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl group transition-all hover:bg-blue-600/20">
             <div className="text-blue-500 font-black text-2xl mb-2 flex justify-between">1 <span className={jdReady ? "text-emerald-500" : "hidden"}>✓</span></div>
             <h4 className="font-bold text-xs uppercase tracking-widest text-blue-400 mb-2">Define Role</h4>
             <p className="text-[10px] text-slate-400 leading-relaxed">Paste your Job Description. Our AI benchmarks the core requirements and culture fit.</p>
          </div>
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-3xl group transition-all hover:bg-indigo-600/20">
             <div className="text-indigo-500 font-black text-2xl mb-2 flex justify-between">2 <span className={resumeReady ? "text-emerald-500" : "hidden"}>✓</span></div>
             <h4 className="font-bold text-xs uppercase tracking-widest text-indigo-400 mb-2">Load Candidate</h4>
             <p className="text-[10px] text-slate-400 leading-relaxed">Upload the resume. We extract skills, experience, and potential gaps in seconds.</p>
          </div>
          <div className="bg-emerald-600/10 border border-emerald-500/20 p-6 rounded-3xl group transition-all hover:bg-emerald-600/20">
             <div className="text-emerald-500 font-black text-2xl mb-2 flex justify-between">3 <span className={analysis ? "text-emerald-500" : "hidden"}>✓</span></div>
             <h4 className="font-bold text-xs uppercase tracking-widest text-emerald-400 mb-2">Unlock Intel</h4>
             <p className="text-[10px] text-slate-400 leading-relaxed">Get your Match Score, custom interview questions, and automated outreach draft.</p>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl relative">
            <div className="flex gap-3 mb-4">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'jd' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  JD {jdReady && <span className="text-emerald-400">●</span>}
               </button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'resume' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  RESUME {resumeReady && <span className="text-emerald-400">●</span>}
               </button>
            </div>

            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-black/30 hover:bg-black/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-800 text-slate-400 transition">
                Upload File <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={loadSamples} className="flex-1 bg-black/30 hover:bg-black/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-800 text-slate-400 transition">Load Full Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-black/20 resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono mb-4 focus:border-slate-600 transition-colors"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content to begin..."
            />

            <button onClick={handleScreen} disabled={loading} className={`py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all flex items-center justify-center gap-3 ${jdReady && resumeReady ? 'bg-emerald-600 shadow-xl shadow-emerald-900/50' : 'bg-slate-800 opacity-50'}`}>
               {loading ? "Analyzing..." : "Screen Candidate →"}
            </button>
        </div>

        {/* RESULTS PANEL */}
        <div className="h-[850px] overflow-y-auto pr-2 space-y-6">
            {analysis ? (
              <div className="space-y-6 pb-10">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative">
                  <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center text-4xl font-black mb-6 ${analysis.score > 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}>{analysis.score}%</div>
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-3">Match Score</h3>
                  <p className="text-slate-200 text-sm leading-relaxed">"{analysis.summary}"</p>
                </div>

                <div className="bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-500/20">
                    <div className="flex justify-between items-end mb-4 font-black uppercase text-[10px] text-indigo-400">
                       Interview Intel
                       <button className="bg-indigo-600 px-4 py-2 rounded-lg text-white">Download Pro Report ↓</button>
                    </div>
                    <ul className="space-y-3">{analysis.questions.map((q, i) => <li key={i} className="text-xs text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-800">"{q}"</li>)}</ul>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] gap-6 px-12 text-center opacity-50 uppercase tracking-widest">
                 Intelligence Standby. <br/> Complete Steps 1 & 2.
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
