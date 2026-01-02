import React, { useState } from 'react';
import mammoth from 'mammoth';

// REQUIRED: Export default ensures App.jsx can import it
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('jd'); 
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
        
        if (activeTab === 'jd') setJdText(text);
        else setResumeText(text);
      } catch (err) {
        console.error("Parsing Error", err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8">
      {/* 1-2-3 Guide */}
      <div className="flex justify-between p-6 bg-slate-900 border border-slate-800 rounded-3xl">
         <div className="flex items-center gap-3"><span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span> Fill JD</div>
         <div className="flex items-center gap-3"><span className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span> Resume</div>
         <div className="flex items-center gap-3"><span className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span> Screen</div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 flex flex-col h-[600px]">
           <div className="flex gap-2 mb-4">
             <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase ${activeTab === 'jd' ? 'bg-slate-800' : ''}`}>Job Description</button>
             <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase ${activeTab === 'resume' ? 'bg-slate-800' : ''}`}>Resume</button>
           </div>
           <input type="file" onChange={handleFileUpload} className="mb-4 text-xs text-slate-500" />
           <textarea 
             className="flex-1 bg-transparent resize-none outline-none text-slate-300"
             placeholder="Paste or upload text..."
             value={activeTab === 'jd' ? jdText : resumeText}
             onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
           />
        </div>
        
        <div className="flex items-center justify-center border-2 border-dashed border-slate-800 rounded-[2rem]">
           <button onClick={() => alert("Analysis Running...")} className="px-8 py-4 bg-emerald-600 rounded-xl font-black uppercase hover:scale-105 transition">Run Screen</button>
        </div>
      </div>
    </div>
  );
}
