"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { jsPDF } from "jspdf"; 
import { useUser, useClerk, SignUpButton, UserButton } from "@clerk/nextjs";

// THE REAL STRIPE LINK
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

// --- FULL EXTENDED SAMPLES ---
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
- Collaborate with quantitative researchers to implement complex trading algorithms.
- Ensure strict compliance with financial regulations and data security standards (SOC2, ISO 27001).

REQUIREMENTS:
- 12+ years of software engineering experience in FinTech or Capital Markets.
- Deep expertise in AWS Cloud Architecture (AWS Certified Solutions Architect preferred).
- Proven track record with Kubernetes, Docker, Kafka, Redis, and Terraform.
- Strong proficiency in Go (Golang), C++, Python, and TypeScript.
- Experience designing low-latency, high-throughput systems.
- Bachelor’s or Master’s degree in Computer Science or related field.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com | (555) 123-4567

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers and successfully delivered multi-million dollar platform overhauls.

PROFESSIONAL EXPERIENCE:
Global Quant Solutions | Principal Architect | New York, NY | 2018 - Present
- Architected a serverless data processing pipeline handling 5TB of daily market data using AWS Lambda and Kinesis.
- Reduced infrastructure costs by 35% through aggressive AWS Graviton migration and spot instance orchestration.
- Led a team of 15 engineers in re-writing the core risk engine, improving calculation speed by 400%.
- Implemented a zero-trust security model across the entire engineering organization.

InnovaTrade | Senior Staff Engineer | Chicago, IL | 2014 - 2018
- Built the core execution engine in Go, achieving a 50% reduction in order latency (sub-50 microseconds).
- Implemented automated failover protocols that prevented over $10M in potential slippage during market volatility.
- Mentored junior developers and established the company's first formal code review process.

TECHNICAL SKILLS:
- Languages: Go, C++, Python, TypeScript, Java, Rust.
- Cloud: AWS (EKS, Lambda, Aurora, SQS, DynamoDB), Terraform, Docker, Kubernetes.
- Architecture: Microservices, Event-Driven Design, Serverless, CQRS.
- Tools: GitLab CI, Prometheus, Grafana, Splunk, Jira.`;

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

  // THE KEY "PRO" CHECK
  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  // STRIPE LOGIC: PRE-FILL EMAIL & USER ID
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const userId = user?.id;

  const finalStripeUrl = userId && userEmail
    ? `${STRIPE_URL}?client_reference_id=${userId}&prefilled_email=${encodeURIComponent(userEmail)}`
    : STRIPE_URL;

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
        const pdfjs = window.pdfjsLib;
        const loadingTask = pdfjs.getDocument(URL.createObjectURL(file));
        const pdf = await loadingTask.promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item) => item.str).join(' ') + "\n";
        }
        text = fullText;
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      showToast(`${file.name} uploaded!`, "success");
    } catch (err) { showToast("Upload failed.", "error"); }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    const cName = (analysis.candidate_name || "Candidate").toUpperCase();
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text("INTELLIGENCE REPORT", 20, 25);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("RECRUIT-IQ | POWERED BY CORE CREATIVITY AI", 20, 32);
    doc.setTextColor(30, 41, 59); doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.text(cName, 20, 60);
    doc.setTextColor(79, 70, 229); doc.text(`MATCH SCORE: ${analysis.score}%`, 130, 60);
    doc.setTextColor(100, 116, 139); doc.setFontSize(9); doc.text("EXECUTIVE SUMMARY", 20, 72);
    doc.setTextColor(51, 65, 85); doc.setFontSize(11); doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysis.summary || "", 170);
    doc.text(summaryLines, 20, 79);
    let y = 79 + (summaryLines.length * 6) + 15;
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.setTextColor(16, 185, 129); doc.text("TOP STRENGTHS", 20, y);
    doc.setTextColor(244, 63, 94); doc.text("CRITICAL GAPS", 110, y);
    y += 8;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
    const strengths = analysis.strengths || [];
    const gaps = analysis.gaps || [];
    const maxItems = Math.max(strengths.length, gaps.length);
    for (let i = 0; i < maxItems; i++) {
        let currentY = y;
        if (strengths[i]) {
            const sLines = doc.splitTextToSize(`• ${strengths[i]}`, 85);
            doc.text(sLines, 20, currentY);
            currentY += (sLines.length * 5);
        }
        let gapY = y;
        if (gaps[i]) {
            const gLines = doc.splitTextToSize(`• ${gaps[i]}`, 85);
            doc.text(gLines, 110, gapY);
            gapY += (gLines.length * 5);
        }
        y = Math.max(currentY, gapY) + 4;
    }
    doc.addPage();
    doc.setFillColor(248, 250, 252); doc.rect(0, 0, 210, 297, 'F');
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(79, 70, 229); doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text("STRATEGIC INTERVIEW GUIDE", 20, 35);
    y = 50;
    doc.setFontSize(10); doc.setTextColor(51, 65, 85); doc.setFont("helvetica", "normal");
    (analysis.questions || []).forEach((q, i) => {
      const qLines = doc.splitTextToSize(`${i + 1}. ${q}`, 170);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, y - 5, 180, (qLines.length * 5) + 10, 2, 2, 'F');
      doc.text(qLines, 20, y + 2);
      y += (qLines.length * 5) + 16;
    });
    doc.save(`RecruitIQ_Report_${cName}.pdf`);
  };

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true);
      return;
    }
    if (!jdReady || !resumeReady) { showToast("Steps 1 & 2 Required.", "error"); return; }
    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; 
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Extract candidate name, score 0-100, summary, 3 strengths, 3 gaps, 5 questions, and outreach email. Return ONLY JSON: {"candidate_name": "Name", "score": 0, "summary": "...", "strengths": [], "gaps": [], "questions": [], "outreach_email": "..."}`;
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      if (!result) throw new Error("Failed to parse AI response");
      setAnalysis(result);
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Intelligence Generated", "success");
    } catch (err) { showToast("AI Engine Error.", "error"); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen pt-20">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Recruit-IQ</h1>
        <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-[10px] font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-500 text-indigo-400'}`}>
                {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
            </div>
            <UserButton afterSignOutUrl="/"/>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[800px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'jd' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}>1. JD {jdReady && "✓"}</button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${activeTab === 'resume' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}>2. Resume {resumeReady && "✓"}</button>
            </div>
            <textarea className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
            <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 hover:bg-indigo-500 transition-all">{loading ? "Analyzing..." : "Execute AI Screen →"}</button>
        </div>
        <div className="h-[800px] overflow-y-auto space-y-6">
            {analysis ? (
              <div className="space-y-6">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                  <div className="w-20 h-20 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-black mb-4">{analysis.score}%</div>
                  <h3 className="text-white font-bold text-lg mb-4">{analysis.candidate_name}</h3>
                  <button onClick={downloadPDF} className="bg-slate-800 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-black uppercase border border-slate-700">Download Report</button>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase gap-4 text-center">Waiting for Data...</div>
            )}
        </div>
      </div>

      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
          <div className="relative bg-[#0F172A] border border-slate-700 p-10 rounded-[2rem] max-w-lg w-full text-center shadow-2xl">
            <h2 className="text-3xl font-black mb-4 leading-none text-white">Unlock Elite Access</h2>
            <p className="text-slate-400 mb-8 text-sm">You've reached your trial limit. Upgrade to Elite for unlimited AI screens and custom guides.</p>
            {!isSignedIn ? (
                <SignUpButton signUpFallbackRedirectUrl="/">
                    <button className="w-full py-5 bg-indigo-600 rounded-xl font-black uppercase text-xs">Create Free Account</button>
                </SignUpButton>
            ) : (
                <a href={finalStripeUrl} className="block w-full py-5 bg-indigo-600 rounded-xl font-black uppercase text-xs">Start 3-Day Free Trial</a>
            )}
            <button onClick={() => setShowLimitModal(false)} className="mt-5 text-[10px] font-bold text-slate-500 hover:text-white uppercase">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
