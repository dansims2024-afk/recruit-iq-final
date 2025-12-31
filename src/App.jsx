import React, { useState, useRef } from 'react';
import { 
  Upload, CheckCircle, FileText, BrainCircuit, Target, Lock, 
  Search, BookOpen, X, ShieldCheck, Layers, Wand2, Printer, 
  Download, Zap, BarChart3, AlertCircle 
} from 'lucide-react';

const RecruitIQApp = () => {
  // --- TOKEN-SAFE CONFIGURATION ---
  const BATCH_LIMIT = 25; // Lowered from 100 to protect margins
  const [credits, setCredits] = useState(480); // Monthly credit limit (e.g., 500 total)
  
  // --- STATE ---
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [inputCategory, setInputCategory] = useState('single');
  const fileInputRef = useRef(null);

  // --- BUSINESS LOGIC ---
  const handleBatchUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > BATCH_LIMIT) {
      alert(`Batch limit exceeded. Pro accounts are limited to ${BATCH_LIMIT} resumes per scan to ensure high-fidelity analysis.`);
      setFiles(uploadedFiles.slice(0, BATCH_LIMIT));
    } else {
      setFiles(uploadedFiles);
    }
  };

  const handleScreenCandidate = () => {
    if (credits < (inputCategory === 'batch' ? files.length : 1)) {
      alert("Insufficient credits. Please upgrade your plan.");
      return;
    }
    
    setIsProcessing(true);
    // Simulate cost-safe processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowResultsModal(true);
      // Deduct credits based on usage
      setCredits(prev => prev - (inputCategory === 'batch' ? files.length : 1));
    }, 2500);
  };

  const handlePrint = () => window.print();

  // --- LOGO ---
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

        {/* TOKEN-SAFE CREDIT DASHBOARD */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end px-4 border-r border-white/10">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Available Credits</span>
            <span className="text-sm font-mono font-bold text-blue-400">{credits} / 500</span>
          </div>
          <div className="bg-[#0d1117] p-1 rounded-xl border border-white/10 flex">
            <button className="px-6 py-2 text-[10px] font-black bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-900/20 flex items-center gap-2">
              <Zap size={12} fill="currentColor" /> PRO PLAN
            </button>
          </div>
        </div>
      </header>

      <main className={`max-w-5xl mx-auto space-y-6 no-print ${showResultsModal ? 'opacity-10 blur-2xl pointer-events-none' : ''}`}>
        
        {/* INPUT MODE TOGGLES */}
        <div className="grid grid-cols-2 gap-4 bg-[#0d1117] p-2 rounded-3xl border border-white/5">
           <button onClick={() => setInputCategory('single')} className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${inputCategory === 'single' ? 'bg-[#1c2128] text-blue-400 shadow-xl' : 'text-slate-600'}`}>
             <FileText size={16} /> Single Screen
           </button>
           <button onClick={() => setInputCategory('batch')} className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${inputCategory === 'batch' ? 'bg-[#1c2128] text-orange-500 shadow-xl' : 'text-slate-600'}`}>
             <Layers size={16} /> Batch Mode (Max {BATCH_LIMIT})
           </button>
        </div>

        {/* MAIN INTERACTION AREA */}
        <div className="bg-[#0d1117] rounded-[2.5rem] border border-white/5 p-16 text-center shadow-2xl relative overflow-hidden">
            {/* Limit Warning for Batch */}
            {inputCategory === 'batch' && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
                <AlertCircle size={14} className="text-orange-500" />
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Token-Safe Limit: {BATCH_LIMIT} Files</span>
              </div>
            )}

            <div className="mb-8 inline-flex p-8 rounded-[2rem] bg-blue-600/5 text-blue-500 border border-blue-500/10">
                <Upload size={48} />
            </div>
            <h2 className="text-4xl font-black text-white italic mb-4 uppercase tracking-tighter">Ready to Screen</h2>
            <p className="text-slate-500 mb-10 max-w-md mx-auto">Generate high-fidelity Synergy Reports. Your usage is protected by our automated credit-monitoring system.</p>
            
            <div className="flex flex-col items-center gap-4">
              <input type="file" ref={fileInputRef} className="hidden" multiple={inputCategory === 'batch'} onChange={handleBatchUpload} />
              <button 
                onClick={() => isProcessing ? null : (files.length > 0 ? handleScreenCandidate() : fileInputRef.current.click())} 
                className={`px-16 py-6 rounded-2xl font-black tracking-[0.3em] uppercase text-xs transition-all ${isProcessing ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 text-white hover:scale-105 shadow-2xl shadow-blue-600/20'}`}
              >
                  {isProcessing ? "Analyzing Token Usage..." : (files.length > 0 ? `Screen ${files.length} Candidates` : "Select Files")}
              </button>
              {files.length > 0 && <button onClick={() => setFiles([])} className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white">Clear Queue</button>}
            </div>
        </div>
      </main>

      {/* THE PRINTABLE SYNERGY REPORT */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-10 bg-black/95 backdrop-blur-3xl overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white text-slate-900 w-full max-w-4xl min-h-screen md:min-h-0 md:rounded-[3rem] shadow-2xl overflow-hidden print:shadow-none print:m-0 flex flex-col">
            
            {/* UI Bar (Hidden on Print) */}
            <div className="bg-slate-100 px-10 py-6 flex justify-between items-center no-print border-b border-slate-200">
               <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-blue-600" />
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">Hiring Manager Assessment</span>
               </div>
               <div className="flex gap-3">
                 <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                    <Printer size={14} /> Print / Save as PDF
                 </button>
                 <button onClick={() => setShowResultsModal(false)} className="p-3 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
               </div>
            </div>

            {/* PRINTABLE PAGE CONTENT */}
            <div className="p-16 print:p-10 flex-1">
              <div className="flex justify-between items-start border-b-[6px] border-slate-900 pb-10 mb-10">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <SwirlLogo size={40} />
                    <h1 className="text-2xl font-black tracking-tighter italic uppercase">RECRUIT <span className="text-blue-600">IQ</span></h1>
                  </div>
                  <div className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded inline-block uppercase tracking-widest">Candidate Synergy Assessment</div>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-black italic text-blue-600 leading-none">88%</div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Synergy Match Score</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-16 mb-12">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b-2 border-slate-100 pb-2">Target Position</h3>
                  <p className="font-bold text-xl text-slate-900 uppercase italic tracking-tight">Senior Software Architect</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b-2 border-slate-100 pb-2">Analysis Context</h3>
                  <p className="font-bold text-xl text-slate-900 uppercase italic tracking-tight">Hiring Pipeline #402</p>
                </div>
              </div>

              <div className="bg-blue-50/50 p-10 rounded-[2rem] mb-12 border border-blue-100 relative">
                <div className="absolute -top-4 left-10 bg-blue-600 text-white px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Executive Summary</div>
                <p className="text-sm leading-relaxed text-slate-700 font-medium italic">
                  "This candidate demonstrates world-class alignment with our scaling architecture. Their experience 
                  transitioning legacy systems to serverless environments is a 100% match for our Q3 goals. While 
                  their management experience is slightly under the 8-year preference, their technical leadership 
                  at previous unicorns compensates for the gap."
                </p>
              </div>

              <div className="grid grid-cols-2 gap-12">
                <div>
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <CheckCircle size={14} /> Critical Assets
                  </h4>
                  <ul className="space-y-4">
                    {[
                      "Distributed Systems expertise (Node/Go)",
                      "Expert-level AWS/Terraform automation",
                      "High cultural synergy with lean teams",
                      "Data-driven architecture decisions"
                    ].map((item, i) => (
                      <li key={i} className="text-[11px] font-bold text-slate-800 flex gap-3 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <AlertCircle size={14} /> Calibration Notes
                  </h4>
                  <ul className="space-y-4">
                    {[
                      "Lacks experience with APAC timezones",
                      "Formal Kubernetes cert is expired",
                      "Salary expectations: Top Quartile"
                    ].map((item, i) => (
                      <li key={i} className="text-[11px] font-bold text-slate-800 flex gap-3 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-24 pt-10 border-t-2 border-slate-100 flex justify-between items-center opacity-50">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Confidential Recruitment Document • {new Date().toLocaleDateString()}</p>
                <div className="flex items-center gap-2">
                   <SwirlLogo size={16} />
                   <span className="text-[9px] font-black tracking-tighter uppercase italic text-slate-900">RECRUIT <span className="text-blue-600">IQ</span></span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .fixed { position: relative !important; }
          .bg-black\/95 { background: white !important; }
          .backdrop-blur-3xl { backdrop-filter: none !important; }
        }
      `}</style>
    </div>
  );
};

export default RecruitIQApp;
