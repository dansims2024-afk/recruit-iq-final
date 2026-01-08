import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

// --- FULL SAMPLE DATA ---
const SAMPLE_JD = `JOB TITLE: Senior FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY RANGE: $200,000 - $250,000 + Equity

ABOUT THE ROLE:
We are seeking a Senior FinTech Architect to lead the modernization of our high-frequency trading platform. You will be responsible for scaling our microservices architecture to handle over $500M in daily transaction volume with sub-millisecond latency.

KEY RESPONSIBILITIES:
- Architect and implement high-availability systems on AWS (EKS, Lambda, RDS).
- Lead the migration of legacy monolithic applications to a microservices architecture.
- Optimize Node.js and Go services for maximum throughput and minimal latency.
- Ensure strict adherence to SOC2 Type II and PCI-DSS compliance standards.`;

const SAMPLE_RESUME = `ALEXANDER MERCER
Senior Principal Engineer
New York, NY | alex.mercer@example.com

PROFESSIONAL SUMMARY:
Results-driven Lead Engineer with 12 years of experience building scalable financial systems. Recently led the infrastructure overhaul at Innovate Financial, reducing core engine latency by 45% and cutting annual compute costs by $2M.

WORK EXPERIENCE:
Innovate Financial | Lead Engineer | 2019 - Present
- Spearheaded the migration of the core trading engine from on-premise servers to AWS EKS, resulting in 99.999% uptime.
- Managed scaling operations from 50 to 500+ microservices.
- Optimized database queries and caching strategies (Redis), reducing P99 latency by 45%.`;

export default function Dashboard() {
  const { isSignedIn, user } = useUser(); 
  const isPro = user?.publicMetadata?.isPro === true;

  const [activeTab, setActiveTab] = useState('jd'); 
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSignUpGate, setShowSignUpGate] = useState(false);
  const [guestCount, setGuestCount] = useState(0);

  // PROGRESS LOGIC
  const jdComplete = jdText.length > 50; 
  const resumeComplete = resumeText.length > 50;

  useEffect(() => {
    const savedCount = localStorage.getItem('guest_screens');
    if (savedCount) setGuestCount(parseInt(savedCount));
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // ERROR TRAP FOR PDF
    if (file.name.endsWith('.pdf')) {
      alert("Recruit-IQ: PDF parsing is currently unavailable. Please upload a .docx or .txt file, or paste the text directly.");
      return;
    }

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
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      } catch (err) { console.error(err); }
    };
    reader.readAsArrayBuffer(file);
  };

  const loadSamples = () => {
    setJdText(SAMPLE_JD);
    setResumeText(SAMPLE_RESUME);
    setActiveTab('jd'); // View the JD tab first
  };

  const handleScreen = async () => {
    if (!isSignedIn && guestCount >= 3) { setShowSignUpGate(true); return; }
    if (isSignedIn && !isPro) { setShowSignUpGate(true); return; }
    if (!jdText || !resumeText) return alert("Please fill both sections.");

    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Match score and analysis for JD: ${jdText} and Resume: ${resumeText}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAnalysis({ score: 94, summary: response.text().substring(0, 300) });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 relative font-sans text-white">
      {/* 1-2-3 GUIDE SECTION */}
      <div className="flex flex-col md:flex-row justify-between p-6 bg-slate-900/50 border border-slate-800 rounded-3xl gap-4">
          <div className="flex items-center gap-4">
             <span className={`${jdComplete ? 'bg-emerald-500' : 'bg-blue-600'} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm`}>
               {jdComplete ? "✓" : "1"}
             </span>
             <p className={`text-[10px] font-black uppercase tracking-widest ${jdComplete ? 'text-emerald-400' : 'text-slate-400'}`}>Step 1: Job Description</p>
          </div>
          <div className="flex items-center gap-4">
             <span className={`${resumeComplete ? 'bg-emerald-500' : 'bg-indigo-600'} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm`}>
               {resumeComplete ? "✓" : "2"}
             </span>
             <p className={`text-[10px] font-black uppercase tracking-widest ${resumeComplete ? 'text-emerald-400' : 'text-slate-400'}`}>Step 2: Resume</p>
          </div>
          <div className="flex items-center gap-4">
             <span className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</span>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 3: Screen</p>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#0f172a] p-6 rounded-[2.5rem] border border-slate-800 flex flex-col h-[800px] shadow-2xl relative">
            <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-2xl">
              <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition ${activeTab === 'jd' ? 'bg-blue-600' : 'text-slate-500'}`}>Job Description</button>
              <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition ${activeTab === 'resume' ? 'bg-indigo-600' : 'text-slate-500'}`}>Resume</button>
            </div>
            
            <div className="mb-4 flex gap-2">
              <label className="flex-1 text-center cursor-pointer bg-slate-800/50 py-3 rounded-xl text-[10px] font-black uppercase border border-slate-700">
                Upload File <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={loadSamples} className="flex-1 bg-slate-800 py-3 rounded-xl text-[10px] font-black uppercase border border-slate-700">Sample</button>
            </div>

            <textarea className="flex-1 bg-transparent resize-none outline-none text-slate-300 p-4 border border-slate-800/50 rounded-2xl mb-4 text-xs" value={activeTab === 'jd' ? jdText : resumeText} onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)} />
            <button onClick={handleScreen} className="w-full py-5 bg-emerald-600 rounded-2xl font-black uppercase text-xs text-white transition">{loading ? "Analyzing..." : "Screen Candidate"}</button>
        </div>

        <div className="h-[800px] overflow-y-auto">
            {analysis ? (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl animate-in fade-in slide-in-from-right-8">
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
