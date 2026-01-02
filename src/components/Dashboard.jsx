import React, { useState } from 'react';
import mammoth from 'mammoth'; // Fixes the binary text issue

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('jd'); 
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let text = "";
        if (file.name.endsWith('.docx')) {
          // Use mammoth to extract clean text from Word
          const result = await mammoth.extractRawText({ arrayBuffer: event.target.result });
          text = result.value;
        } else {
          text = new TextDecoder().decode(event.target.result);
        }
        
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

  return (
    <div className="flex-1 p-10 space-y-10 bg-[#020617] text-slate-200">
      {/* 1-2-3 Guide: Blue, Indigo, Emerald */}
      <div className="flex justify-between p-6 border rounded-3xl bg-slate-900/50 border-slate-800">
         <div className="flex items-center gap-4"><span className="flex items-center justify-center w-8 h-8 font-bold bg-blue-600 rounded-full shadow-lg">1</span><p className="text-xs font-bold uppercase">Set JD</p></div>
         <div className="flex items-center gap-4"><span className="flex items-center justify-center w-8 h-8 font-bold bg-indigo-600 rounded-full shadow-lg">2</span><p className="text-xs font-bold uppercase">Upload Resume</p></div>
         <div className="flex items-center gap-4"><span className="flex items-center justify-center w-8 h-8 font-bold bg-emerald-600 rounded-full shadow-lg">3</span><p className="text-xs font-bold uppercase">Screen</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-[#0f172a] rounded-[3rem] border border-slate-800 flex flex-col h-[700px] overflow-hidden">
          <div className="flex p-2 border-b bg-black/20 border-slate-800">
            <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl ${activeTab === 'jd' ? 'bg-slate-800' : ''}`}>Step 1: JD</button>
            <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl ${activeTab === 'resume' ? 'bg-slate-800' : ''}`}>Step 2: Resume</button>
          </div>
          <div className="p-4 border-b border-slate-800"><input type="file" onChange={handleFileUpload} className="text-xs text-blue-400" /></div>
          <textarea className="flex-1 p-8 bg-transparent outline-none resize-none" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
        </section>

        <section className="p-10 border-2 border-dashed rounded-[3rem] border-slate-800 flex items-center justify-center">
          <button onClick={() => alert('Analyzing...')} className="px-10 py-5 font-black text-white uppercase bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-600/20">3. Screen Candidate</button>
        </section>
      </div>
    </div>
  );
}
