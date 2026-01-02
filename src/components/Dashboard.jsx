import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth'; // Required for fixing garbled .docx text

// --- Build-Safe Icons (No Dependencies) ---
const Icons = {
  Check: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  Alert: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('jd'); 
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [emailDraft, setEmailDraft] = useState('');

  // --- FIX: Resume Context Parsing (No more garbled text) ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let text = "";
        if (file.name.endsWith('.docx')) {
          const result = await mammoth.extractRawText({ arrayBuffer: event.target.result });
          text = result.value;
        } else {
          text = new TextDecoder().decode(event.target.result);
        }
        
        // Correctly fill the box based on which tab is open
        if (activeTab === 'jd') setJdText(text);
        else setResumeText(text);
      } catch (err) {
        console.error("Parsing error", err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleScreen = () => {
    setLoading(true);
    // Simulation of 5 Strengths and 3 Gaps
    setTimeout(() => {
      setAnalysis({
        score: 94,
        summary: "Exceptional alignment in FinTech architecture with quantifiable performance wins.",
        strengths: [
          "Proven 45% reduction in core engine latency ($2M compute savings).",
          "Successfully scaled AWS infrastructure from 50 to 500+ microservices.",
          "Lead-level mentorship of teams sized 12-15 engineers.",
          "Optimized PostgreSQL queries resulting in 60% dashboard speed boost.",
          "Direct experience with high-volume transaction processing ($500M+ daily)."
        ],
        gaps: [
          "Limited explicit detail on React 19 concurrent rendering features.",
          "No mention of Go-based security implementation in recent projects.",
          "Lacks documentation on direct SOC2 compliance audit leadership."
        ],
        questions: [
          "How did you identify the specific bottlenecks for the 45% latency reduction?",
          "Walk us through your mentorship approach for a team of 15 engineers.",
          "How would you migrate a legacy system to EKS with zero downtime?",
          "Explain your strategy for maintaining data consistency across 500 microservices.",
          "How do you prioritize security in a high-velocity development cycle?"
        ]
      });
      setLoading(false);
    }, 1500);
  };

  const downloadGuide = () => {
    const content = `Recruit-IQ Interview Guide\n\n${analysis.questions.map((q, i) => `Q${i+1}: ${q}`).join('\n\n')}`;
    const blob = new Blob([content], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "RecruitIQ_Interview_Guide.doc";
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#020617] text-slate-200 p-10 space-y-10">
      
      {/* 1-2-3 QUICK START (COLOR CODED) */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex justify-between">
         <div className="flex items-center gap-4"><span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span><p className="text-xs font-bold">Fill JD</p></div>
         <div className="flex items-center gap-4"><span className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span><p className="text-xs font-bold">Upload Resume</p></div>
         <div className="flex items-center gap-4"><span className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span><p className="text-xs font-bold">Screen Candidate</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
        
        {/* INPUT PANEL */}
        <section className="bg-[#0f172a] rounded-[3rem] border border-slate-800 flex flex-col h-[750px] overflow-hidden shadow-2xl">
          <div className="flex p-2 bg-[#020617]/40 border-b border-slate-800">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl ${activeTab === 'jd' ? 'bg-slate-800' : 'text-slate-500'}`}>
              <span className="bg-blue-600 w-4 h-4 rounded-full inline-block mr-2 text-center text-white text-[8px]">1</span> JD {jdText.length > 5 && "✓"}
            </button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl ${activeTab === 'resume' ? 'bg-slate-800' : 'text-slate-500'}`}>
              <span className="bg-indigo-600 w-4 h-4 rounded-full inline-block mr-2 text-center text-white text-[8px]">2</span> Resume {resumeText.length > 5 && "✓"}
            </button>
          </div>
          
          <div className="p-4 flex justify-between px-8 bg-[#020617]/20 border-b border-slate-800">
            <label className="bg-blue-600/10 px-4 py-2 rounded-xl text-blue-400 text-[10px] font-black uppercase cursor-pointer">
              Upload File <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <textarea 
            className="flex-1 p-10 bg-transparent outline-none text-slate-300 resize-none font-medium leading-relaxed" 
            value={activeTab === 'jd' ? jdText : resumeText} 
            onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} 
          />

          <div className="p-8 border-t border-slate-800">
            <button onClick={handleScreen} className="w-full py-6 rounded-3xl bg-emerald-600 font-black uppercase text-sm flex items-center justify-center gap-3">
              <span className="bg-white text-emerald-600 w-5 h-5 rounded-full text-[9px]">3</span> {loading ? "Analyzing..." : "Screen Candidate"}
            </button>
          </div>
        </section>

        {/* OUTPUT PANEL */}
        <section className="space-y-8 overflow-y-auto max-h-[750px]">
          {analysis && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-10">
              <div className="bg-[#0f172a] rounded-[3rem] p-10 border border-slate-800 text-center shadow-2xl">
                 <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-black">{analysis.score}%</div>
                 <p className="mt-6 italic font-medium leading-relaxed">"{analysis.summary}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-emerald-900/30 p-6 rounded-3xl shadow-lg">
                  <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-4 flex items-center gap-2">5 Key Strengths</h4>
                  <ul className="text-xs space-y-3">{analysis.strengths.map((s, i) => <li key={i} className="flex gap-2"><Icons.Check /> {s}</li>)}</ul>
                </div>
                <div className="bg-slate-900 border border-rose-900/30 p-6 rounded-3xl shadow-lg">
                  <h4 className="text-[10px] font-black uppercase text-rose-500 mb-4 flex items-center gap-2">3 Critical Gaps</h4>
                  <ul className="text-xs space-y-3">{analysis.gaps.map((g, i) => <li key={i} className="flex gap-2"><Icons.Alert /> {g}</li>)}</ul>
                </div>
              </div>

              <div className="bg-indigo-950/20 p-8 rounded-[2.5rem] border border-indigo-500/20 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-black uppercase text-indigo-400">Strategic Interview Guide</h4>
                  <button onClick={downloadGuide} className="bg-indigo-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-2"><Icons.Download /> Download Guide</button>
                </div>
                {analysis.questions.map((q, i) => <div key={i} className="bg-[#020617] p-4 rounded-xl text-xs mb-3 italic border border-slate-800">"{q}"</div>)}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
