import React, { useState, useEffect, useCallback } from 'react';

const APP_NAME = "Recruit-IQ";
const COPYRIGHT = "Core Creativity AI 2026";
const MAX_FREE_SCREENS = 3;

const FULL_SAMPLE_JD = `## SENIOR FULL STACK ENGINEER (FINTECH)
- Lead technical architecture for digital banking.
- 8+ years experience in Node.js, React, and AWS.
- Scale services handling $500M+ daily volume.`;

const FULL_SAMPLE_RESUME = `ALEX RIVERA | San Francisco, CA
- Lead Engineer: Reduced p99 latency by 45% at FinTech Solutions.
- Expert in TypeScript, React, Node.js, and EKS.`;

export default function RecruitIQApp() {
  const [activeTab, setActiveTab] = useState('jd'); 
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [screenCount, setScreenCount] = useState(0);
  const [emailDraft, setEmailDraft] = useState('');
  const [salaryIntel, setSalaryIntel] = useState(null);

  // LOGIC: Fixed Resume/JD Parsing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (activeTab === 'jd') setJdText(content);
      else setResumeText(content);
      setLoading(false);
    };
    reader.readAsText(file);
  };

  // LOGIC: Screening
  const handleScreen = () => {
    setLoading(true);
    setScreenCount(prev => prev + 1);
    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        summary: "Exceptional technical alignment with strong leadership evidence.",
        strengths: [
          "Proven 45% reduction in system latency for financial engines.",
          "Scalability expert: Scaled AWS infra from 50 to 500+ services.",
          "Strong leadership: Mentored 15+ engineers during migrations.",
          "Direct experience with high-volume transaction processing ($500M+).",
          "Advanced React architecture and design system implementation."
        ],
        gaps: [
          "Limited detail on Go-based security implementation specifics.",
          "Resume lacks explicit metrics for EKS cost optimization.",
          "No mention of direct SOC2 compliance audit leadership."
        ],
        interviewQuestions: [
          "How did you identify the specific bottlenecks for the 45% latency reduction?",
          "Walk me through your mentorship approach for a team of 15 engineers.",
          "How would you migrate a legacy system to EKS with zero downtime?",
          "Explain your strategy for maintaining data consistency across 500 microservices.",
          "How do you prioritize security in a high-velocity development cycle?"
        ]
      });
      setSalaryIntel({ low: 165000, med: 195000, high: 245000 });
      setLoading(false);
    }, 1500);
  };

  // LOGIC: Email Generator
  const generateEmail = (type) => {
    const subject = type === 'outreach' ? "Exploring a Lead Role at Recruit-IQ" : "Interview Invite: Senior Engineer at Recruit-IQ";
    const body = `Hi Alex,\n\nI was impressed by your work on latency reduction. We'd love to discuss how your expertise fits our scaling goals.\n\nBest,\nRecruit-IQ Team`;
    setEmailDraft(`Subject: ${subject}\n\n${body}`);
  };

  // LOGIC: Download Interview Guide
  const downloadGuide = () => {
    const content = `Recruit-IQ Interview Guide\n${analysis.interviewQuestions.map((q, i) => `${i+1}. ${q}`).join('\n')}`;
    const blob = new Blob([content], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "RecruitIQ_Guide.doc";
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-200 font-sans">
      <header className="h-20 border-b border-slate-800 bg-[#0f172a]/80 flex items-center justify-between px-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full opacity-20 animate-pulse" />
          </div>
          <span className="text-xl font-black uppercase text-white">{APP_NAME}</span>
        </div>
        <div className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full">
          {MAX_FREE_SCREENS - screenCount} Screens Left
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-10 space-y-10">
        {/* QUICK START */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex justify-between">
           <div className="flex items-center gap-4"><span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span><p className="text-xs uppercase font-bold">Job Description</p></div>
           <div className="flex items-center gap-4"><span className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span><p className="text-xs uppercase font-bold">Resume</p></div>
           <div className="flex items-center gap-4"><span className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span><p className="text-xs uppercase font-bold">Screen</p></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
          {/* INPUT PANEL */}
          <section className="bg-[#0f172a] rounded-[3rem] border border-slate-800 flex flex-col h-[750px] overflow-hidden shadow-2xl">
            <div className="flex p-2 bg-[#020617]/40 border-b border-slate-800">
              <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl ${activeTab === 'jd' ? 'bg-slate-800' : 'text-slate-500'}`}>
                <span className="bg-blue-600 w-4 h-4 rounded-full inline-block mr-2 text-center leading-4 text-white">1</span> JD {jdText.length > 5 && "✓"}
              </button>
              <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl ${activeTab === 'resume' ? 'bg-slate-800' : 'text-slate-500'}`}>
                <span className="bg-indigo-600 w-4 h-4 rounded-full inline-block mr-2 text-center leading-4 text-white">2</span> Resume {resumeText.length > 5 && "✓"}
              </button>
            </div>
            <div className="p-4 flex justify-between px-8 bg-[#020617]/20 border-b border-slate-800">
              <label className="bg-blue-600/10 px-4 py-2 rounded-xl text-blue-400 text-[10px] font-black uppercase cursor-pointer">
                Upload File <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
              <button onClick={() => { setJdText(FULL_SAMPLE_JD); setResumeText(FULL_SAMPLE_RESUME); }} className="text-[10px] text-slate-500 underline font-black uppercase">Load Samples</button>
            </div>
            <textarea className="flex-1 p-10 bg-transparent outline-none text-slate-300 resize-none font-medium leading-relaxed" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
            <div className="p-8 border-t border-slate-800">
              <button onClick={handleScreen} className="w-full py-6 rounded-3xl bg-emerald-600 font-black uppercase text-sm flex items-center justify-center gap-3">
                <span className="bg-white text-emerald-600 w-5 h-5 rounded-full text-[9px]">3</span> {loading ? "Analyzing..." : "Screen Candidate"}
              </button>
            </div>
          </section>

          {/* OUTPUT PANEL */}
          <section className="space-y-8 overflow-y-auto max-h-[750px]">
            {analysis && (
              <div className="space-y-8">
                <div className="bg-[#0f172a] rounded-[3rem] p-10 border border-slate-800 text-center">
                   <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-black">{analysis.matchScore}%</div>
                   <p className="mt-6 italic">"{analysis.summary}"</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900 border border-emerald-900/30 p-6 rounded-3xl">
                    <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-4">5 Strengths</h4>
                    <ul className="text-xs space-y-2">{analysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                  </div>
                  <div className="bg-slate-900 border border-rose-900/30 p-6 rounded-3xl">
                    <h4 className="text-[10px] font-black uppercase text-rose-500 mb-4">3 Gaps</h4>
                    <ul className="text-xs space-y-2">{analysis.gaps.map((g, i) => <li key={i}>• {g}</li>)}</ul>
                  </div>
                </div>
                <div className="bg-indigo-950/20 p-6 rounded-3xl border border-indigo-500/20">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[10px] font-black uppercase text-indigo-400">Interview Guide</h4>
                    <button onClick={downloadGuide} className="bg-indigo-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">Download Guide</button>
                  </div>
                  {analysis.interviewQuestions.map((q, i) => <div key={i} className="bg-[#020617] p-4 rounded-xl text-xs mb-3 italic">"{q}"</div>)}
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 mb-4">Email Outreach</h4>
                  <div className="flex gap-4 mb-4">
                    <button onClick={() => generateEmail('outreach')} className="flex-1 bg-slate-800 py-3 rounded-xl text-[10px] font-black uppercase">Outreach</button>
                    <button onClick={() => generateEmail('invite')} className="flex-1 bg-blue-600 py-3 rounded-xl text-[10px] font-black uppercase">Invite</button>
                  </div>
                  {emailDraft && <div className="bg-slate-950 p-4 rounded-xl text-[10px] whitespace-pre-wrap">{emailDraft}</div>}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-800 bg-[#0f172a] py-8 px-10 flex justify-between items-center text-[10px] font-bold uppercase text-slate-500">
        <div>&copy; {COPYRIGHT}</div>
        <div className="flex gap-8">
          <a href="#">Privacy</a> <a href="#">Terms</a> <button onClick={() => alert("Support: support@recruit-iq.com")}>Support</button>
        </div>
      </footer>
    </div>
  );
}
