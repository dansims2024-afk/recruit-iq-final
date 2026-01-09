import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser } from "@clerk/clerk-react";

// --- SAMPLE DATA ---
const SAMPLE_JD = `JOB TITLE: Senior FinTech Architect
LOCATION: New York, NY
SALARY: $220k - $260k + Equity

OVERVIEW:
Vertex Financial is a high-frequency trading firm rebuilding our core engine for sub-millisecond latency.

RESPONSIBILITIES:
- Architect high-availability microservices on AWS (EKS, Lambda).
- Optimize low-latency trading algorithms.
- Lead a team of 8-10 senior engineers.

QUALIFICATIONS:
- 10+ years software engineering experience.
- Deep expertise in AWS cloud-native services.`;

const SAMPLE_RESUME = `ALEXANDER MERCER
Senior Principal Engineer | alex.mercer@example.com

SUMMARY:
Lead Engineer with 12 years experience building scalable financial systems. 

EXPERIENCE:
Innovate Financial | Lead Engineer | 2019 - Present
- Migrated core trading engine to AWS EKS.
- Reduced latency by 45% via Redis caching strategies.

SKILLS:
- AWS, Docker, Kubernetes, Terraform, Node.js, Go, Python.`;

export default function Dashboard() {
  const { isSignedIn } = useUser();
  
  // State
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Freemium State
  const [screensLeft, setScreensLeft] = useState(3);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const jdComplete = jdText.length > 50; 
  const resumeComplete = resumeText.length > 50;

  // --- FILE HANDLING ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileInfo = { 
      name: file.name, 
      size: (file.size / 1024).toFixed(1) + ' KB', 
      type: file.name.split('.').pop().toUpperCase() 
    };

    if (activeTab === 'jd') setJdFile(fileInfo);
    else setResumeFile(fileInfo);

    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else {
        text = await file.text();
      }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
    } catch (err) {
      alert("Error reading file. Please paste text.");
    }
  };

  const loadSamples = () => {
    setJdText(SAMPLE_JD);
    setResumeText(SAMPLE_RESUME);
    setJdFile({ name: "Job_Description.docx", size: "12 KB", type: "DOCX" });
    setResumeFile({ name: "Alex_Mercer.pdf", size: "45 KB", type: "PDF" });
  };

  // --- WORD DOC DOWNLOAD ---
  const downloadReport = () => {
    if (!analysis) return;
    
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Candidate Report</title></head>
      <body style="font-family: Arial, sans-serif;">
        <div style="background-color: #0f172a; color: white; padding: 20px; text-align: center;">
          <h1 style="color: #10b981; margin: 0;">Recruit-IQ</h1>
          <p style="margin: 5px 0 0 0;">AI Candidate Intelligence Report</p>
        </div>
        <br/>
        <h2 style="color: #333;">Match Score: ${analysis.score}%</h2>
        <p><strong>Summary:</strong> ${analysis.summary}</p>
        <hr/>
        <h3 style="color: #10b981;">Interview Questions</h3>
        <ul>
          ${analysis.questions.map(q => `<li>${q}</li>`).join('')}
        </ul>
        <hr/>
        <h3 style="color: #ef4444;">Critical Gaps</h3>
        <ul>
          ${analysis.gaps.map(g => `<li>${g}</li>`).join('')}
        </ul>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RecruitIQ_Report_${new Date().toISOString().slice(0,10)}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- LIVE SCREENING ---
  const handleScreen = async () => {
    if (screensLeft <= 0) {
      setShowUpgrade(true);
      return;
    }
    if (!jdText || !resumeText) return alert("Please provide both documents.");
    
    setLoading(true);
    // API KEY
    const apiKey = "AIzaSyDLxFEIhTaBbZTIBWR7JxVnuOx1spxr2A0"; 

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Act as a recruiter. Analyze JD and Resume.
              JD: ${jdText}
              Resume: ${resumeText}
              Return JSON: {
                "score": (0-100 integer),
                "summary": "3 sentence executive summary",
                "strengths": ["strength 1", "strength 2", "strength 3", "strength 4", "strength 5"],
                "gaps": ["gap 1", "gap 2", "gap 3"],
                "questions": ["interview Q1", "interview Q2", "interview Q3"],
                "email_subject": "subject line",
                "email_body": "short outreach email"
              }`
            }]
          }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
      
      // Fix decimal scores (e.g., 0.9 -> 90)
      if (parsed.score < 1) parsed.score = Math.round(parsed.score * 100);
      
      setAnalysis(parsed);
      setScreensLeft(prev => prev - 1);
      
    } catch (err) {
      console.error(err);
      alert("Connection interrupted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-slate-950 min-h-screen font-sans relative">
      
      {/* UPGRADE MODAL */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-emerald-500/50 p-8 rounded-[2rem] max-w-md w-full text-center shadow-2xl shadow-emerald-900/40 relative animate-in zoom-in-95">
            <button onClick={() => setShowUpgrade(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">💎</div>
            <h2 className="text-2xl font-black text-white mb-2">Upgrade to Pro</h2>
            <p className="text-slate-400 mb-6">You've used your 3 free daily screens. Unlock unlimited AI analysis and premium export features.</p>
            <button className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl uppercase tracking-widest transition-all">
              Unlock Unlimited ($29/mo)
            </button>
          </div>
        </div>
      )}

      {/* QUICK START GUIDE (Restored) */}
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-emerald-400 font-black uppercase text-xs tracking-widest">🚀 Quick Start Guide</h2>
          <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10px] font-bold">Free Screens Left: <span className="text-white">{screensLeft}</span></span>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-xs text-slate-400">
          <div className="bg-black/20 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl group-hover:text-blue-500 transition-colors">1</div>
            <p className="text-blue-400 font-bold mb-2 uppercase tracking-wider">Define Role</p>
            Paste the Job Description. The AI builds a semantic benchmark for seniority, tech stack, and culture fit.
          </div>
          <div className="bg-black/20 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl group-hover:text-indigo-500 transition-colors">2</div>
            <p className="text-indigo-400 font-bold mb-2 uppercase tracking-wider">Load Candidate</p>
            Upload the Resume. Gemini 2.0 Flash extracts experience and infers soft skills beyond just keywords.
          </div>
          <div className="bg-black/20 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl group-hover:text-emerald-500 transition-colors">3</div>
            <p className="text-emerald-400 font-bold mb-2 uppercase tracking-wider">Get Intel</p>
            Receive a Match Score, Interview Questions, and Outreach Email tailored to the candidate's gaps.
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT PANEL */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[900px] shadow-2xl relative">
            
            {/* TABS & FILE UPLOAD */}
            <div className="flex gap-3 mb-4">
               <button 
                 onClick={() => setActiveTab('jd')} 
                 className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase transition-all flex items-center justify-center gap-3 ${activeTab === 'jd' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-slate-800 text-slate-500'}`}
               >
                 <span className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-[10px]">1</span>
                 Job Description
               </button>
               <button 
                 onClick={() => setActiveTab('resume')} 
                 className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase transition-all flex items-center justify-center gap-3 ${activeTab === 'resume' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'bg-slate-800 text-slate-500'}`}
               >
                 <span className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-[10px]">2</span>
                 Resume
               </button>
            </div>

            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-black/30 hover:bg-black/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-800 text-slate-400 transition">
                Upload File
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={loadSamples} className="flex-1 bg-black/30 hover:bg-black/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-800 text-slate-400 transition">Load Sample</button>
            </div>

            {/* CONTENT AREA */}
            <textarea 
              className="flex-1 bg-black/20 resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed mb-4 focus:border-slate-600 transition-colors"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={activeTab === 'jd' ? "Paste Job Description..." : "Paste Resume..."}
            />

            {/* SCREEN BUTTON (Step 3) */}
            <button 
              onClick={handleScreen} 
              disabled={loading}
              className="py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all shadow-xl shadow-emerald-900/50 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading ? (
                 "Analyzing..." 
               ) : (
                 <>
                   <span className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-[10px]">3</span>
                   Screen Candidate
                 </>
               )}
            </button>
        </div>

        {/* RIGHT PANEL: RESULTS */}
        <div className="h-[900px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
            {analysis ? (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-6 pb-10">
                {/* SCORE CARD */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500"></div>
                  <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center text-4xl font-black mb-6 shadow-2xl ${analysis.score > 75 ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-amber-500 text-white shadow-amber-500/30'}`}>
                    {analysis.score}%
                  </div>
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-3">Match Confidence</h3>
                  <p className="text-slate-200 text-sm leading-relaxed font-medium">"{analysis.summary}"</p>
                </div>

                {/* STRENGTHS & GAPS */}
                <div className="grid grid-cols-1 gap-4">
                   <div className="bg-slate-900/80 p-6 rounded-[2rem] border border-emerald-500/20">
                      <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-4 tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Key Strengths
                      </h4>
                      <ul className="space-y-3">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-slate-300 flex gap-3"><span className="text-emerald-500">✓</span> {s}</li>
                        ))}
                      </ul>
                   </div>
                   <div className="bg-slate-900/80 p-6 rounded-[2rem] border border-rose-500/20">
                      <h4 className="text-[10px] font-black uppercase text-rose-400 mb-4 tracking-widest flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical Gaps
                      </h4>
                      <ul className="space-y-3">
                        {analysis.gaps.map((g, i) => (
                          <li key={i} className="text-xs text-slate-300 flex gap-3"><span className="text-rose-500">!</span> {g}</li>
                        ))}
                      </ul>
                   </div>
                </div>

                {/* INTERVIEW QUESTIONS DOWNLOAD */}
                <div className="bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-500/20">
                    <div className="flex justify-between items-end mb-4">
                       <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Interview Guide</h4>
                       <button onClick={downloadReport} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-2">
                          Download Word Doc <span>↓</span>
                       </button>
                    </div>
                    <ul className="space-y-3 mb-4">
                        {analysis.questions.map((q, i) => (
                          <li key={i} className="text-xs text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-800">"{q}"</li>
                        ))}
                    </ul>
                </div>

                {/* EMAIL GENERATOR */}
                <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
                    <h4 className="text-[10px] font-black uppercase text-blue-400 mb-4 tracking-widest">Draft Outreach</h4>
                    <div className="bg-black/30 p-4 rounded-xl border border-slate-800">
                       <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Subject</p>
                       <p className="text-xs text-white mb-4 font-medium">{analysis.email_subject}</p>
                       <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Body</p>
                       <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{analysis.email_body}</p>
                    </div>
                </div>

              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] gap-6 px-12 text-center opacity-50">
                 <div className="text-6xl grayscale">🧠</div>
                 <p className="uppercase tracking-widest leading-loose">
                   AI Ready. Complete Steps 1 & 2.
                 </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
