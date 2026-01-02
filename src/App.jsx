import React, { useState, useEffect, useRef, useCallback } from 'react';
// Note: Clerk and Stripe imports should remain in your project root
// import { UserButton, useUser } from "@clerk/nextjs"; 

// --- Constants & Config ---
const TEXT_MODEL = "gemini-2.0-flash-exp"; // 2026 Stable Model

const SAMPLE_JD = `Senior Full Stack Engineer (FinTech Innovation Lab)
- Architect and develop scalable microservices using Node.js and TypeScript.
- Build performant user interfaces with React 18.
- Lead migrations to AWS cloud-native architecture.
- 7+ years of professional experience required.`;

const SAMPLE_RESUME = `Alex Rivera | Lead Engineer | San Francisco, CA
- Led redesign of core payment engine, reducing latency by 45%.
- Scaled AWS infrastructure to support 3x user growth.
- Expert in TypeScript, React, Node.js, and PostgreSQL.`;

// --- UI Components: Build-Safe Icons ---
const Icons = {
  Zap: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Upload: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Download: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
};

export default function RecruitIQElite() {
  const [activeTab, setActiveTab] = useState('jd');
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [libsLoaded, setLibsLoaded] = useState(false);

  // --- External Library Loader (PDF/DOCX) ---
  useEffect(() => {
    const loadScript = (src) => new Promise((res) => {
      const s = document.createElement('script'); s.src = src; s.onload = res;
      document.head.appendChild(s);
    });
    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js')
    ]).then(() => setLibsLoaded(true));
  }, []);

  // --- Feature: File Upload Logic ---
  const handleFileUpload = useCallback(async (e, target) => {
    const file = e.target.files[0];
    if (!file || !libsLoaded) return;
    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      let text = "";
      try {
        if (file.type === "application/pdf") {
          const pdf = await window.pdfjsLib.getDocument({ data: event.target.result }).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(it => it.str).join(" ") + "\n";
          }
        } else if (file.name.endsWith('.docx')) {
          const res = await window.mammoth.extractRawText({ arrayBuffer: event.target.result });
          text = res.value;
        } else {
          text = event.target.result;
        }
        
        if (target === 'jd') setJobDescription(text);
        else setResume(text);
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (file.type.includes('pdf') || file.name.endsWith('.docx')) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  }, [libsLoaded]);

  // --- Feature: Load Samples ---
  const loadSamples = () => {
    setJobDescription(SAMPLE_JD);
    setResume(SAMPLE_RESUME);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Clerk & Stripe Integrated Header */}
      <header className="h-20 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><Icons.Zap /></div>
          <span className="text-xl font-black uppercase tracking-tighter text-white">Recruit IQ <span className="text-blue-500">Elite</span></span>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Stripe Hook */}
          <button className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 hover:bg-blue-500/20">Upgrade via Stripe</button>
          
          {/* Clerk Placeholder */}
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold">User</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="bg-[#0f172a] rounded-[3rem] border border-slate-800 flex flex-col h-[750px] overflow-hidden">
          <div className="flex p-2 bg-[#020617]/40 border-b border-slate-800">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl ${activeTab === 'jd' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Job Description</button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl ${activeTab === 'resume' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Resume</button>
          </div>

          <div className="p-6 border-b border-slate-800 flex justify-between">
            <label className="flex items-center gap-2 cursor-pointer bg-blue-600/10 px-4 py-2 rounded-xl border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase">
              <Icons.Upload /> Upload PDF/DOCX
              <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, activeTab)} />
            </label>
            <button onClick={loadSamples} className="text-[10px] font-black uppercase text-slate-500 hover:text-white">Load Sample Data</button>
          </div>

          <textarea 
            className="flex-1 p-10 bg-transparent outline-none text-lg text-slate-300 resize-none custom-scrollbar" 
            placeholder={`Paste or upload ${activeTab.toUpperCase()}...`} 
            value={activeTab === 'jd' ? jobDescription : resume}
            onChange={(e) => activeTab === 'jd' ? setJobDescription(e.target.value) : setResume(e.target.value)}
          />

          <div className="p-8 border-t border-slate-800 bg-[#020617]/20">
            <button className="w-full py-6 rounded-3xl bg-blue-600 text-white font-black uppercase text-sm">Screen Candidate</button>
          </div>
        </section>

        {/* Intelligence results would render here after Screening */}
        <section className="border-2 border-dashed border-slate-800 rounded-[3rem] flex items-center justify-center text-slate-600">
          <p className="text-[10px] uppercase font-black tracking-widest italic">Analysis Output Panel</p>
        </section>
      </main>
    </div>
  );
}
