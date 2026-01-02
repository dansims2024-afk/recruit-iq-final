import React, { useState, useEffect, useCallback } from 'react';

// --- CONFIGURATION & SAMPLES ---
const APP_NAME = "Recruit-IQ";
const COPYRIGHT = "Core Creativity AI 2026";
const MAX_FREE_SCREENS = 3;

const FULL_SAMPLE_JD = `## SENIOR FULL STACK ENGINEER (FINTECH INNOVATION)
# MISSION CONTEXT
Lead the architectural evolution of our flagship digital banking platform. Scale services handling $500M+ in daily transaction volume while ensuring military-grade security and sub-100ms performance.

# STRATEGIC RESPONSIBILITIES
- Architect scalable microservices using Node.js, TypeScript, and Go.
- Build high-performance, accessible UIs with React 19 and Tailwind CSS.
- Lead legacy-to-cloud migration strategies on AWS (EKS, RDS, Lambda).
- Implement rigorous CI/CD pipelines and mentor a team of 15+ engineers.

# IDEAL CANDIDATE PROFILE
- 8+ years of professional software engineering experience.
- Deep expertise in distributed systems and event-driven architecture.
- Strong background in FinTech security standards (PCI-DSS, SOC2).`;

const FULL_SAMPLE_RESUME = `ALEX RIVERA | alex.rivera@example.com | San Francisco, CA
# PROFESSIONAL EXPERIENCE
FINTECH SOLUTIONS | LEAD ENGINEER | 2020 - PRESENT
- Redesigned core payment processing engine, reducing p99 latency by 45% and saving $2M in annual compute costs.
- Scaled AWS infrastructure from 50 to 500+ microservices to support 4x user growth.
- Led a cross-functional team of 12 to launch the "Instant Pay" feature.

DIGITAL LEDGER INC. | SENIOR DEVELOPER | 2016 - 2020
- Built reusable UI component library used by 200+ internal developers.
- Optimized PostgreSQL queries resulting in a 60% improvement in dashboard load times.

# TECHNICAL STACK
Languages: TypeScript, JavaScript, Go, Python, SQL.
Tools: React, Node.js, AWS (EKS/S3), Docker, Kubernetes, Redis.`;

// --- ICONS (Build-Safe SVGs) ---
const Icons = {
  Zap: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  Upload: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Alert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
};

export default function RecruitIQApp() {
  const [activeTab, setActiveTab] = useState('jd'); 
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [screenCount, setScreenCount] = useState(0);
  const [emailDraft, setEmailDraft] = useState('');
  const [libsReady, setLibsReady] = useState(false);

  // --- LOGIC: Load external parsing libraries dynamically ---
  useEffect(() => {
    const loadScript = (src) => new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      document.head.appendChild(script);
    });

    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js')
    ]).then(() => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      setLibsReady(true);
    });
  }, []);

  // --- LOGIC: Handle File Upload (PDF/DOCX) ---
  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file || !libsReady) return;
    
    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      let extractedText = "";
      try {
        if (file.type === "application/pdf") {
          const pdf = await window.pdfjsLib.getDocument({ data: event.target.result }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            extractedText += content.items.map(it => it.str).join(" ") + "\n";
          }
        } else if (file.name.endsWith('.docx')) {
          const result = await window.mammoth.extractRawText({ arrayBuffer: event.target.result });
          extractedText = result.value;
        } else {
          extractedText = new TextDecoder().decode(event.target.result);
        }

        const finalContent = `[Parsed from ${file.name}]\n\n${extractedText.trim()}`;
        if (activeTab === 'jd') setJdText(finalContent);
        else setResumeText(finalContent);
      } catch (err) {
        console.error("Parsing error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (file.type === "application/pdf" || file.name.endsWith('.docx')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  }, [activeTab, libsReady]);

  const handleScreen = () => {
    if (screenCount >= MAX_FREE_SCREENS) return;
    setLoading(true);
    setScreenCount(prev => prev + 1);

    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        summary: "Top-tier alignment. Candidate's experience with 45% latency reduction directly solves the 'sub-100ms performance' requirement.",
        strengths: [
          "Proven 45% latency reduction in high-scale payment engines.",
          "Architecture expert: Scaled AWS infra from 50 to 500+ microservices.",
          "Leadership: Mentored 15+ engineers through complex migrations.",
          "Database Mastery: 60% improvement in PostgreSQL query load times.",
          "Niche Fit: Deep expertise in FinTech security (PCI-DSS, SOC2)."
        ],
        gaps: [
          "Limited explicit detail on React 19 specific features.",
          "Lacks specific AWS EKS migration case study metrics.",
          "No mention of Go-based security implementation details."
        ],
        interviewQuestions: [
          "Describe the specific architectural bottlenecks you resolved to achieve the 45% latency reduction.",
          "How do you approach team mentorship when scaling from 5 to 15 engineers?",
          "Walk us through a failed migration strategy you've encountered and how you pivoted.",
          "How do you ensure accessibility standards are met in a high-velocity UI team?",
          "What is your strategy for maintaining data consistency across 500+ microservices?"
        ]
      });
      setLoading(false);
    }, 1500);
  };

  const generateEmail = (type) => {
    const subject = type === 'outreach' ? "Subject: Your work on payment engines" : "Subject: Interview Invitation - Recruit-IQ";
    const body = type === 'outreach' 
      ? `Hi Alex,\n\nI saw your work at FinTech Solutions and was impressed by the 45% latency reduction you achieved. We are scaling our digital banking platform and need your expertise in AWS and distributed systems.\n\nAre you open to a 15-minute chat?\n\nBest,\n[Hiring Manager]`
      : `Hi Alex,\n\nWe were impressed by your background in FinTech architecture. We would love to invite you to a technical screen to discuss your approach to scaling microservices.\n\nPlease let us know your availability.\n\nBest,\nRecruit-IQ Team`;
    setEmailDraft(`${subject}\n\n${body}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-200 font-sans">
      
      {/* HEADER */}
      <header className="h-20 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center">
            <Icons.Zap />
          </div>
          <span className="text-xl font-black uppercase tracking-tighter text-white">{APP_NAME}</span>
        </div>
        <div className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
          {MAX_FREE_SCREENS - screenCount} Screens Left
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6 md:p-10 space-y-10">
        
        {/* QUICK START GUIDE */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
           <div className="flex items-center gap-4">
             <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg">1</span>
             <p className="text-xs font-bold uppercase text-slate-300">Set JD</p>
           </div>
           <div className="flex items-center gap-4">
             <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg">2</span>
             <p className="text-xs font-bold uppercase text-slate-300">Upload Resume</p>
           </div>
           <div className="flex items-center gap-4">
             <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg">3</span>
             <p className="text-xs font-bold uppercase text-slate-300">Screen synergy</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
          
          {/* INPUTS */}
          <section className="bg-[#0f172a] rounded-[3rem] border border-slate-800 flex flex-col h-[750px] overflow-hidden shadow-2xl">
            <div className="flex p-2 bg-[#020617]/40 border-b border-slate-800">
              <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl transition-all ${activeTab === 'jd' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}>
                <span className="inline-block w-4 h-4 rounded-full mr-2 bg-blue-600 text-white text-[8px]">1</span> JD {jdText.length > 5 && <Icons.Check />}
              </button>
              <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl transition-all ${activeTab === 'resume' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}>
                <span className="inline-block w-4 h-4 rounded-full mr-2 bg-indigo-600 text-white text-[8px]">2</span> Resume {resumeText.length > 5 && <Icons.Check />}
              </button>
            </div>

            <div className="p-4 border-b border-slate-800 bg-[#020617]/20 flex justify-between items-center px-8">
               <label className="flex items-center gap-2 cursor-pointer bg-blue-600/10 px-5 py-2.5 rounded-2xl border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase hover:bg-blue-600/20 transition-all">
                 <Icons.Upload /> Upload File
                 <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
               </label>
               <button onClick={() => { setJdText(FULL_SAMPLE_JD); setResumeText(FULL_SAMPLE_RESUME); }} className="text-[10px] font-bold uppercase text-slate-500 hover:text-white transition-colors underline underline-offset-4 decoration-slate-700">Load Full Samples</button>
            </div>

            <textarea 
              className="flex-1 p-8 bg-transparent outline-none text-slate-300 resize-none font-medium leading-relaxed custom-scrollbar" 
              placeholder={`Paste or upload ${activeTab === 'jd' ? 'Job Description' : 'Resume'}...`} 
              value={activeTab === 'jd' ? jdText : resumeText}
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
            />

            <div className="p-8 border-t border-slate-800">
              <button onClick={handleScreen} disabled={loading} className="w-full py-6 rounded-3xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                <span className="bg-white text-emerald-600 w-5 h-5 rounded-full flex items-center justify-center text-[9px]">3</span>
                {loading ? "Analyzing Alignment..." : "Screen Candidate synergy"}
              </button>
            </div>
          </section>

          {/* OUTPUTS */}
          <section className="space-y-8 overflow-y-auto max-h-[750px] pr-2 custom-scrollbar">
            {!analysis && !loading ? (
               <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex items-center justify-center text-slate-600 italic">Awaiting synergy scan...</div>
            ) : analysis && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                <div className="bg-[#0f172a] rounded-[3rem] p-10 border border-slate-800 text-center">
                   <div className="w-32 h-32 mx-auto rounded-full border-[8px] border-slate-800 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl font-black text-white shadow-2xl mb-6">
                     {analysis.matchScore}%
                   </div>
                   <p className="text-lg text-slate-300 italic">"{analysis.summary}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-[#0f172a] border border-emerald-900/30 rounded-3xl p-6">
                      <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-4 flex items-center gap-2"><Icons.Check /> 5 Strengths</h4>
                      <ul className="space-y-3">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-slate-300 leading-relaxed">• {s}</li>
                        ))}
                      </ul>
                   </div>
                   <div className="bg-[#0f172a] border border-rose-900/30 rounded-3xl p-6">
                      <h4 className="text-[10px] font-black uppercase text-rose-500 mb-4 flex items-center gap-2"><Icons.Alert /> 3 Gaps</h4>
                      <ul className="space-y-3">
                        {analysis.gaps.map((g, i) => (
                          <li key={i} className="text-xs text-slate-300 leading-relaxed">• {g}</li>
                        ))}
                      </ul>
                   </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6">
                   <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4">Outreach Tools</h4>
                   <div className="flex gap-3 mb-4">
                      <button onClick={() => generateEmail('outreach')} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-black uppercase text-white flex items-center justify-center gap-2"><Icons.Mail /> Outreach</button>
                      <button onClick={() => generateEmail('invite')} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-[10px] font-black uppercase text-white">Interview Invite</button>
                   </div>
                   {emailDraft && <div className="bg-slate-950 p-4 rounded-xl text-xs text-slate-300 whitespace-pre-wrap italic">{emailDraft}</div>}
                </div>

                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-3xl p-6">
                   <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-4">Interview Guide</h4>
                   <div className="space-y-4">
                     {analysis.interviewQuestions.map((q, i) => (
                       <div key={i} className="bg-[#020617] p-4 rounded-xl text-xs text-slate-300 italic border border-slate-800">"{q}"</div>
                     ))}
                   </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-800 bg-[#0f172a] py-8 px-10 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <div>&copy; {COPYRIGHT}</div>
        <div className="flex gap-8">
          <a href="#">Privacy Policy</a> <a href="#">Terms & Conditions</a> <a href="#">Support</a>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}
