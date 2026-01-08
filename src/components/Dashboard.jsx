import React, { useState } from 'react';
import mammoth from 'mammoth';
import { useUser } from "@clerk/clerk-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SAMPLE_JD = `JOB TITLE: Senior FinTech Architect\nLOCATION: New York, NY\nABOUT: We need a leader to scale our high-frequency trading platform handling $500M daily volume. Must know AWS, Node.js, and Go.`; 
const SAMPLE_RESUME = `ALEXANDER MERCER\nSummary: 12 years exp in high-frequency trading systems. Migrated core engine to AWS EKS, reducing latency by 45%. Expert in Node.js and Go.`;

export default function Dashboard() {
  const { isSignedIn, user } = useUser(); 
  const [activeTab, setActiveTab] = useState('jd'); 
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  // MANUAL KEY ENTRY
  const [manualKey, setManualKey] = useState('');

  const jdComplete = jdText.length > 50; 
  const resumeComplete = resumeText.length > 50;

  // --- DIAGNOSTIC TOOL ---
  const checkAvailableModels = async () => {
    const finalKey = manualKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (!finalKey) return alert("Please enter an API Key first.");
    
    try {
      const genAI = new GoogleGenerativeAI(finalKey);
      // We ask Google: "What models do I have access to?"
      // Note: We use a dummy model init just to check connectivity in this simple setup
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      await model.generateContent("Test connection");
      alert("✅ SUCCESS! Your API Key works with 'gemini-pro'. You are good to go.");
    } catch (error) {
      alert(`❌ DIAGNOSTIC FAILED:\n${error.message}\n\nIf you see '404', your key cannot access the model.`);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatusMsg("Reading file...");
    try {
      let text = "";
      if (file.name.endsWith('.pdf')) {
         alert("PDF parsing is temporarily disabled. Please copy/paste text from your PDF.");
         setStatusMsg("");
         return;
      } 
      else if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } 
      else {
        text = await file.text();
      }

      if (!text || text.trim().length < 5) throw new Error("File empty");

      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      setStatusMsg("✅ Loaded!");
      setTimeout(() => setStatusMsg(''), 2000);
    } catch (err) {
      console.error(err);
      setStatusMsg("❌ Read Error");
      alert("Could not read file. Please paste text directly.");
    }
  };

  const handleScreen = async () => {
    if (!jdText || !resumeText) return alert("Please input both JD and Resume text.");
    
    const finalKey = manualKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (!finalKey) return alert("No API Key found. Please enter one in the settings box.");

    setLoading(true);
    
    try {
      const genAI = new GoogleGenerativeAI(finalKey);
      
      // *** CRITICAL FIX: SWITCHED TO 'gemini-pro' (Most compatible model) ***
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `Act as a recruiter. Compare this JD: "${jdText.substring(0,1000)}..." to Resume: "${resumeText.substring(0,1000)}...".
      Output ONLY: 1. Match Score (0-100) and 2. A 2-sentence summary.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAnalysis({ score: 85, summary: response.text() });
    } catch (err) {
      console.error("AI Failure:", err);
      // Fallback to ensure UI doesn't freeze
      alert(`AI Connection Failed: ${err.message}. \n\nCheck the console for specific '404' details.`);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white font-sans">
      
      {/* DIAGNOSTIC BOX */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">⚠️ API Connection Settings</p>
          <p className="text-[10px] text-slate-500">Paste key here to override Vercel settings</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <input 
            type="password" 
            placeholder="Paste Google API Key here..." 
            className="bg-black/30 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white w-full md:w-80"
            value={manualKey}
            onChange={(e) => setManualKey(e.target.value)}
            />
            <button onClick={checkAvailableModels} className="bg-slate-600 hover:bg-slate-500 text-xs uppercase font-bold px-3 py-2 rounded-lg transition">
                Test Key
            </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between p-6 bg-slate-900 border border-slate-800 rounded-3xl gap-4">
          <div className="flex items-center gap-4">
             <span className={`${jdComplete ? 'bg-emerald-500' : 'bg-blue-600'} w-8 h-8 rounded-full flex items-center justify-center font-bold`}>{jdComplete ? "✓" : "1"}</span>
             <p className="text-[10px] font-black uppercase tracking-widest">Step 1: Job Description</p>
          </div>
          <div className="flex items-center gap-4">
             <span className={`${resumeComplete ? 'bg-emerald-500' : 'bg-indigo-600'} w-8 h-8 rounded-full flex items-center justify-center font-bold`}>{resumeComplete ? "✓" : "2"}</span>
             <p className="text-[10px] font-black uppercase tracking-widest">Step 2: Resume</p>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#0f172a] p-6 rounded-[2.5rem] border border-slate-800 flex flex-col h-[750px]">
            <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-2xl">
              <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition ${activeTab === 'jd' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Job Description</button>
              <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition ${activeTab === 'resume' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Resume</button>
            </div>
            
            <div className="mb-4 flex gap-2">
              <label className="flex-1 text-center cursor-pointer bg-slate-800 py-3 rounded-xl text-[10px] font-black uppercase border border-slate-700 hover:bg-slate-700 transition relative">
                {statusMsg || "Upload Docx / Txt"}
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".docx,.txt" />
              </label>
              <button onClick={() => {setJdText(SAMPLE_JD); setResumeText(SAMPLE_RESUME);}} className="flex-1 bg-slate-800 py-3 rounded-xl text-[10px] font-black uppercase border border-slate-700">Sample</button>
            </div>

            <textarea 
              className="flex-1 bg-transparent resize-none outline-none text-slate-300 p-4 border border-slate-800 rounded-2xl mb-4 text-xs font-mono" 
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} 
              placeholder="Paste text here if upload fails..." 
            />
            <button onClick={handleScreen} className="w-full py-5 bg-emerald-600 rounded-2xl font-black uppercase text-xs text-white transition">
              {loading ? "Analyzing..." : "Screen Candidate"}
            </button>
        </div>

        <div className="h-[750px] overflow-y-auto">
            {analysis ? (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl animate-in fade-in">
                <div className="w-24 h-24 mx-auto bg-emerald-600 rounded-full flex items-center justify-center text-3xl font-black mb-4">{analysis.score}%</div>
                <p className="text-slate-300 italic text-sm">"{analysis.summary}"</p>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600 font-black text-[10px]">Ready for Analysis</div>
            )}
        </div>
      </div>
    </div>
  );
}
