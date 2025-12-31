import React, { useState, useRef } from 'react';
import { 
  Upload, CheckCircle, FileText, BrainCircuit, Target, Lock, 
  Search, BookOpen, X, ShieldCheck, Layers, Wand2, Printer, 
  Download, Zap, BarChart3, AlertCircle, TrendingUp, HelpCircle, ListChecks
} from 'lucide-react';

const RecruitIQApp = () => {
  const [files, setFiles] = useState({ jd: null, resume: null });
  const [textData, setTextData] = useState({ jd: "", resume: "" });
  const [activeTab, setActiveTab] = useState(1);
  const [mode, setMode] = useState({ 1: 'text', 2: 'text' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const fileInputRef = useRef(null);

  // --- RESTORED FULL SAMPLES ---
  const useSample = () => {
    setMode({ 1: 'text', 2: 'text' });
    setTextData({
      jd: `SENIOR PRODUCT MANAGER - AI PLATFORM\n\nRole Overview:\nWe are looking for a Senior PM to lead our AI Infrastructure team. \n\nKey Requirements:\n- 8+ years of experience in technical product management.\n- Proven track record with LLM integrations and MLOps.\n- Deep experience in SQL, Python, and Data Visualization.\n- Experience managing Series B+ growth stages.`,
      resume: `ALEX R. CANDIDATE\n\nSummary:\nTechnical Product Leader with 6.5 years of experience specializing in AI/ML scaling.\n\nExperience:\nProduct Lead @ TechFlow (3 years): Led the transition to OpenAI-based customer support bots, reducing latency by 40%.\nProduct Manager @ DataSync (3.5 years): Managed SQL-based analytics dashboard for 500+ enterprise clients.\n\nSkills:\nPython, SQL, React, AWS, LLM Fine-tuning.`
    });
  };

  const handleScreenCandidate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowResultsModal(true);
    }, 2500);
  };

  const isStepDone = (num) => {
    const type = num === 1 ? 'jd' : 'resume';
    return files[type] || textData[type].length > 50;
  };

  const isReady = isStepDone(1) && isStepDone(2);

  const SwirlLogo = ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <defs>
        <linearGradient id="swirlGrad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path d="M20 4C11.1 4 4 11.1 4 20C4 28.8 11.1 36 20 36" stroke="url(#swirlGrad)" strokeWidth="6" strokeLinecap="round" />
      <path d="M36 20C36 11.1 28.8 4 20 4" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
      <path d="M20 36C28.8 36 36 28.8 36 20" stroke="#a855f7" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#020408] text-slate-200 p-6 md:p-10 font-sans relative">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 no-print">
        <div className="flex items-center gap-4">
          <SwirlLogo />
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">RECRUIT <span className="text-blue-500">IQ</span></h1>
        </div>
        <div className="bg-[#0d1117] p-1 rounded-xl border border-white/10 flex">
          <button className="px-6 py-2 text-[10px] font-black bg-blue-600 text-white rounded-lg">PRO PLAN</button>
        </div>
      </header>

      {/* Main UI */}
      <main className={`max-w-4xl mx-auto space-y-6 no-print ${showResultsModal ? 'opacity-10 blur-2xl' : ''}`}>
        
        {/* Guide & Sample Toggle */}
        <div className="flex justify-between items-center px-6">
          <h2 className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase italic">System Input</h2>
          <button onClick={useSample} className="text-[10px] font-black text-blue-500 border border-blue-500/20 px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-all uppercase">Try Full Sample (JD + Resume)</button>
        </div>

        <div className="bg-[#0d1117] rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col shadow-2xl">
          <div className="flex bg-black/40 p-2 gap-2 border-b border-white/5">
            {[1, 2].map((num) => (
              <button key={num} onClick={() => setActiveTab(num)} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black transition-all ${activeTab === num ? 'bg-[#1c2128] text-blue-400' : 'text-slate-600'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isStepDone(num) ? 'bg-emerald-500 text-white' : 'bg-slate-800'}`}>
                  {isStepDone(num) ? <CheckCircle size={12} /> : num}
                </div>
                {num === 1 ? 'JOB DESCRIPTION' : 'CANDIDATE RESUME'}
              </button>
            ))}
          </div>

          <div className="p-10">
            <textarea 
              value={activeTab === 1 ? textData.jd : textData.resume}
              onChange={(e) => setTextData(prev => ({ ...prev, [activeTab === 1 ? 'jd' : 'resume']: e.target.value }))}
              placeholder={`Paste the ${activeTab === 1 ? 'Job Description' : 'Resume'} text here...`}
              className="w-full h-64 bg-black/20 border border-white/5 rounded-[2rem] p-8 text-sm text-slate-400 focus:outline-none focus:border-blue-500/50 resize-none font-mono transition-all"
            />
          </div>
        </div>

        <button 
          disabled={!isReady || isProcessing}
          onClick={handleScreenCandidate}
          className={`w-full py-8 rounded-[2rem] flex items-center justify-center gap-4 font-black tracking-[0.4em] transition-all ${isReady ? 'bg-blue-600 text-white shadow-2xl' : 'bg-[#0d1117] text-slate-800 border border-white/5 opacity-50'}`}
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} className="text-orange-400" />}
          {isProcessing ? "PROCESSING ANALYSIS..." : "SCREEN CANDIDATE"}
        </button>
      </main>

      {/* THE DEEP-DIVE PRINTABLE REPORT */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-10 bg-black/95 backdrop-blur-3xl overflow-y-auto">
          <div className="bg-white text-slate-900 w-full max-w-4xl rounded-none md:rounded-[2rem] shadow-2xl flex flex-col print:shadow-none print:m-0">
            
            <div className="bg-slate-100 px-10 py-6 flex justify-between items-center no-print border-b border-slate-200">
               <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Recruit IQ Synergy Audit</span>
               <div className="flex gap-3">
                 <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
                    <Printer size={14} /> Download PDF
                 </button>
                 <button onClick={() => setShowResultsModal(false)} className="p-3 hover:bg-slate-200 rounded-full text-slate-400"><X size={24} /></button>
               </div>
            </div>

            <div className="p-16 print:p-10 flex-1">
              {/* Header */}
              <div className="flex justify-between items-start border-b-[6px] border-slate-900 pb-10 mb-10">
                <div className="flex items-center gap-4">
                  <SwirlLogo size={40} />
                  <h1 className="text-2xl font-black tracking-tighter italic uppercase italic tracking-tighter">RECRUIT <span className="text-blue-600">IQ</span></h1>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-black italic text-blue-600 leading-none">88%</div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Synergy Score</p>
                </div>
              </div>

              {/* Analysis Grid */}
              <div className="mb-12">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ShieldCheck size={16} /> Executive Deep-Dive
                </h3>
                <div className="space-y-6">
                  <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem]">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase mb-3">Strength Analysis</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">Candidate demonstrates exceptional technical alignment in AI infrastructure. Their direct experience with LLM orchestration and MLOps at TechFlow mirrors the core requirements of this role. Their trajectory suggests they are ready for the Series B scaling challenges we face.</p>
                  </div>

                  <div className="p-8 bg-orange-50/30 border border-orange-100 rounded-[2rem]">
                    <h4 className="text-[10px] font-black text-orange-600 uppercase mb-3">Gap Mitigation Strategy</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium italic">"The management tenure (6.5 years vs 8 preferred) is the primary gap. However, the complexity of the teams they managed suggests the depth of experience is sufficient. Calibrate during the interview on their ability to handle large-scale cross-functional politics."</p>
                  </div>
                </div>
              </div>

              {/* THE BOTTOM DETAIL SECTION: Requirement vs Evidence Table */}
              <div className="mb-12">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ListChecks size={16} /> Technical Evidence Matrix
                </h3>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Requirement</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest">Candidate Evidence</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-center">Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { req: "Technical PM (8+ Years)", ev: "6.5 years total; Lead role at TechFlow", match: "80%" },
                        { req: "AI / LLM Integration", ev: "Implemented OpenAI bots; MLOps pipeline lead", match: "100%" },
                        { req: "SQL / Python Proficiency", ev: "Managed enterprise analytics dashboards", match: "100%" },
                        { req: "AWS / Cloud Infrastructure", ev: "AWS CloudFormation & S3 architecture", match: "90%" }
                      ].map((item, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4 text-[11px] font-bold text-slate-800">{item.req}</td>
                          <td className="px-6 py-4 text-[11px] text-slate-500 leading-relaxed">{item.ev}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{item.match}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interview Strategy Footer */}
              <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-10">
                <div className="space-y-2">
                  <h5 className="text-[9px] font-black text-slate-400 uppercase">Verification Question</h5>
                  <p className="text-[11px] text-slate-700 font-bold italic">"How did you handle model latency issues during the OpenAI transition at TechFlow?"</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2 italic">Official Recruitment Audit</p>
                  <div className="flex items-center justify-end gap-2">
                    <SwirlLogo size={20} />
                    <span className="text-xs font-black tracking-tighter uppercase italic tracking-tighter">RECRUIT <span className="text-blue-600">IQ</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .fixed { position: static !important; }
          .bg-black\/95 { background: transparent !important; }
        }
      `}</style>
    </div>
  );
};

export default RecruitIQApp;
