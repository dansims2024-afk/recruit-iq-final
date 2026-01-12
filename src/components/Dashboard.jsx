import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser } from "@clerk/clerk-react";
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

  // --- NEW: PDF & DOCX READER ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    let text = "";
    try {
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        // PDF Parsing using the script from index.html
        const pdfjs = window.pdfjsLib;
        const loadingTask = pdfjs.getDocument(URL.createObjectURL(file));
        const pdf = await loadingTask.promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + "\n";
        }
        text = fullText;
      } else {
        text = await file.text();
      }
      
      // Set text to active tab
      if (activeTab === 'jd') setJdText(text);
      else setResumeText(text);

    } catch (err) { 
      console.error(err);
      alert("Could not read file. Please copy and paste the text instead."); 
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(79, 70, 229); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Recruit-IQ Intelligence Report", 20, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Candidate Match Analysis & Interview Guide`, 20, 30);

    // Score & Name
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const cName = analysis.candidate_name || "Candidate Report";
    doc.text(`${cName}`, 20, 55);
    doc.setTextColor(79, 70, 229);
    doc.text(`Match Score: ${analysis.score}%`, 140, 55);
    
    // Summary
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysis.summary || "No summary generated.", 170);
    doc.text(summaryLines, 20, 70);
    let currentY = 70 + (summaryLines.length * 6) + 15;

    // Strengths
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); 
    doc.text("Key Strengths", 20, currentY);
    currentY += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    (analysis.strengths || []).forEach((s) => {
      if (currentY > 280) { doc.addPage(); currentY = 20; }
      const sLines = doc.splitTextToSize(`• ${s}`, 170);
      doc.text(sLines, 20, currentY);
      currentY += (sLines.length * 6) + 2;
    });
    currentY += 10;

    // Gaps
    doc.setFont("helvetica", "bold");
    doc.setTextColor(244, 63, 94); 
    doc.text("Critical Gaps", 20, currentY);
    currentY += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    (analysis.gaps || []).forEach((g) => {
      if (currentY > 280) { doc.addPage(); currentY = 20; }
      const gLines = doc.splitTextToSize(`• ${g}`, 170);
      doc.text(gLines, 20, currentY);
      currentY += (gLines.length * 6) + 2;
    });

    // Interview Guide
    doc.addPage();
    doc.setFillColor(243, 244, 246); 
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
    (analysis.questions || []).forEach((q, i) => {
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
      let result = JSON.parse(data.candidates[0].content.parts[0].text);
      
      // --- CRASH PREVENTION: SANITIZE DATA ---
      // This ensures 'forEach' never crashes the app if AI returns null
      result.strengths = Array.isArray(result.strengths) ? result.strengths : [];
      result.gaps = Array.isArray(result.gaps) ? result.gaps : [];
      result.questions = Array.isArray(result.questions) ? result.questions : [];
      
      setAnalysis(result);
      
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
    } catch (err) { 
      console.error(err);
      alert("Analysis failed. Please check your API key or try again."); 
    } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen font-sans">
      
      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/60 animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl group animate-in zoom-in-95 duration-300">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[2.5rem] blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
              <div className="p-10 md:w-3/5 flex flex-col justify-center relative">
                 <div className="mb-6"><img src={logo} alt="Recruit-IQ Logo" className="h-10 w-auto opacity-90" /></div>
                 <h2 className="text-2xl font-black text-white mb-2 leading-tight">Scale Your Hiring <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Without Limits.</span></h2>
                 <p className="text-slate-400 text-sm mb-8 leading-relaxed">You've used your 3 free screenings. Upgrade to unlock unlimited AI analysis.</p>
                 <a href={STRIPE_URL} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-bold rounded-xl uppercase tracking-wider hover:scale-[1.02] transition-all text-xs">Upgrade Now - $29/mo</a>
                 <button onClick={() => window.location.reload()} className="text-center text-[10px] text-slate-500 mt-4 hover:text-white transition-colors w-full">I'll Upgrade Later</button>
              </div>
              <div className="hidden md:flex md:w-2/5 bg-slate-900/50 border-l border-slate-800 items-center justify-center p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                 <div className="text-center relative z-10">
                    <div className="text-6xl mb-4">💎</div>
                    <h3 className="font-bold text-white text-lg">Pro Access</h3>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-end items-center">
        <div className="bg-indigo-500/10 border border-indigo-500/50 px-4 py-2 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
           {isPro ? "PRO INTEL ACTIVE" : `FREE TRIAL: ${3 - scanCount} SCANS LEFT`}
        </div>
      </div>

      {/* QUICK START */}
      <div className="grid md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border transition-all ${jdReady ? 'bg-indigo-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-center mb-2">
                <h4 className={`font-bold text-[10px] uppercase tracking-widest ${jdReady ? 'text-emerald-400' : 'text-slate-400'}`}>1. Define Requirements</h4>
                {jdReady && <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✓</span>}
             </div>
             <p className="text-[11px] text-slate-300">Upload or Paste the Job Description.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${resumeReady ? 'bg-indigo-900/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-slate-800/30 border-slate-700'}`}>
             <div className="flex justify-between items-center mb-2">
                <h4 className={`font-bold text-[10px] uppercase tracking-widest ${resumeReady ? 'text-emerald-400' : 'text-slate-400'}`}>2. Input Candidate</h4>
                {resumeReady && <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">✓</span>}
             </div>
             <p className="text-[11px] text-slate-300">Upload or Paste Resume.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${analysis ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700'}`}>
             <h4 className="font-bold text-[10px] uppercase tracking-widest mb-2 text-indigo-400">3. Analyze & Act</h4>
             <p className="text-[11px] text-slate-300">Get match score, interview guide, and outreach email.</p>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl">
            <div className="flex gap-3 mb-6">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === 'jd' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>
                 1. Job Description {jdReady && <span className="text-emerald-300 font-bold text-sm">✓</span>}
               </button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>
                 2. Resume {resumeReady && <span className="text-emerald-300 font-bold text-sm">✓</span>}
               </button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 hover:text-white transition-colors">
                Upload or Paste File <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400">Load Full Samples</button>
            </div>
            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed mb-6"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content here..."
            />
            <button onClick={handleScreen} disabled={loading} className="py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-white bg-gradient-to-r from-indigo-600 to-blue-600 shadow-xl hover:shadow-indigo-500/25 transition-all">
              {loading ? "Analyzing..." : `3. Screen Candidate (${isPro ? 'Unlimited' : `${3 - scanCount} Free Left`}) →`}
            </button>
        </div>

        <div className="h-[850px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Match Confidence</h3>
                  <div className="text-white font-bold text-lg mb-4">{analysis.candidate_name}</div>
                  <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto border border-slate-700">
                    <span>📄</span> Download Report & Guide
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl">
                    <h4 className="text-emerald-400 font-bold uppercase text-[10px] mb-3">Strengths</h4>
                    <ul className="text-[11px] text-slate-300 space-y-2">{(analysis.strengths || []).map((s, i) => <li key={i}>• {s}</li>)}</ul>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl">
                    <h4 className="text-rose-400 font-bold uppercase text-[10px] mb-3">Gaps</h4>
                    <ul className="text-[11px] text-slate-300 space-y-2">{(analysis.gaps || []).map((g, i) => <li key={i}>• {g}</li>)}</ul>
                  </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-indigo-400 font-bold uppercase text-[10px]">Targeted Interview Questions</h4>
                    <button onClick={downloadPDF} className="text-slate-400 hover:text-white text-[10px] underline">Download Guide</button>
                  </div>
                  <ul className="text-[11px] text-slate-300 space-y-3">
                    {(analysis.questions || []).map((q, i) => <li key={i} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">"{q}"</li>)}
                  </ul>
                </div>

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
