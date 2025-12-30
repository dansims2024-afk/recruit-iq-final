import React, { useState, useRef } from 'react';
import { Sparkles, Zap, Loader2, BarChart3, Briefcase, FileText, Upload, Mail, CheckCircle2, AlertCircle, Printer, DollarSign, Send, ClipboardCheck } from 'lucide-react';

export default function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [activeTab, setActiveTab] = useState('jd');
  const [analysis, setAnalysis] = useState(null);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [simTier, setSimTier] = useState('standard');
  const fileInputRef = useRef(null);

  const isJDFilled = jobDescription.trim().length > 50;
  const isResumeFilled = resume.trim().length > 50;

  // Populates the FULL JD and Resume content
  const loadSampleData = () => {
    setJobDescription(`📄 Job Title: Medical Assistant
Overview
We are seeking a skilled and compassionate Medical Assistant to join our healthcare team. The ideal candidate will support physicians and nurses in delivering high-quality patient care by performing clinical and administrative tasks.

Key Responsibilities
- Welcome patients, record vital signs, and prepare them for examination
- Assist providers during exams, procedures, and treatments
- Collect and process laboratory specimens (blood, urine, etc.)
- Record patient medical history and update EMR accurately
- Schedule appointments and manage patient flow

Qualifications
- High school diploma or GED required
- Completion of an accredited Medical Assistant program preferred
- CMA, RMA, or equivalent certification is a plus
- Proficient with EMR systems and office software`);

    setResume(`Jill McSample | Newark, NJ
📞 (555) 123-4567 | 📧 jill.mssample@email.com

Professional Summary
Detail-oriented and compassionate Medical Assistant with experience supporting physicians, performing clinical tasks, and maintaining efficient office workflow. Skilled in patient care, EMR management, and vitals collection.

Core Skills
- Patient Intake & Vital Signs
- Electronic Medical Records (Epic, Cerner)
- Injections & Specimen Collection
- Medical Terminology & Infection Control

Professional Experience
Medical Assistant | ABC Family Clinic | Newark, NJ
- Welcome and prepare patients for examinations, recording vitals
- Perform specimen collection and basic lab work
- Document patient information in EMR with accuracy

Certifications
- Certified Medical Assistant (CMA) – AAMA
- BLS/CPR Certified (American Heart Association)`);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (activeTab === 'jd') setJobDescription(e.target.result);
      else setResume(e.target.result);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    if (!isJDFilled || !isResumeFilled) return;
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 94,
        fitSummary: "Jill is an exceptional match. She holds the preferred CMA certification and has direct experience in both clinical and administrative tasks required for this role.",
        strengths: [
          "Active CMA Certification: Candidate holds the American Association of Medical Assistants (AAMA) credential, meeting the highest industry standard.",
          "EMR Proficiency (Epic/Cerner): Demonstrates advanced knowledge of Electronic Health Records, ensuring immediate data accuracy.",
          "Local Clinical Experience: Extensive hands-on experience in the Newark health system, providing valuable local context.",
          "Clinical Versatility: Proven ability to transition between front-office duties and complex back-office procedures."
        ],
        gaps: [
          "Specialized Lab Testing: May require brief orientation on specific high-complexity testing protocols used in this facility.",
          "Inventory Management Systems: Resume lacks explicit mention of supply-chain software beyond general EMR modules."
        ],
        interviewQuestions: [
          "Can you describe a specific time you had to handle an emergency during the intake process?",
          "Which EMR systems are you most comfortable with, and how do you ensure zero-error documentation?",
          "How do you prioritize clinical duties when the office is experiencing a sudden high-volume surge?",
          "Describe your experience with sterile field maintenance and infection control.",
          "How do you stay updated with changing medical terminology and evolving compliance standards?"
        ],
        marketData: { low: 38500, avg: 47200, high: 56000 }
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-10 sticky top-0 z-50">
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

      {/* QUICK START GUIDE */}
      <section className="max-w-7xl mx-auto w-full px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`transition-all duration-500 bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 ${isJDFilled ? 'border-emerald-500/50' : 'border-blue-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition-colors ${isJDFilled ? 'bg-emerald-600' : 'bg-blue-600'}`}>
              {isJDFilled ? <CheckCircle2 size={18} /> : '1'}
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-widest font-bold ${isJDFilled ? 'text-emerald-400' : 'text-blue-400'}`}>Step 1</p>
              <p className="text-xs text-slate-400 font-medium">Add Job Description</p>
            </div>
          </div>
          <div className={`transition-all duration-500 bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 ${isResumeFilled ? 'border-emerald-500/50' : 'border-purple-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition-colors ${isResumeFilled ? 'bg-emerald-600' : 'bg-purple-600'}`}>
              {isResumeFilled ? <CheckCircle2 size={18} /> : '2'}
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-widest font-bold ${isResumeFilled ? 'text-emerald-400' : 'text-purple-400'}`}>Step 2</p>
              <p className="text-xs text-slate-400 font-medium">Add Candidate Resume</p>
            </div>
          </div>
          <div className={`transition-all duration-500 bg-slate-900/50 border p-4 rounded-2xl flex items-center gap-4 ${analysis ? 'border-emerald-500/50' : 'border-amber-500/20'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition-colors ${analysis ? 'bg-emerald-600' : 'bg-amber-600'}`}>
              {analysis ? <CheckCircle2 size={18} /> : '3'}
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-widest font-bold ${analysis ? 'text-emerald-400' : 'text-amber-400'}`}>Step 3</p>
              <p className="text-xs text-slate-400 font-medium">AI Synergy & Tools</p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* INPUT BOX */}
        <section className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-[700px] overflow-hidden shadow-2xl">
          <div className="flex bg-slate-950/50 border-b border-slate-800 p-2 gap-2">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 text-xs uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'jd' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
              <Briefcase size={14} /> Job Description {isJDFilled && <CheckCircle2 size={14} className="text-emerald-500" />}
            </button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 text-xs uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'resume' ? 'bg-slate-800 text-purple-400' : 'text-slate-500'}`}>
              <FileText size={14} /> Resume {isResumeFilled && <CheckCircle2 size={14} className="text-emerald-500" />}
            </button>
          </div>
          
          <div className="relative flex-1">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <textarea 
              className="w-full h-full p-6 bg-transparent text-slate-300 outline-none resize-none text-sm leading-relaxed" 
              value={activeTab === 'jd' ? jobDescription : resume} 
              onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)}
              placeholder="Paste content here..."
            />
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <button onClick={loadSampleData} className="text-[10px] text-purple-400 hover:text-white border border-purple-500/30 px-3 py-1.5 rounded-lg font-bold transition-all">Sample</button>
              <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 text-[10px] text-slate-400 border border-white/10 px-3 py-1.5 rounded-lg font-bold bg-slate-800"><Upload size={12} /> Upload</button>
            </div>
          </div>

          <div className="p-6 bg-slate-950/30 border-t border-slate-800">
            <button onClick={handleAnalyze} disabled={!isJDFilled || !isResumeFilled} className={`w-full py-4 rounded-2xl font-bold uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${(!isJDFilled || !isResumeFilled) ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90'}`}>
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} Run Synergy Scan
            </button>
          </div>
        </section>

        {/* RESULTS BOX */}
        <section className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {!analysis ? (
             <div className="h-full border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-700 uppercase text-[10px] tracking-widest">Awaiting Scan</div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex items-center gap-8">
                <div className="w-24 h-24 rounded-full border-4 border-purple-500 flex items-center justify-center bg-slate-950 shrink-0">
                  <span className="text-3xl font-black text-white">{analysis.matchScore}%</span>
                </div>
                <div>
                  <h3 className="text-purple-400 font-bold uppercase text-[10px] mb-2 tracking-widest">Fit Summary</h3>
                  <p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.fitSummary}"</p>
                </div>
              </div>

              {/* Comp Intel */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest mb-10 flex items-center gap-2"><DollarSign size={14}/> Comp Intelligence</h3>
                <div className="px-4">
                  <div className="relative h-4 bg-slate-950 rounded-full border border-white/5 shadow-inner">
                    <div className="absolute left-1/2 -top-10 -translate-x-1/2 flex flex-col items-center">
                       <span className="text-[14px] font-black text-white">${analysis.marketData.avg.toLocaleString()}</span>
                       <span className="text-[8px] uppercase text-purple-400 font-bold">Market Median</span>
                       <div className="w-0.5 h-6 bg-purple-500 mt-1"></div>
                    </div>
                    <div className="flex justify-between absolute -bottom-8 w-full px-1">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Low: ${analysis.marketData.low.toLocaleString()}</span>
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">High: ${analysis.marketData.high.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                  <span className="text-emerald-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2"><CheckCircle2 size={12}/> Strengths Profile</span>
                  <ul className="text-xs text-slate-400 space-y-4">
                    {analysis.strengths.map((s, i) => <li key={i}><span className="text-white font-bold">•</span> {s}</li>)}
                  </ul>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl border border-rose-500/20">
                  <span className="text-rose-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2"><AlertCircle size={12}/> Growth Gaps Identified</span>
                  <ul className="text-xs text-slate-400 space-y-4">
                    {analysis.gaps.map((g, i) => <li key={i}><span className="text-white font-bold">•</span> {g}</li>)}
                  </ul>
                </div>
              </div>

              {/* Email Gen */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                   <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><Send size={14} /> Corporate Outreach Email</h3>
                   <button onClick={() => setGeneratedEmail("Subject: Career Opportunity: Medical Assistant Role\n\nHi Jill,\n\nI was impressed by your experience at ABC Family Clinic and your CMA certification. We are currently looking for a Medical Assistant proficient in EMR systems in Newark...")} className="ml-auto bg-purple-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase">Generate</button>
                </div>
                {generatedEmail && <div className="p-6 bg-slate-950 rounded-2xl border border-white/5 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed animate-in fade-in">{generatedEmail}</div>}
              </div>

              {/* Interview Guide */}
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-purple-400 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><ClipboardCheck size={14} /> AI Interview Guide</h3>
                  <button onClick={() => window.print()} className="p-2 text-slate-400 hover:text-white transition-all print:hidden"><Printer size={16} /></button>
                </div>
                <div className="space-y-4">
                  {analysis.interviewQuestions.map((q, i) => (
                    <div key={i} className="p-5 bg-slate-950 rounded-2xl border border-white/5 text-sm text-slate-300 italic">"{q}"</div>
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
