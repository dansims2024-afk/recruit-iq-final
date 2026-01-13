import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk } from "@clerk/clerk-react";
import logo from '../logo.png'; 

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

// --- SAMPLES ---
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
  const clerk = useClerk();
  
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isVerifying, setIsVerifying] = useState(false);

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    window.location.href = `mailto:hello@corecreativityai.com?subject=Support&body=${encodeURIComponent(supportMessage)}`;
    setShowSupportModal(false);
    setSupportMessage('');
    showToast("Email client opened!", "info");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        const loadingTask = window.pdfjsLib.getDocument(URL.createObjectURL(file));
        const pdf = await loadingTask.promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + "\n";
        }
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} uploaded!`, "success");
    } catch (err) { showToast("Upload failed.", "error"); }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const cName = analysis.candidate_name || "Candidate";

    // Header
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text("RECRUIT-IQ INTELLIGENCE REPORT", 20, 25);
    
    // Summary Section
    doc.setTextColor(0, 0, 0); doc.setFontSize(16); doc.text(cName.toUpperCase(), 20, 55);
    doc.setTextColor(79, 70, 229); doc.text(`MATCH SCORE: ${analysis.score}%`, 140, 55);
    
    doc.setTextColor(60, 60, 60); doc.setFontSize(10); doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysis.summary || "", 170);
    doc.text(summaryLines, 20, 65);

    let y = 65 + (summaryLines.length * 5) + 10;

    // Strengths
    doc.setFont("helvetica", "bold"); doc.setTextColor(16, 185, 129); doc.text("TOP STRENGTHS", 20, y); y += 7;
    doc.setFont("helvetica", "normal"); doc.setTextColor(40, 40, 40);
    analysis.strengths.forEach(s => { doc.text(`• ${s}`, 25, y); y += 6; });

    y += 5;
    // Gaps
    doc.setFont("helvetica", "bold"); doc.setTextColor(244, 63, 94); doc.text("CRITICAL GAPS", 20, y); y += 7;
    doc.setFont("helvetica", "normal"); doc.setTextColor(40, 40, 40);
    analysis.gaps.forEach(g => { doc.text(`• ${g}`, 25, y); y += 6; });

    // New Page for Questions
    doc.addPage();
    doc.setFont("helvetica", "bold"); doc.setTextColor(79, 70, 229); doc.setFontSize(16);
    doc.text("STRATEGIC INTERVIEW GUIDE", 20, 25); y = 40;
    doc.setFontSize(10); doc.setTextColor(40, 40, 40); doc.setFont("helvetica", "normal");
    
    analysis.questions.forEach((q, i) => {
      const qLines = doc.splitTextToSize(`${i + 1}. ${q}`, 170);
      doc.text(qLines, 20, y);
      y += (qLines.length * 5) + 5;
    });

    doc.save(`RecruitIQ_${cName.replace(/\s+/g, '_')}.pdf`);
    showToast("PDF Downloaded", "success");
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) { setShowLimitModal(true); return; }
    if (!jdReady || !resumeReady) { showToast("Complete Steps 1 & 2.", "error"); return; }
    
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. 
      1. Extract candidate name. 
      2. Score match 0-100. 
      3. Write a brief executive summary. 
      4. List 3 strengths and 3 gaps. 
      5. Provide 5 tough interview questions specific to the gaps found. 
      6. Write a highly personalized outreach email that references a specific achievement from their resume.
      Return ONLY JSON: {"candidate_name": "Name", "score": 0, "summary": "...", "strengths": [], "gaps": [], "questions": [], "outreach_email": "..."}`;

      const response = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)[0]);

      setAnalysis(result);
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Analysis Complete", "success");
    } catch (err) { showToast("AI Error. Check inputs.", "error"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="h-12 w-auto" />
            <div className="hidden md:block">
                <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Elite Candidate Screening</p>
            </div>
        </div>
        <div className={`px-4 py-2 rounded-full text-[10px] font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
            {isPro ? "ELITE ACTIVE" : `TRIAL: ${3 - scanCount} LEFT`}
        </div>
      </div>

      {/* QUICK START */}
      <div className="grid md:grid-cols-3 gap-6">
          <div onClick={() => setActiveTab('jd')} className={`p-6 rounded-3xl border cursor-pointer ${jdReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-2 uppercase text-[10px] font-bold tracking-widest">
                <span>1. Job Description</span>
                {jdReady && <span className="text-emerald-400">✓</span>}
              </div>
              <p className="text-[11px] text-slate-400">Click to paste or upload requirements.</p>
          </div>
          <div onClick={() => setActiveTab('resume')} className={`p-6 rounded-3xl border cursor-pointer ${resumeReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-2 uppercase text-[10px] font-bold tracking-widest">
                <span>2. Candidate Resume</span>
                {resumeReady && <span className="text-emerald-400">✓</span>}
              </div>
              <p className="text-[11px] text-slate-400">Click to paste or upload candidate file.</p>
          </div>
          <div className={`p-6 rounded-3xl border ${analysis ? 'bg-indigo-900/20 border-indigo-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <span className="uppercase text-[10px] font-bold tracking-widest text-indigo-400">3. Results Ready</span>
              <p className="text-[11px] text-slate-400">Match score and interview guide.</p>
          </div>
      </div>

      {/* WORKSPACE */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px]">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase ${activeTab === 'jd' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>Job Description</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>Resume</button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-white border border-slate-700">
                Upload pdf or doc
                <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700">Load Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content here..."
            />
            <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 tracking-widest shadow-xl">
              {loading ? "Analyzing..." : "Screen Candidate →"}
            </button>
        </div>

        {/* RESULTS COLUMN */}
        <div className="h-[850px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <div className="text-white font-bold text-lg mb-4">{analysis.candidate_name}</div>
                  <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700">Download Full Report</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl text-[11px]"><h4 className="text-emerald-400 font-bold uppercase mb-3 text-[9px]">Strengths</h4>{analysis.strengths.map((s, i) => <p key={i}>• {s}</p>)}</div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl text-[11px]"><h4 className="text-rose-400 font-bold uppercase mb-3 text-[9px]">Critical Gaps</h4>{analysis.gaps.map((g, i) => <p key={i}>• {g}</p>)}</div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <h4 className="text-indigo-400 font-bold uppercase text-[9px] mb-4">Strategic Interview Guide</h4>
                  <div className="space-y-3 text-[11px] text-slate-300">
                    {analysis.questions.map((q, i) => <p key={i} className="p-3 bg-slate-800/40 rounded-xl border border-slate-700">"{q}"</p>)}
                  </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <h4 className="text-blue-400 font-bold uppercase text-[9px] mb-4 text-center">AI Outreach Generator</h4>
                  <div className="bg-[#0B1120] p-6 rounded-2xl border border-slate-800 mb-4">
                    <p className="text-[11px] text-slate-300 whitespace-pre-wrap">{analysis.outreach_email}</p>
                  </div>
                  <button onClick={() => {navigator.clipboard.writeText(analysis.outreach_email); showToast("Email Copied", "success")}} className="w-full py-3 bg-slate-800 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-white">Copy to Clipboard</button>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600 font-black text-[10px] uppercase tracking-widest">Waiting for data...</div>
            )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-800 pt-8 pb-12 text-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
        <p className="mb-4">&copy; {new Date().getFullYear()} Recruit-IQ. Powered by Core Creativity AI.</p>
        <div className="flex justify-center gap-6">
          <a href="https://www.corecreativityai.com/blank" className="hover:text-indigo-400">Privacy Policy</a>
          <a href="https://www.corecreativityai.com/blank-2" className="hover:text-indigo-400">Terms of Service</a>
          <button onClick={() => setShowSupportModal(true)} className="hover:text-indigo-400">Contact Support</button>
        </div>
      </footer>

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
          <div className="bg-[#0F172A] border border-slate-700 p-8 rounded-[2rem] max-w-lg w-full">
            <h2 className="text-xl font-black mb-4">Support Request</h2>
            <textarea className="w-full h-32 bg-[#0B1120] border border-slate-800 rounded-xl p-4 text-xs text-white outline-none" placeholder="How can we help?" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
            <div className="flex gap-3 mt-4">
              <button onClick={handleSupportSubmit} className="flex-1 py-3 bg-indigo-600 rounded-xl font-bold uppercase text-[10px]">Send Email</button>
              <button onClick={() => setShowSupportModal(false)} className="px-6 py-3 bg-slate-800 rounded-xl font-bold uppercase text-[10px]">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
