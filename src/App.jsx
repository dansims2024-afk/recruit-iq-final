import React, { useState, useRef } from 'react';
import { Sparkles, Zap, Loader2, BarChart3, Briefcase, FileText, Upload, Mail, CheckCircle2, AlertCircle, Printer, DollarSign, Send } from 'lucide-react';

export default function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [activeTab, setActiveTab] = useState('jd');
  const [analysis, setAnalysis] = useState(null);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [simTier, setSimTier] = useState('standard');
  const fileInputRef = useRef(null);

  const loadSampleData = () => {
    setJobDescription(`📄 Job Title: Medical Assistant\nOverview: Seeking a skilled Medical Assistant to support providers in clinical and administrative tasks.\nKey Responsibilities: Record vitals, assist in exams, and manage EMR documentation.`);
    setResume(`Jill McSample | Newark, NJ\nSummary: Compassionate Medical Assistant with experience in patient intake, EMR management, and vitals collection.\nCertifications: Certified Medical Assistant (CMA), BLS/CPR.`);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (activeTab === 'jd') setJobDescription(text);
      else setResume(text);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    if (!jobDescription || !resume) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        fitSummary: "Jill is an exceptional match. She holds the preferred CMA certification and has direct experience in both clinical and administrative tasks required for this role.",
        strengths: [
          "Active CMA Certification: Candidate holds the American Association of Medical Assistants (AAMA) credential, meeting the highest industry standard for this role.",
          "EMR Proficiency (Epic/Cerner): Demonstrates advanced knowledge of Electronic Health Records, reducing training time and ensuring immediate data accuracy.",
          "Local Clinical Experience: Extensive hands-on experience in the Newark health system, providing valuable local context and patient demographic understanding.",
          "Clinical Versatility: Proven ability to transition seamlessly between front-office administrative duties and complex back-office clinical procedures like phlebotomy."
        ],
        gaps: [
          "Specialized Lab Testing: While proficient in basic lab work, the candidate may require brief orientation on specific high-complexity testing protocols used in this facility.",
          "Inventory Management Systems: Resume lacks explicit mention of supply-chain or inventory software beyond general EMR supply tracking modules."
        ],
        interviewQuestions: [
          "Can you describe a specific time you had to handle an emergency or a difficult patient during the intake process?",
          "Which EMR systems are you most comfortable with, and how do you ensure zero-error documentation?",
          "How do you prioritize your clinical duties when the office is experiencing a sudden high-volume patient surge?",
          "Describe your experience with sterile field maintenance and infection control during minor office procedures.",
          "How do you stay updated with changing medical terminology and evolving healthcare compliance standards?"
        ],
        marketData: { low: 38000, avg: 45000, high: 54000 }
      });
      setLoading(false);
    }, 1500);
  };

  const generateEmail = () => {
    setGeneratedEmail(`Subject: Application for Medical Assistant - Jill McSample\n\nDear Hiring Manager,\n\nI am reaching out regarding the Medical Assistant position. Based on my review of your requirements for EMR management and clinical support, my background as a Certified Medical Assistant (CMA) with experience in patient vitals and specimen collection makes me a strong fit for your team in Newark.\n\nI look forward to discussing how I can contribute to your clinic's success.\n\nBest regards,\nJill McSample`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans print:bg-white print:text-black">
      {/* HEADER */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-50 print:hidden">
        <div className="flex items-center gap-3">
          <div className="relative w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)]"></div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">RECRUIT</span>
            <span className="text-purple-500 ml-1">IQ</span>
          </h1>
        </div>
        
        <div className="flex bg-slate-950/50 border border-white/5 rounded-2xl p-1 shadow-inner">
          {['standard', 'professional', 'executive'].map(t => (
            <button key={t} onClick={() => setSimTier(t)} className={`px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${simTier === t ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500'}`}>{t}</button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[750px] overflow-hidden shadow-2xl print:hidden">
          <div className="flex bg-slate-950/50 border-b border-slate-800 p-2 gap-2">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 text-xs uppercase font-bold rounded-xl transition-all ${activeTab === 'jd' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
              <Briefcase size={14} className="inline mr-2" /> Job Description
            </button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 text-xs uppercase font-bold rounded-xl transition-all ${activeTab === 'resume' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
              <FileText size={14} className="inline mr-2" /> Resume
            </button>
          </div>
          
          <div className="relative flex-1">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <textarea 
              className="w-full h-full p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" 
              value={activeTab === 'jd' ? jobDescription : resume} 
              onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)}
              placeholder={`Paste ${activeTab === 'jd' ? 'Job Description' : 'Resume'} here...`}
            />
            {/* BUTTONS ON SAME LINE */}
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <button onClick={loadSampleData} className="text-[10px] text-purple-400 hover:text-white border border-purple-500/30 px-3 py-1.5 rounded-lg uppercase font-bold transition-all">
                Load Sample
              </button>
              <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 text-[10px] text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg uppercase font-bold transition-all bg-slate-800">
                <Upload size={12} /> Upload
              </button>
            </div>
          </div>

          <div className="p-6 bg-slate-950/30 border-t border-slate-800">
            <button onClick={handleAnalyze} className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold uppercase hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl">
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'Analyzing Synergy...' : 'Run Synergy Scan'}
            </button>
          </div>
        </section>

        {/* RESULTS PANEL */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {!analysis ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-700">
              <BarChart3 size={48} className="opacity-20 mb-4" />
              <p className="uppercase text-[10px] tracking-widest text-center">Awaiting Data Scan</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Score in a Circle */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl flex items-center gap-8">
                <div className="w-28 h-28 rounded-full border-4 border-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)] shrink-0">
                  <span className="text-3xl font-black text-white">{analysis.matchScore}%</span>
                </div>
                <div>
                  <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-2">Fit Summary</h3>
                  <p className="text-slate-300 italic leading-relaxed text-sm">"{analysis.fitSummary}"</p>
                </div>
              </div>

              {/* Market Intelligence Section */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2"><DollarSign size={14}/> Market Intelligence</h3>
                <div className="relative pt-6">
                  <div className="h-2 w-full bg-slate-800 rounded-full relative">
                    <div className="absolute left-1/2 -translate-x-1/2 -top-6 text-[10px] font-bold text-purple-400">Market Avg: ${analysis.marketData.avg.toLocaleString()}</div>
                    <div className="absolute left-1/2 top-0 w-1 h-2 bg-purple-500"></div>
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-bold">
                    <span>Low: ${analysis.marketData.low.toLocaleString()}</span>
                    <span>High: ${analysis.marketData.high.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Elaborated Strengths & Gaps */}
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                  <span className="text-emerald-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2"><CheckCircle2 size={12}/> Detailed Key Strengths</span>
                  <ul className="text-xs text-slate-400 space-y-4">
                    {analysis.strengths.map((s, i) => <li key={i} className="leading-relaxed"><span className="text-white font-bold">•</span> {s}</li>)}
                  </ul>
                </div>
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                  <span className="text-rose-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2"><AlertCircle size={12}/> Critical Growth Gaps</span>
                  <ul className="text-xs text-slate-400 space-y-4">
                    {analysis.gaps.map((g, i) => <li key={i} className="leading-relaxed"><span className="text-white font-bold">•</span> {g}</li>)}
                  </ul>
                </div>
              </div>

              {/* Email Generator Section */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><Send size={14} /> Custom Email Generator</h3>
                  <button onClick={generateEmail} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-purple-500 transition-all">Generate Email</button>
                </div>
                {generatedEmail && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed animate-in fade-in">
                    {generatedEmail}
                  </div>
                )}
              </div>

              {/* Printable AI Interview Guide */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 print:border-none print:shadow-none">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><Mail size={14} /> AI Interview Guide (5 Questions)</h3>
                  <button onClick={() => window.print()} className="p-2 text-slate-400 hover:text-white transition-all print:hidden"><Printer size={16} /></button>
                </div>
                <div className="space-y-4">
                  {analysis.interviewQuestions.map((q, i) => (
                    <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-300 italic print:bg-white print:text-black">"{q}"</div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </section>
      </main>
    </div>
  );
}
