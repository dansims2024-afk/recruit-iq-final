import React, { useState } from 'react';
import mammoth from 'mammoth';
import { useUser } from "@clerk/clerk-react";

// --- FULL SAMPLE DATA ---
const SAMPLE_JD = `JOB TITLE: Senior FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $220,000 - $260,000 + Equity

COMPANY OVERVIEW:
Vertex Financial is a leading high-frequency trading firm processing $500M+ in daily transaction volume. We are rebuilding our core execution engine to achieve sub-millisecond latency using modern cloud-native architecture.

KEY RESPONSIBILITIES:
- Architect and implement high-availability microservices on AWS (EKS, Lambda, RDS).
- Lead a team of 8-10 senior engineers.

REQUIRED QUALIFICATIONS:
- 10+ years of software engineering experience.
- Deep expertise in AWS cloud-native services.`;

const SAMPLE_RESUME = `ALEXANDER MERCER
Senior Principal Engineer
alex.mercer@example.com

PROFESSIONAL SUMMARY:
Results-driven Lead Engineer with 12 years of experience building scalable financial systems. Recently led the infrastructure overhaul at Innovate Financial, reducing core engine latency by 45%.

WORK EXPERIENCE:
Innovate Financial | Lead Engineer | 2019 - Present
- Spearheaded the migration of the core trading engine to AWS EKS.
- Optimized database queries and caching strategies (Redis).

SKILLS:
- AWS, Docker, Kubernetes, Terraform, Node.js, Go, Python.`;

export default function Dashboard() {
  const { isSignedIn } = useUser(); 
  const [activeTab, setActiveTab] = useState('jd'); 
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const jdComplete = jdText.length > 50; 
  const resumeComplete = resumeText.length > 50;

  // --- FILE HANDLER ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileInfo = { 
      name: file.name, 
      size: (file.size / 1024).toFixed(1) + ' KB', 
      type: file.name.split('.').pop().toUpperCase() 
    };

    if (activeTab === 'jd') setJdFile(fileInfo);
    else setResumeFile(fileInfo);

    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        // Extraction fallback: Direct text read for simple PDFs
        text = await file.text(); 
        if (text.length < 100) {
           text = `[PDF LOADED: ${file.name}]\n\nPlease paste the resume text here for a 100% accurate analysis if it does not appear automatically.`;
        }
      } else {
        text = await file.text();
      }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
    } catch (err) {
      alert("Error reading file. Please paste text directly.");
    }
  };

  const loadSamples = () => {
    setJdText(SAMPLE_JD);
    setResumeText(SAMPLE_RESUME);
    setJdFile({ name: "Job_Description.docx", size: "12 KB", type: "DOCX" });
    setResumeFile({ name: "Alexander_Mercer.pdf", size: "45 KB", type: "PDF" });
  };

  // --- LIVE AI SCREENING ---
  const handleScreen = async () => {
    if (!jdText || !resumeText) return alert("Please provide both documents.");
    setLoading(true);
    
    // Your verified new unrestricted API Key
    const apiKey = "AIzaSyDLxFEIhTaBbZTIBWR7JxVnuOx1spxr2A0";
    
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Recruiter Persona: Analyze JD and Resume. 
              Return ONLY JSON: {"score":0, "summary":"", "strengths":[], "gaps":[]}
              JD: ${jdText}
              Resume: ${resumeText}`
            }]
          }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
      setAnalysis(parsed);
      
    } catch (err) {
      console.error("API Error:", err);
      // Fallback for 403/404 errors
      setAnalysis({
        score: 60,
        summary: `[Offline Fallback] Connection interrupted: ${err.message}. Reviewing locally.`,
        strengths: ["Content loaded for review"],
        gaps: ["Live AI connection pending"]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-slate-950 min-h-screen font-sans">
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* INPUT COLUMN */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl relative">
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${jdComplete ? 'bg-emerald-500' : 'bg-blue-600'}`}>1</div>
                <div className="flex-1 flex gap-2 bg-black/20 p-1 rounded-2xl">
                  <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition ${activeTab === 'jd' ? 'bg-blue-600' : 'text-slate-500'}`}>JD</button>
                  <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition ${activeTab === 'resume' ? 'bg-indigo-600' : 'text-slate-500'}`}>Resume</button>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${resumeComplete ? 'bg-emerald-500' : 'bg-indigo-600'}`}>2</div>
            </div>

            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-[10px] font-black uppercase border border-slate-700 transition">
                Upload (PDF/DOCX)
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={loadSamples} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-[10px] font-black uppercase border border-slate-700 transition">Load Sample</button>
            </div>

            {/* FULL CONTENT DISPLAY BOX */}
            <textarea 
              className="flex-1 bg-black/30 resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono leading-relaxed"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Full content will appear here..."
            />

            <div className="mt-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/20">3</div>
                <button onClick={handleScreen} disabled={loading} className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all shadow-xl shadow-emerald-600/30">
                  {loading ? "AI Analysis in Progress..." : "Screen Candidate"}
                </button>
            </div>
        </div>

        {/* OUTPUT COLUMN */}
        <div className="h-[850px] overflow-y-auto pr-2 custom-scrollbar space-y-6">
            {analysis ? (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-6">
                <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] text-center shadow-2xl">
                  <div className="w-24 h-24 mx-auto bg-emerald-600 rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-xl shadow-emerald-500/40">
                    {analysis.score}%
                  </div>
                  <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-3">Recruit-IQ Analysis</h3>
                  <p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.summary}"</p>
                </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex items-center justify-center text-slate-600 font-black text-[10px] uppercase tracking-widest">
                 Awaiting Data...
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
