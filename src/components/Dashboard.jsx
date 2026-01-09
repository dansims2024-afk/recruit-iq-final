import React, { useState } from 'react';
import mammoth from 'mammoth';
import { useUser } from "@clerk/clerk-react";

// --- CONFIGURATION ---
// We use Mistral-7B because it's fast, free, and great at professional writing
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"; 

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
  
  // Stores the HuggingFace Token
  const [manualKey, setManualKey] = useState('');

  const jdComplete = jdText.length > 50; 
  const resumeComplete = resumeText.length > 50;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatusMsg("Reading...");
    try {
      let text = "";
      if (file.name.endsWith('.pdf')) {
         alert("PDF parsing unavailable. Please copy/paste text.");
         return;
      } else if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else {
        text = await file.text();
      }

      if (!text || text.trim().length < 5) throw new Error("File empty");
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      setStatusMsg("✅ Loaded!");
      setTimeout(() => setStatusMsg(''), 2000);
    } catch (err) {
      console.error(err);
      alert("Read Error: Please paste text directly.");
    }
  };

  const handleScreen = async () => {
    if (!jdText || !resumeText) return alert("Please input both JD and Resume text.");
    if (!manualKey) return alert("Please enter a HuggingFace Token in the API Settings box.");

    setLoading(true);
    
    try {
      // 1. CONSTRUCT THE PROMPT (Mistral Format)
      const prompt = `[INST] You are an expert technical recruiter. 
      Analyze this Resume against this Job Description.
      
      Job Description:
      ${jdText.substring(0, 800)}

      Resume:
      ${resumeText.substring(0, 800)}

      Return a JSON response with:
      1. "score": A match score between 0-100.
      2. "summary": A 2-sentence professional summary of the candidate's fit.
      [/INST]`;

      // 2. CALL HUGGINGFACE API
      const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
        headers: {
          Authorization: `Bearer ${manualKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: prompt,
          parameters: { 
            max_new_tokens: 500,
            return_full_text: false,
            temperature: 0.1
          } 
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "HuggingFace API Error");
      }

      const result = await response.json();
      // Parse the text result
      const aiText = result[0].generated_text;

      setAnalysis({
        // Extract a number if possible, or default to 85 for display
        score: aiText.match(/\d{2,3}/) ? aiText.match(/\d{2,3}/)[0] : 85,
        summary: aiText.replace(/"/g, '').trim(),
        mode: "Live AI (HuggingFace)"
      });

    } catch (err) {
      console.error("AI Failure:", err);
      
      // FALLBACK TO DEMO MODE IF API FAILS (e.g. Model Loading)
      if (err.message.includes("loading")) {
        alert("The AI model is waking up (503 Error). Please click 'Screen' again in 30 seconds.");
      } else {
        alert(`Connection Error: ${err.message}. Switching to Demo Mode.`);
        setAnalysis({
            score: 72,
            summary: "Demo Result: The candidate has strong keyword alignment with the job description, particularly in core technical skills. However, specific leadership experience mentioned in the JD requires further verification during the interview.",
            mode: "Demo Mode"
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white font-sans">
      
      {/* MANUAL KEY BOX */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">⚠️ API Settings (HuggingFace)</p>
          <p className="text-[10px] text-slate-500">Paste your free HF Token here.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <input 
            type="password" 
            placeholder="Paste HuggingFace Token (hf_...)" 
            className="bg-black/30 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white w-full md:w-80"
            value={manualKey}
            onChange={(e) => setManualKey(e.target.value)}
            />
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
              placeholder="Paste text here..." 
            />
            <button onClick={handleScreen} className="w-full py-5 bg-emerald-600 rounded-2xl font-black uppercase text-xs text-white transition">
              {loading ? "AI Analyzing..." : "Screen Candidate"}
            </button>
        </div>

        <div className="h-[750px] overflow-y-auto">
            {analysis ? (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl animate-in fade-in">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-black mb-4 ${analysis.mode === 'Demo Mode' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                  {analysis.score}%
                </div>
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-4">{analysis.mode}</p>
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
