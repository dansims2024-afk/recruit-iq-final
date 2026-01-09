import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, SignUpButton } from "@clerk/clerk-react"; // Added SignUpButton

// --- CONFIGURATION ---
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

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
  const { isSignedIn, user } = useUser();
  
  // App State
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Freemium & Stripe State
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [guestUsage, setGuestUsage] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const GUEST_LIMIT = 3;

  // Load usage and check for Stripe success on mount
  useEffect(() => {
    const storedUsage = localStorage.getItem('riq_guest_usage');
    if (storedUsage) setGuestUsage(parseInt(storedUsage));

    // Detect if user just returned from Stripe
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      setIsPro(true);
      // Clean URL so the user doesn't see the query param
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const jdComplete = jdText.length > 50; 
  const resumeComplete = resumeText.length > 50;

  // --- PDF EXTRACTION (CDN METHOD) ---
  const extractPdfText = async (file) => {
    try {
      const pdfjs = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/+esm');
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += pageText + "\n";
      }
      return fullText;
    } catch (err) {
      console.error("PDF Read Error:", err);
      return null;
    }
  };

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
      } else if (file.name.endsWith('.pdf')) {
        const extracted = await extractPdfText(file);
        text = extracted ? extracted : `[ERROR]. Please copy/paste text directly from the PDF.`;
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

  // --- PROFESSIONAL WORD REPORT ---
  const downloadReport = () => {
    if (!analysis) return;
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Recruit-IQ Report</title>
        <style>
          body { font-family: 'Calibri', 'Helvetica', sans-serif; font-size: 11pt; }
          .header { background-color: #0f172a; padding: 30px; text-align: center; color: white; border-bottom: 4px solid #10b981; }
          .title { font-size: 24pt; font-weight: bold; color: #10b981; margin-bottom: 5px; }
          .subtitle { font-size: 12pt; color: #e2e8f0; }
          .section-title { font-size: 14pt; font-weight: bold; color: #0f172a; margin-top: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
          .score-box { background-color: #ecfdf5; border: 1px solid #10b981; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .score-val { font-size: 32pt; font-weight: bold; color: #059669; }
          .grid-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .grid-td { width: 50%; vertical-align: top; padding: 10px; border: 1px solid #cbd5e1; }
          .strength-header { color: #059669; font-weight: bold; text-transform: uppercase; font-size: 10pt; }
          .gap-header { color: #dc2626; font-weight: bold; text-transform: uppercase; font-size: 10pt; }
          .footer { font-size: 8pt; color: #64748b; text-align: center; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          li { margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Recruit-IQ</div>
          <div class="subtitle">Confidential Candidate Intelligence Report</div>
        </div>
        <div class="score-box">
          <div class="score-val">${analysis.score}% Match Score</div>
          <p><strong>Executive Summary:</strong> ${analysis.summary}</p>
        </div>
        <table class="grid-table">
          <tr>
            <td class="grid-td" style="background-color: #f0fdf4;">
              <div class="strength-header">Key Strengths</div>
              <ul>
                ${analysis.strengths.map(s => `<li>${s}</li>`).join('')}
              </ul>
            </td>
            <td class="grid-td" style="background-color: #fef2f2;">
              <div class="gap-header">Critical Gaps</div>
              <ul>
                ${analysis.gaps.map(g => `<li>${g}</li>`).join('')}
              </ul>
            </td>
          </tr>
        </table>
        <div class="section-title">Interview Guide</div>
        <p>Use these targeted questions to verify the candidate's fit:</p>
        <ul>
          ${analysis.questions.map(q => `<li><strong>Q:</strong> ${q}</li>`).join('')}
        </ul>
        <div class="footer">
          Generated by Recruit-IQ AI Analysis • ${new Date().toLocaleDateString()} • Strictly Confidential
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RecruitIQ_Report_${analysis.score}Match.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- LIVE SCREENING LOGIC ---
  const handleScreen = async () => {
    // 1. GUEST LIMIT CHECK
    if (!isSignedIn) {
      if (guestUsage >= GUEST_LIMIT) {
        setShowUpgrade(true);
        return;
      }
    }

    // 2. PRO SUBSCRIPTION CHECK
    if (isSignedIn && !isPro) {
      setShowUpgrade(true);
      return;
    }

    if (!jdText || !resumeText) return alert("Please provide both documents.");
    
    // 3. SECURE API CALL
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return alert("Configuration Error: API Key missing. Check environment variables.");
    }
    
    setLoading(true);

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
      if (parsed.score < 1) parsed.score = Math.round(parsed.score * 100);
      
      setAnalysis(parsed);
      
      // Increment Guest Usage ONLY if not signed in
      if (!isSignedIn) {
        const newUsage = guestUsage + 1;
        setGuestUsage(newUsage);
        localStorage.setItem('riq_guest_usage', newUsage.toString());
      }
      
    } catch (err) {
      console.error(err);
      alert("Analysis interrupted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-slate-950 min-h-screen font-sans relative">
      
      {/* HIGH-IMPACT UPGRADE MODAL */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/80">
          <div className="relative w-full max-w-lg group">
            {/* Pulsing Border */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-600 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-75 animate-pulse transition duration-1000"></div>
            
            <div className="relative bg-slate-900 border border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/60 via-slate-900 to-slate-900 p-10 text-center border-b border-slate-800 relative overflow-hidden">
                 <button onClick={() => setShowUpgrade(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition z-10">✕</button>
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] -z-10"></div>
                 <div className="inline-flex items-center justify-center mb-6 animate-bounce-slow">
                    <span className="text-6xl drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">🚀</span>
                 </div>
                 <h2 className="text-3xl font-black text-white mb-3 tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-200 to-emerald-500">
                   UNLEASH YOUR FULL<br/>HIRING POTENTIAL
                 </h2>
                 <p className="text-slate-300 text-sm font-medium">You've used your 3 free screens. It's time to upgrade.</p>
              </div>

              {/* Body */}
              <div className="p-8 space-y-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-5 p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-all hover:scale-[1.02]">
                       <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">✓</div>
                       <div>
                          <p className="font-black text-base text-white">Unlimited AI Screening</p>
                          <p className="text-xs text-slate-400">Screen 10 or 10,000 candidates. No limits.</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-5 p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-all hover:scale-[1.02]">
                       <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">✓</div>
                       <div>
                          <p className="font-black text-base text-white">Pro Word Exports</p>
                          <p className="text-xs text-slate-400">Download client-ready intelligence reports.</p>
                       </div>
                    </div>
                 </div>

                 {/* CTA Logic */}
                 <div className="pt-4">
                   <div className="flex justify-between items-center mb-4 px-2">
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full">Trial Offer</span>
                      <span className="text-white font-medium"><span className="text-xl font-black">3 Days Free</span></span>
                   </div>
                   
                   {/* ACTION BUTTONS */}
                   {isSignedIn && !isPro ? (
                     // State 1: Signed In, But Skipped Payment -> Force Stripe
                     <a 
                       href={STRIPE_URL}
                       className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-2xl uppercase tracking-widest transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 text-sm"
                     >
                       Complete Trial Setup <span>→</span>
                     </a>
                   ) : (
                     // State 2: Guest -> Create Account -> Auto-Redirect to Stripe
                     <SignUpButton 
                        mode="modal" 
                        forceRedirectUrl={STRIPE_URL}
                        signUpForceRedirectUrl={STRIPE_URL}
                     >
                       <button className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black rounded-2xl uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 text-sm relative overflow-hidden group/btn">
                         <span className="relative z-10 flex items-center gap-2">Create Free Account & Start Trial <span>→</span></span>
                         <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                       </button>
                     </SignUpButton>
                   )}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK START GUIDE */}
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-emerald-400 font-black uppercase text-xs tracking-widest">🚀 Quick Start Guide</h2>
          {isPro ? (
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Pro Active
            </span>
          ) : (
            <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10px] font-bold">
              Guest Screens Left: <span className={`text-white ${guestUsage >= GUEST_LIMIT ? 'text-rose-500' : ''}`}>{Math.max(0, GUEST_LIMIT - guestUsage)}</span>
            </span>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-xs text-slate-400">
          <div className="bg-black/20 p-5 rounded-2xl border border-slate-800">
            <p className="text-blue-400 font-bold mb-2 uppercase tracking-wider">1. Define Role</p>
            Paste the JD. AI benchmarks requirements.
          </div>
          <div className="bg-black/20 p-5 rounded-2xl border border-slate-800">
            <p className="text-indigo-400 font-bold mb-2 uppercase tracking-wider">2. Load Candidate</p>
            Upload Resume. We analyze semantic fit.
          </div>
          <div className="bg-black/20 p-5 rounded-2xl border border-slate-800">
            <p className="text-emerald-400 font-bold mb-2 uppercase tracking-wider">3. Get Intel</p>
            Receive Match Score & Interview Guide.
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[900px] shadow-2xl relative">
            <div className="flex gap-3 mb-4">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase transition-all flex items-center justify-center gap-3 ${activeTab === 'jd' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-slate-800 text-slate-500'}`}>
                 <span className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-[10px]">1</span> Job Description
               </button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-xl text-[11px] font-black uppercase transition-all flex items-center justify-center gap-3 ${activeTab === 'resume' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'bg-slate-800 text-slate-500'}`}>
                 <span className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-[10px]">2</span> Resume
               </button>
            </div>

            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-black/30 hover:bg-black/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-800 text-slate-400 transition">
                Upload File <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={loadSamples} className="flex-1 bg-black/30 hover:bg-black/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-800 text-slate-400 transition">Load Sample</button>
            </div>

            <textarea 
              className="flex-1 bg-black/20 resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed mb-4 focus:border-slate-600 transition-colors"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={activeTab === 'jd' ? "Paste Job Description..." : "Paste Resume..."}
            />

            <button onClick={handleScreen} disabled={loading} className="py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all shadow-xl shadow-emerald-900/50 flex items-center justify-center gap-3 disabled:opacity-50">
               {loading ? "Analyzing..." : <><span className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-[10px]">3</span> Screen Candidate</>}
            </button>
        </div>

        {/* RESULTS PANEL */}
        <div className="h-[900px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
            {analysis ? (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-6 pb-10">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500"></div>
                  <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center text-4xl font-black mb-6 shadow-2xl ${analysis.score > 75 ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-amber-500 text-white shadow-amber-500/30'}`}>
                    {analysis.score}%
                  </div>
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-3">Match Confidence</h3>
                  <p className="text-slate-200 text-sm leading-relaxed font-medium">"{analysis.summary}"</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <div className="bg-slate-900/80 p-6 rounded-[2rem] border border-emerald-500/20">
                      <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-4 tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Key Strengths</h4>
                      <ul className="space-y-3">{analysis.strengths.map((s, i) => <li key={i} className="text-xs text-slate-300 flex gap-3"><span className="text-emerald-500">✓</span> {s}</li>)}</ul>
                   </div>
                   <div className="bg-slate-900/80 p-6 rounded-[2rem] border border-rose-500/20">
                      <h4 className="text-[10px] font-black uppercase text-rose-400 mb-4 tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical Gaps</h4>
                      <ul className="space-y-3">{analysis.gaps.map((g, i) => <li key={i} className="text-xs text-slate-300 flex gap-3"><span className="text-rose-500">!</span> {g}</li>)}</ul>
                   </div>
                </div>

                <div className="bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-500/20">
                    <div className="flex justify-between items-end mb-4">
                       <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Interview Guide</h4>
                       <button onClick={downloadReport} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-2 shadow-lg shadow-indigo-600/20">Download Pro Report <span>↓</span></button>
                    </div>
                    <ul className="space-y-3 mb-4">{analysis.questions.map((q, i) => <li key={i} className="text-xs text-slate-300 bg-slate-900/50 p-3 rounded-xl border border-slate-800">"{q}"</li>)}</ul>
                </div>

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
                 <p className="uppercase tracking-widest leading-loose">AI Ready. Complete Steps 1 & 2.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
