import React, { useState, useEffect, useRef } from 'react';

// Standard SVG Icons to bypass Rollup "lucide-react" resolve errors
const Icons = {
  Zap: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Download: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Trending: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
};

export default function RecruitIQElite() {
  const [activeTab, setActiveTab] = useState('jd');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  
  // --- STRIPE & CLERK PLACEHOLDERS ---
  // Ensure these components from your Clerk/Stripe libraries are imported at the top of your file
  // e.g., import { UserButton } from "@clerk/nextjs";
  
  const mockMarketData = { low: 145000, med: 185000, high: 235000 };

  const handleScreen = () => {
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 92,
        fitSummary: "Exceptional candidate with niche FinTech scaling expertise and $3.1M revenue attribution.",
        strengths: [
          { area: "Revenue", metric: "Directly attributed to $3.1M in expansion revenue in FY25.", val: 98 },
          { area: "Efficiency", metric: "Automated 40% of manual reporting, saving 15 hrs/week.", val: 94 }
        ],
        gaps: [
          { area: "Compliance", metric: "No direct experience with HIPAA or SOC2 audit management.", val: 28 }
        ],
        interviewQuestions: [
          "Explain the technical hurdles in automating 40% of the manual reporting pipeline.",
          "How would you handle a SOC2 audit if our team had zero previous documentation?"
        ]
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      {/* Header: Preserved for Clerk UserButton */}
      <header className="h-20 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><Icons.Zap /></div>
          <span className="text-xl font-black uppercase tracking-tighter text-white">Recruit IQ <span className="text-blue-500">Elite</span></span>
        </div>
        
        <div className="flex items-center gap-6">
          {/* STRIPE UPGRADE BUTTON WOULD GO HERE */}
          <button className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition">Upgrade Tier</button>
          <button onClick={() => window.print()} className="text-slate-400 hover:text-white transition"><Icons.Download /></button>
          
          {/* CLERK USER BUTTON COMPONENT WOULD GO HERE */}
          <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse border border-slate-600" title="Clerk UserButton Placeholder" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Editor Panel */}
        <div className="bg-[#0f172a] rounded-[3rem] border border-slate-800 flex flex-col h-[750px] shadow-2xl overflow-hidden">
          <div className="flex p-2 bg-[#020617]/40 border-b border-slate-800">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl transition ${activeTab === 'jd' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>1. Job Description</button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl transition ${activeTab === 'resume' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>2. Resume</button>
          </div>
          <div className="flex-1 p-10 overflow-y-auto">
             <textarea className="w-full h-full bg-transparent outline-none text-lg text-slate-300 resize-none" placeholder={`Paste ${activeTab === 'jd' ? 'Job Description' : 'Resume'} here...`} />
          </div>
          <div className="p-8 border-t border-slate-800 bg-[#020617]/20">
            <button onClick={handleScreen} className="w-full py-6 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 transition-all active:scale-95">
              {loading ? "Analyzing..." : "Screen Candidate"}
            </button>
          </div>
        </div>

        {/* Right: Intelligence Panel */}
        <div className="space-y-8 overflow-y-auto max-h-[750px] pr-2 custom-scrollbar">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex items-center justify-center opacity-20"><span className="text-[10px] uppercase font-black tracking-widest">Awaiting Scan</span></div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-10 duration-700 space-y-8">
              
              {/* synergy Score Circle */}
              <div className="bg-[#0f172a] rounded-[3rem] p-10 border border-slate-800 text-center">
                <div className="w-40 h-40 rounded-full border-[12px] border-slate-800 mx-auto flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-5xl font-black text-white shadow-2xl mb-6">
                  {analysis.matchScore}%
                </div>
                <p className="text-xl text-white font-black italic">"{analysis.fitSummary}"</p>
              </div>

              {/* MARKET INTELLIGENCE CARDS */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Entry</p>
                  <p className="text-lg font-black text-white">${mockMarketData.low / 1000}k</p>
                </div>
                <div className="bg-blue-600 p-4 rounded-2xl text-center shadow-lg shadow-blue-500/20 transform scale-105">
                  <p className="text-[10px] font-black text-blue-100 uppercase mb-1">Median</p>
                  <p className="text-xl font-black text-white">${mockMarketData.med / 1000}k</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Premium</p>
                  <p className="text-lg font-black text-white">${mockMarketData.high / 1000}k</p>
                </div>
              </div>

              {/* STRENGTHS & GAPS TABLE */}
              <div className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#020617] text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-800">
                    <tr><th className="p-5">Quantifiable Category</th><th className="p-5 text-right">Synergy</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {analysis.strengths.map((s, i) => (
                      <tr key={i}><td className="p-5 text-slate-300 font-medium">{s.metric}</td><td className="p-5 text-right font-black text-emerald-400">{s.val}%</td></tr>
                    ))}
                    {analysis.gaps.map((g, i) => (
                      <tr key={i}><td className="p-5 text-slate-400 italic">{g.metric}</td><td className="p-5 text-right font-black text-rose-500">{g.val}%</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* STRATEGIC INTERVIEW GUIDE */}
              <div className="bg-indigo-950/20 rounded-[2.5rem] p-10 border border-indigo-500/10">
                <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-6">Strategic Interview Guide</h4>
                <div className="space-y-4">
                  {analysis.interviewQuestions.map((q, i) => (
                    <div key={i} className="bg-[#020617] p-5 rounded-2xl border border-slate-800 text-sm italic text-slate-300 shadow-inner">"{q}"</div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
