import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Sparkles, Copy, X, UserPlus, Zap, Loader2, Mail, 
  BarChart3, Crown, TrendingUp, DollarSign, Target, 
  Layers, ClipboardCheck, Briefcase, ExternalLink, 
  Quote, BarChart4, CheckCircle2, FileUp, FileText,
  ShieldCheck, ShieldAlert, ChevronRight, Info, RotateCcw,
  Coins, AlertCircle, Search, LayoutDashboard, GraduationCap, 
  Download, ThumbsUp, ThumbsDown, HelpCircle, FileCheck, Send, Wand2
} from 'lucide-react';

// NOTE: Ensure your Firebase and App ID configs are globally available or defined here.
const apiKey = ""; // Insert your Gemini API Key
const TEXT_MODEL = "gemini-2.5-flash-preview-09-2025";

// --- Utility Functions (Restored from your snippet) ---
function formatCurrency(val) {
  if (!val) return "--";
  let num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return val;
  return new Intl.NumberFormat('en-US').format(num > 0 && num < 1000 ? num * 1000 : num);
}

function extractCandidateName(content) {
  if (!content) return 'Unnamed Candidate';
  const firstLine = content.trim().split('\n')[0] || '';
  return firstLine.split('|')[0].trim();
}

function formatRoleTextToHTML(text) {
  if (!text) return "";
  return text.split('\n').map(line => {
    let l = line.trim();
    if (!l) return "<div style='height: 1em'></div>";
    if (l.startsWith('#')) return `<h2 style="color: #60a5fa; font-weight: 900; margin-top: 1.2rem; text-transform: uppercase; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.3rem;">${l.replace(/#/g, '')}</h2>`;
    return `<div style="color: #cbd5e1; margin-bottom: 0.5rem;">${l}</div>`;
  }).join('');
}

// --- Restored Market Intelligence Card ---
function MarketInsightCard({ data, loading, onDismiss }) {
  if (loading) return <div className="p-10 bg-slate-900 border border-blue-500/20 rounded-[2rem] animate-pulse text-center text-blue-400 font-black">FETCHING 2025 MARKET DATA...</div>;
  if (!data) return null;

  return (
    <div className="mb-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-top-4">
      <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-blue-400" size={20} />
          <span className="text-white font-black uppercase tracking-widest text-sm">Strategic Market Intelligence</span>
        </div>
        <button onClick={onDismiss} className="text-slate-500 hover:text-white"><X size={18}/></button>
      </div>
      <div className="p-8 grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Entry</p>
          <p className="text-xl font-black text-white">${formatCurrency(data.low)}</p>
        </div>
        <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-600/20 transform scale-110">
          <p className="text-[10px] text-blue-100 font-black uppercase mb-1">Median</p>
          <p className="text-2xl font-black text-white">${formatCurrency(data.med)}</p>
        </div>
        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Premium</p>
          <p className="text-xl font-black text-white">${formatCurrency(data.high)}</p>
        </div>
      </div>
      <p className="px-8 pb-8 text-xs text-slate-400 italic leading-relaxed">"{data.analysis}"</p>
    </div>
  );
}

// --- Main App Restored ---
export default function App() {
  const [activeTab, setActiveTab] = useState('jd');
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [salaryInsight, setSalaryInsight] = useState(null);
  const [emailDraft, setEmailDraft] = useState('');
  const [toolLoading, setToolLoading] = useState(false);
  const jdEditorRef = useRef(null);

  const handleAnalyze = async () => {
    if (!jobDescription || !resume) return;
    setLoading(true);
    // Simulation of API call logic from your previous version
    setTimeout(() => {
      setAnalysis({
        matchScore: 88,
        fitSummary: "Highly competent technical lead with strong FinTech scaling experience.",
        strengths: ["7+ years AWS experience", "Reduced latency by 45%", "Microservices expert"],
        gaps: ["Lacks Kubernetes orchestration detail", "Limited Python exposure"],
        interviewQuestions: ["How did you specifically achieve the 45% latency reduction?", "Explain your strategy for migrating legacy DBs to AWS."]
      });
      setLoading(false);
    }, 1500);
  };

  const downloadDoc = () => {
    const header = "<html><body style='font-family:Arial;'><h1>Candidate Assessment</h1>";
    const body = `<h2>Score: ${analysis?.matchScore}%</h2><p>${analysis?.fitSummary}</p>`;
    const blob = new Blob([header + body + "</body></html>"], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "Assessment.doc";
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="h-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="text-white" size={24} fill="currentColor" />
          </div>
          <span className="text-xl font-black uppercase tracking-tighter text-white">Recruit IQ <span className="text-blue-500">Elite</span></span>
        </div>
        <button onClick={downloadDoc} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-2xl border border-slate-700 text-[10px] font-black uppercase tracking-widest transition-all">
          <Download size={14} /> Download Word Doc
        </button>
      </header>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: Input */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-[700px]">
            <div className="flex p-2 bg-slate-950/50">
              <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl transition-all ${activeTab === 'jd' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>1. Job Description</button>
              <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl transition-all ${activeTab === 'resume' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>2. Candidate Resume</button>
            </div>
            
            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-slate-950/30">
              {activeTab === 'jd' && salaryInsight && <MarketInsightCard data={salaryInsight} />}
              {activeTab === 'jd' ? (
                <div 
                  ref={jdEditorRef} 
                  contentEditable 
                  className="outline-none text-lg leading-relaxed min-h-full whitespace-pre-wrap text-slate-300"
                  onInput={(e) => setJobDescription(e.currentTarget.innerText)}
                  placeholder="Paste Job Description here..."
                />
              ) : (
                <textarea 
                  className="w-full h-full bg-transparent outline-none text-lg leading-relaxed resize-none text-slate-300"
                  placeholder="Paste Resume here..."
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                />
              )}
            </div>

            <div className="p-8 bg-slate-950/50 border-t border-slate-800">
              <button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="w-full py-6 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Screen Candidate"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="space-y-8">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 p-20 text-center">
              <Sparkles size={60} className="mb-6 opacity-10" />
              <p className="text-xs uppercase tracking-[0.3em] font-black">Awaiting Analysis</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-8">
              {/* Synergy Score */}
              <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-blue-500"><BarChart3 size={150} /></div>
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-8">Synergy Analysis</h3>
                <div className="flex flex-col items-center">
                  <div className="w-40 h-40 rounded-full border-[10px] border-slate-800 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-5xl font-black shadow-2xl mb-6">
                    {analysis.matchScore}%
                  </div>
                  <p className="text-xl text-white font-black italic text-center leading-tight">"{analysis.fitSummary}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-10">
                  <div className="bg-slate-950/50 p-6 rounded-3xl border border-emerald-500/20">
                    <p className="text-[10px] font-black text-emerald-400 uppercase mb-3">Top Strengths</p>
                    <ul className="space-y-2">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" /> {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-950/50 p-6 rounded-3xl border border-rose-500/20">
                    <p className="text-[10px] font-black text-rose-400 uppercase mb-3">Critical Gaps</p>
                    <ul className="space-y-2">
                      {analysis.gaps.map((g, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2"><AlertCircle size={12} className="text-rose-500 mt-0.5 shrink-0" /> {g}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Email Tools */}
              <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-6">Email Outreach</h3>
                <div className="flex gap-4">
                  <button onClick={() => setEmailDraft("Invite Draft...")} className="flex-1 py-5 bg-slate-950 border border-slate-800 rounded-3xl hover:border-blue-500 transition-all flex flex-col items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                    <UserPlus size={20} className="text-blue-400" /> Interview Invite
                  </button>
                  <button onClick={() => setEmailDraft("Outreach Draft...")} className="flex-1 py-5 bg-slate-950 border border-slate-800 rounded-3xl hover:border-emerald-500 transition-all flex flex-col items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                    <Mail size={20} className="text-emerald-400" /> Cold Outreach
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}
