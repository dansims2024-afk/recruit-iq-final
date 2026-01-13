import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk } from "@clerk/clerk-react";
import logo from '../logo.png'; 

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

// --- FULL SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect...`; // [Omitted for brevity, keep your full text here]
const SAMPLE_RESUME = `MARCUS VANDELAY...`; // [Omitted for brevity, keep your full text here]

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
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text("RECRUIT-IQ INTELLIGENCE REPORT", 20, 25);
    doc.setTextColor(0, 0, 0); doc.setFontSize(16); doc.text(cName.toUpperCase(), 20, 55);
    doc.setTextColor(79, 70, 229); doc.text(`MATCH SCORE: ${analysis.score}%`, 140, 55);
    doc.setTextColor(60, 60, 60); doc.setFontSize(10); doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(analysis.summary || "", 170);
    doc.text(summaryLines, 20, 65);
    doc.save(`RecruitIQ_${cName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) { setShowLimitModal(true); return; }
    if (!jdReady || !resumeReady) { showToast("Complete Steps 1 & 2.", "error"); return; }
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const prompt = `Analyze JD: ${jdText} and Resume: ${resumeText}. Extract candidate name, score 0-100, executive summary, 3 strengths, 3 gaps, 5 interview questions, and a personalized outreach email. Return ONLY JSON: {"candidate_name": "Name", "score": 0, "summary": "...", "strengths": [], "gaps": [], "questions": [], "outreach_email": "..."}`;
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
      const data = await response.json();
      const result = JSON.parse(data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)[0]);
      setAnalysis(result);
      if (!isPro) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('recruit_iq_scans', newCount.toString());
      }
      showToast("Analysis Complete", "success");
    } catch (err) { showToast("AI Error.", "error"); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

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
            {isPro ? "ELITE ACTIVE" : `FREE TRIAL: ${3 - scanCount} LEFT`}
        </div>
      </div>

      {/* QUICK START WITH DETAILED INSTRUCTIONS */}
      <div className="grid md:grid-cols-3 gap-6">
          <div onClick={() => setActiveTab('jd')} className={`p-6 rounded-3xl border cursor-pointer transition-all ${jdReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">1</span>
                {jdReady && <span className="text-emerald-400 font-bold text-xs">READY</span>}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest mb-1">Set Expectations</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Paste the Job Description to establish the target skills and experience requirements for the role.</p>
          </div>
          <div onClick={() => setActiveTab('resume')} className={`p-6 rounded-3xl border cursor-pointer transition-all ${resumeReady ? 'bg-indigo-900/20 border-emerald-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">2</span>
                {resumeReady && <span className="text-emerald-400 font-bold text-xs">READY</span>}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest mb-1">Input Candidate</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Upload a PDF/DOCX or paste the candidate's resume to compare their profile against your defined requirements.</p>
          </div>
          <div className={`p-6 rounded-3xl border transition-all ${analysis ? 'bg-indigo-900/20 border-indigo-500' : 'bg-slate-800/30 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">3</span>
                {analysis && <span className="text-indigo-400 font-bold text-xs">COMPLETE</span>}
              </div>
              <h4 className="uppercase text-[10px] font-black tracking-widest mb-1">Generate Intelligence</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Execute the AI screen to uncover match scores, gap analysis, and personalized interview questions.</p>
          </div>
      </div>

      {/* WORKSPACE */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl">
            <div className="flex gap-3 mb-6">
                <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 ${activeTab === 'jd' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>
                  <span className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center text-[9px]">1</span> Job Description
                </button>
                <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800 text-slate-500'}`}>
                  <span className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center text-[9px]">2</span> Candidate Resume
                </button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-white border border-slate-700 transition-all">
                Upload pdf or doc
                <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800/50 py-3 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-700 hover:text-white transition-all">Load Full Samples</button>
            </div>

            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder={activeTab === 'jd' ? "Paste Role Requirements here..." : "Paste Resume text here..."}
            />
            <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600 tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all">
              <span className="bg-white/20 w-5 h-5 rounded-full flex items-center justify-center text-[9px]">3</span>
              {loading ? "Analyzing Candidate..." : "Execute AI Screen →"}
            </button>
        </div>

        {/* RESULTS COLUMN */}
        <div className="h-[850px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                  <div className="w-24 h-24 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-4xl font-black mb-4">{analysis.score}%</div>
                  <h3 className="uppercase text-[9px] font-bold tracking-widest text-slate-500 mb-1">Match Score</h3>
                  <div className="text-white font-bold text-lg mb-4">{analysis.candidate_name}</div>
                  <button onClick={downloadPDF} className="bg-slate-800 hover:bg-slate-700 text-indigo-400 px-6 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 transition-all">Download Intelligence Report</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl text-[11px]"><h4 className="text-emerald-400 font-bold uppercase mb-3 text-[9px] tracking-widest">Key Strengths</h4>{analysis.strengths.map((s, i) => <p key={i} className="mb-2">• {s}</p>)}</div>
                  <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl text-[11px]"><h4 className="text-rose-400 font-bold uppercase mb-3 text-[9px] tracking-widest">Critical Gaps</h4>{analysis.gaps.map((g, i) => <p key={i} className="mb-2">• {g}</p>)}</div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <h4 className="text-indigo-400 font-bold uppercase text-[9px] mb-4 tracking-widest">Strategic Interview Questions</h4>
                  <div className="space-y-3 text-[11px] text-slate-300">
                    {analysis.questions.map((q, i) => <p key={i} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700">"{q}"</p>)}
                  </div>
                </div>

                <div className="bg-[#111827] border border-slate-800 p-6 rounded-3xl">
                  <h4 className="text-blue-400 font-bold uppercase text-[9px] mb-4 text-center tracking-widest">AI Outreach Generator</h4>
                  <div className="bg-[#0B1120] p-6 rounded-2xl border border-slate-800 mb-4">
                    <p className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">{analysis.outreach_email}</p>
                  </div>
                  <button onClick={() => {navigator.clipboard.writeText(analysis.outreach_email); showToast("Copied to Clipboard", "success")}} className="w-full py-3 bg-slate-800 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:text-white transition-all">Copy Outreach Email</button>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 font-black text-[10px] uppercase tracking-widest gap-4">
                <span className="text-4xl opacity-20">📊</span>
                Waiting for Candidate Data...
              </div>
            )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-800 pt-8 pb-12 text-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
        <p className="mb-4 text-[9px]">&copy; {new Date().getFullYear()} Recruit-IQ. Powered by Core Creativity AI.</p>
        <div className="flex justify-center gap-6">
          <a href="https://www.corecreativityai.com/blank" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">Privacy Policy</a>
          <a href="https://www.corecreativityai.com/blank-2" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">Terms of Service</a>
          <button onClick={() => setShowSupportModal(true)} className="hover:text-indigo-400">Contact Support</button>
        </div>
      </footer>

      {/* SUPPORT MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
          <div className="bg-[#0F172A] border border-slate-700 p-10 rounded-[2.5rem] max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-black mb-2 text-white uppercase tracking-tighter">Support Request</h2>
            <p className="text-slate-400 text-[11px] mb-6 uppercase tracking-widest">Sent to hello@corecreativityai.com</p>
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <textarea required className="w-full h-32 bg-[#0B1120] border border-slate-800 rounded-xl p-4 text-[11px] text-white outline-none resize-none focus:border-indigo-500 transition-all" placeholder="Describe your issue or question..." value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-4 bg-indigo-600 rounded-xl font-black uppercase text-[10px] tracking-widest text-white shadow-lg">Send Intelligence Request</button>
                <button type="button" onClick={() => setShowSupportModal(false)} className="px-6 py-4 bg-slate-800 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-white transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
