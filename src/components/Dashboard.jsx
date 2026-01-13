import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk } from "@clerk/clerk-react";
import logo from '../logo.png'; 

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // --- HIGH-LEVEL PDF GENERATOR ---
  const downloadPDF = () => {
    if (!analysis) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const cName = analysis.candidate_name || "Candidate";

    // PAGE 1: EXECUTIVE SUMMARY
    // Brand Header
    doc.setFillColor(79, 70, 229); // Recruit-IQ Purple
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26); doc.setFont("helvetica", "bold");
    doc.text("INTELLIGENCE REPORT", 20, 25);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("RECRUIT-IQ | POWERED BY CORE CREATIVITY AI", 20, 32);

    // Candidate Header
    doc.setTextColor(30, 41, 59); doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.text(cName.toUpperCase(), 20, 65);
    
    // Score Badge
    doc.setFillColor(241, 245, 249); doc.roundedRect(145, 52, 45, 15, 3, 3, 'F');
    doc.setTextColor(79, 70, 229); doc.setFontSize(14);
    doc.text(`MATCH: ${analysis.score}%`, 150, 62);

    // Summary Section
    doc.setTextColor(100, 116, 139); doc.setFontSize(9); doc.text("EXECUTIVE SUMMARY", 20, 78);
    doc.setTextColor(51, 65, 85); doc.setFontSize(11); doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysis.summary || "", 170);
    doc.text(summaryLines, 20, 85);

    let y = 85 + (summaryLines.length * 6) + 15;

    // Strengths & Gaps (Two Columns to prevent overlapping)
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.setTextColor(16, 185, 129); doc.text("TOP STRENGTHS", 20, y);
    doc.setTextColor(244, 63, 94); doc.text("CRITICAL GAPS", 110, y);
    
    y += 8;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
    
    const strengths = analysis.strengths || [];
    const gaps = analysis.gaps || [];
    const maxLines = Math.max(strengths.length, gaps.length);

    for (let i = 0; i < maxLines; i++) {
        if (strengths[i]) {
            const sLines = doc.splitTextToSize(`• ${strengths[i]}`, 80);
            doc.text(sLines, 20, y);
        }
        if (gaps[i]) {
            const gLines = doc.splitTextToSize(`• ${gaps[i]}`, 80);
            doc.text(gLines, 110, y);
        }
        y += 12; // Extra spacing between bullet points
    }

    // PAGE 2: INTERVIEW GUIDE
    doc.addPage();
    doc.setFillColor(248, 250, 252); doc.rect(0, 0, 210, 297, 'F');
    
    // Page Header
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("STRATEGIC INTERVIEW GUIDE", 20, 13);

    y = 40;
    doc.setTextColor(30, 41, 59); doc.setFontSize(16); doc.text("Targeted Interview Questions", 20, y);
    y += 10;
    doc.setTextColor(100, 116, 139); doc.setFontSize(9); doc.setFont("helvetica", "italic");
    doc.text(`The following questions were generated to address identified gaps in ${cName}'s profile.`, 20, y);
    
    y += 15;
    doc.setFontSize(11); doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal");
    
    (analysis.questions || []).forEach((q, i) => {
        const qLines = doc.splitTextToSize(`${i + 1}. ${q}`, 170);
        // Question Box
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(15, y - 6, 180, (qLines.length * 6) + 10, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(15, y - 6, 180, (qLines.length * 6) + 10, 2, 2, 'D');
        
        doc.text(qLines, 20, y + 2);
        y += (qLines.length * 6) + 18;
    });

    doc.save(`RecruitIQ_Report_${cName.replace(/\s+/g, '_')}.pdf`);
    showToast("Professional Report Generated", "success");
  };

  // --- ANALYSIS LOGIC ---
  const handleScreen = async () => {
    if (!jdReady || !resumeReady) { showToast("Steps 1 & 2 required.", "error"); return; }
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Extract candidate name, score 0-100, executive summary, 3 strengths, 3 gaps, and 5 interview questions. Return ONLY JSON: {"candidate_name": "Name", "score": 0, "summary": "...", "strengths": [], "gaps": [], "questions": []}`;

      const response = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)[0]);

      setAnalysis(result);
      showToast("Intelligence Complete", "success");
    } catch (err) { showToast("AI Engine Error.", "error"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* ... (Previous Header & Quick Start code remains the same) ... */}

      {/* WORKSPACE */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Column */}
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px]">
            {/* ... Buttons & Textarea ... */}
            <button onClick={handleScreen} className="py-5 bg-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest">
              {loading ? "Analyzing..." : "Execute AI Screen →"}
            </button>
        </div>

        {/* Results Column */}
        <div className="h-[850px] overflow-y-auto space-y-6">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in">
                {/* Visual Dashboard Card */}
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <div className="text-white font-bold text-lg mb-4">{analysis.candidate_name}</div>
                  <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700">
                    Download Intelligence Report
                  </button>
                </div>

                {/* Data View */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl text-[11px]">
                    <h4 className="text-emerald-400 font-bold uppercase mb-3">Strengths</h4>
                    {analysis.strengths.map((s, i) => <p key={i}>• {s}</p>)}
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl text-[11px]">
                    <h4 className="text-rose-400 font-bold uppercase mb-3">Gaps</h4>
                    {analysis.gaps.map((g, i) => <p key={i}>• {g}</p>)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600 font-black text-[10px] uppercase">
                Waiting for data...
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
