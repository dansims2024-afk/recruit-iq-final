import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser } from "@clerk/clerk-react";
import logo from '../logo.png';

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

Vertex Financial Systems is seeking a visionary Architect to lead the evolution of our next-generation high-frequency trading platform. You will be responsible for defining the technical roadmap, mentoring lead engineers, and ensuring our systems maintain sub-millisecond latency under extreme market volatility.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | m.vandelay@email.com

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers to deliver 99.99% uptime for global trading platforms.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const isPro = user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        activeTab === 'jd' ? setJdText(result.value) : setResumeText(result.value);
      } else if (file.name.endsWith('.pdf')) {
        alert("PDF detected. For high AI accuracy, please copy/paste the text directly into the box.");
      } else {
        const text = await file.text();
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      }
    } catch (err) { alert("Error reading file."); }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.text("Recruit-IQ Candidate Report", 20, 20);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Match Score: ${analysis.score}%`, 20, 35);
    doc.setFontSize(10);
    doc.text("Questions:", 20, 50);
    analysis.questions.forEach((q, i) => doc.text(`${i+1}. ${q}`, 20, 60 + (i * 10), { maxWidth: 170 }));
    doc.save(`Recruit-IQ-Analysis.pdf`);
  };

  const handleScreen = async () => {
    if (!jdReady || !resumeReady) return alert("Complete Step 1 and 2.");
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Return JSON ONLY: {
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
      setAnalysis(JSON.parse(data.candidates[0].content.parts[0].text));
    } catch (err) { alert("Analysis failed."); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <img src={logo} alt="Recruit-IQ" className="h-10 w-auto" />
        <div className="bg-indigo-500/10 border border-indigo-500/50 px-4 py-2 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
           {isPro ? "PRO INTEL ACTIVE" : "AUTHENTICATING..."}
        </div>
      </div>

      {/* QUICK START */}
      <div className="grid md:grid-cols-3 gap-6">
          <div className={`p-6 rounded-3xl border ${jdReady ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700'}`}>
             <h4 className="font-bold text-[10px] uppercase tracking-widest mb-1">1. Set Requirements</h4>
             <p className="text-[11px] text-slate-400">Paste JD or load sample.</p>
          </div>
          <div className={`p-6 rounded-3xl border ${resumeReady ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700'}`}>
             <h4 className="font-bold text-[10px] uppercase tracking-widest mb-1">2. Load Candidate</h4>
             <p className="text-[11px] text-slate-400">Upload PDF/Word or paste resume.</p>
          </div>
          <div className={`p-6 rounded-3xl border ${analysis ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700'}`}>
             <h4 className="font-bold text-[10px] uppercase tracking-widest mb-1">3. Generate Intel</h4>
             <p className="text-[11px] text-slate-400">Run screen for score and email.</p>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl">
            <div className="flex gap-3 mb-6">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase ${activeTab === 'jd' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>JD</button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>Resume</button>
            </div>
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 hover:text-white transition-colors">
                Upload File <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400">Load Samples</button>
            </div>
            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed mb-6"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
            />
            <button onClick={handleScreen} disabled={loading} className="py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-white bg-gradient-to-r from-indigo-600 to-blue-600 shadow-xl">
              {loading ? "Analyzing..." : "Screen Candidate →"}
            </button>
        </div>

        <div className="h-[850px] overflow-y-auto space-y-6 pr-2">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <button onClick={downloadPDF} className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-white transition-colors">Download PDF Intelligence Report</button>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <h4 className="text-indigo-400 font-bold uppercase text-[10px] mb-3">Interview Questions</h4>
                  <ul className="text-[11px] text-slate-300 space-y-2">
                    {analysis.questions?.map((q, i) => <li key={i} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">"{q}"</li>)}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl">
                    <h4 className="text-emerald-400 font-bold uppercase text-[10px] mb-3">Strengths</h4>
                    <ul className="text-[11px] text-slate-300 space-y-2">{analysis.strengths?.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl">
                    <h4 className="text-rose-400 font-bold uppercase text-[10px] mb-3">Gaps</h4>
                    <ul className="text-[11px] text-slate-300 space-y-2">{analysis.gaps?.map((g, i) => <li key={i}>• {g}</li>)}</ul>
                  </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <h4 className="text-blue-400 font-bold uppercase text-[10px] mb-3">AI Outreach Email</h4>
                  <p className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed bg-[#0B1120] p-5 rounded-xl border border-slate-800">{analysis.outreach_email}</p>
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
