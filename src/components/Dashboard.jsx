import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser } from "@clerk/clerk-react";
import { jsPDF } from "jspdf"; // You may need to run: npm install jspdf
import logo from '../logo.png';

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect...`; // Keep full JD
const SAMPLE_RESUME = `MARCUS VANDELAY...`; // Keep full Resume

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

  // --- PDF & DOCX UPLOAD HANDLER ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        activeTab === 'jd' ? setJdText(result.value) : setResumeText(result.value);
      } else if (file.name.endsWith('.pdf')) {
        // Fallback for PDF: Direct client-side PDF parsing is complex without heavy libraries
        alert("PDF detected. For maximum AI accuracy, please ensure text is selectable or copy-paste directly.");
      } else {
        const text = await file.text();
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      }
    } catch (err) {
      alert("Error reading file. Try a different format or copy-paste.");
    }
  };

  // --- DOWNLOAD ANALYSIS AS PDF ---
  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Match Analysis: ${analysis.score}%`, 20, 20);
    doc.setFontSize(12);
    doc.text("Summary:", 20, 40);
    doc.text(doc.splitTextToSize(analysis.summary, 170), 20, 50);
    doc.text("Interview Questions:", 20, 80);
    analysis.questions.forEach((q, i) => doc.text(`${i+1}. ${q}`, 20, 90 + (i * 10)));
    doc.save("Recruit-IQ-Report.pdf");
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
        "outreach_email": "Subject: ...\\n\\n...",
        "market_intel": "..."
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen">
      
      {/* HEADER & STEPS (Keep your current UI) */}

      <div className="grid md:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px]">
            <div className="flex gap-3 mb-6">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase ${activeTab === 'jd' ? 'bg-indigo-600' : 'bg-slate-800'}`}>JD</button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Resume</button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold border border-slate-700 text-slate-400">
                Upload File (PDF/DOCX) <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold border border-slate-700 text-slate-400">Load Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] p-6 border border-slate-800 rounded-2xl text-xs font-mono mb-6"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
            />
            <button onClick={handleScreen} disabled={loading} className="py-5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl font-black text-xs">
              {loading ? "Analyzing..." : "Screen Candidate →"}
            </button>
        </div>

        {/* RESULTS PANEL */}
        <div className="h-[850px] overflow-y-auto space-y-6 pr-2">
            {analysis ? (
              <div className="space-y-6">
                {/* MATCH SCORE & PDF DOWNLOAD */}
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <button onClick={downloadPDF} className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest underline">Download PDF Report</button>
                </div>

                {/* INTERVIEW QUESTIONS (Restored) */}
                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <h4 className="text-indigo-400 font-bold uppercase text-[10px] mb-3">Target Interview Questions</h4>
                  <ul className="text-[11px] text-slate-300 space-y-3">
                    {analysis.questions?.map((q, i) => <li key={i} className="bg-slate-800/50 p-3 rounded-xl">{q}</li>)}
                  </ul>
                </div>

                {/* STRENGTHS & GAPS */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl">
                    <h4 className="text-emerald-400 font-bold uppercase text-[10px] mb-2">Strengths</h4>
                    <ul className="text-[11px] space-y-1">{analysis.strengths?.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl">
                    <h4 className="text-rose-400 font-bold uppercase text-[10px] mb-2">Gaps</h4>
                    <ul className="text-[11px] space-y-1">{analysis.gaps?.map((g, i) => <li key={i}>• {g}</li>)}</ul>
                  </div>
                </div>

                {/* EMAIL OUTREACH (Moved to Bottom) */}
                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <h4 className="text-blue-400 font-bold uppercase text-[10px] mb-3">Generated Outreach Email</h4>
                  <p className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed bg-[#0B1120] p-4 rounded-xl border border-slate-800">{analysis.outreach_email}</p>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600 font-black text-[10px] uppercase">
                 Waiting for screening data...
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
