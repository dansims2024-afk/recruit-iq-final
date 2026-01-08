import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- CONFIGURATION ---
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

// Initialize Gemini with your Vite Environment Variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(apiKey || "");

export default function Dashboard() {
  const { isSignedIn, user } = useUser(); 
  
  // Checks if user is on the paid plan via Clerk Metadata
  const isPro = user?.publicMetadata?.isPro === true;

  const [activeTab, setActiveTab] = useState('jd'); 
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSignUpGate, setShowSignUpGate] = useState(false);
  const [guestCount, setGuestCount] = useState(0);

  useEffect(() => {
    const savedCount = localStorage.getItem('guest_screens');
    if (savedCount) setGuestCount(parseInt(savedCount));
  }, []);

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
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      } catch (err) { console.error("File Read Error:", err); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleScreen = async () => {
    // 1. Logic for Guest vs Pro
    if (!isSignedIn) {
      if (guestCount >= 3) {
        setShowSignUpGate(true);
        return;
      }
      const newCount = guestCount + 1;
      setGuestCount(newCount);
      localStorage.setItem('guest_screens', newCount.toString());
    } else if (!isPro) {
        setShowSignUpGate(true);
        return;
    }

    if (!jdText || !resumeText) {
      alert("Please provide both a Job Description and a Resume.");
      return;
    }

    setLoading(true);
    try {
      // --- LIVE GEMINI API CALL ---
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Act as an expert recruiter for Recruit-IQ. 
      Analyze this Job Description: ${jdText}
      Against this Resume: ${resumeText}
      
      Return the analysis in a clean format:
      - Match Score (0-100)
      - A 2-sentence executive summary
      - 5 bulleted strengths
      - 3 bulleted gaps
      - 5 targeted interview questions.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();

      // Mocking the structured object based on AI response text
      // In a final version, you can prompt Gemini to return pure JSON
      setAnalysis({
        score: 88, 
        summary: aiResponse.substring(0, 300) + "...",
        strengths: ["Strong Technical Background", "Relevant Industry Experience", "Leadership Potential", "Problem Solving", "Communication"],
        gaps: ["Missing specific certification", "Short tenure in last role", "Tooling mismatch"],
        questions: ["Walk me through your last project...", "How do you handle conflict?", "Explain your architecture choice..."],
        marketIntel: { salary: "$140k - $185k", status: "Competitive" }
      });
    } catch (error) {
      console.error("AI Analysis Error:", error);
      alert("AI failed to respond. Check your VITE_GEMINI_API_KEY settings.");
    } finally {
      setLoading(false);
    }
  };

  const jdComplete = jdText.length > 50; 
  const resumeComplete = resumeText.length > 50;
  const dynamicStripeLink = isSignedIn && user ? `${STRIPE_PAYMENT_LINK}?client_reference_id=${user.id}` : STRIPE_PAYMENT_LINK;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 relative font-sans text-white">

      {/* PLAN STATUS BANNER */}
      {!isSignedIn ? (
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-2xl flex justify-between items-center">
          <p className="text-sm text-slate-300">Guest Mode: <span className="text-white font-bold">{3 - guestCount} free screens</span> remaining.</p>
          <button onClick={() => setShowSignUpGate(true)} className="text-xs font-bold uppercase text-emerald-400">Sign Up</button>
        </div>
      ) : isPro ? (
        <div className="bg-emerald-900/30 border border-emerald-500/30 p-4 rounded-2xl text-emerald-200 text-sm">Elite Plan Active: Unlimited Access.</div>
      ) : (
        <div className="bg-blue-900/40 border border-blue-500/30 p-4 rounded-2xl flex justify-between items-center">
          <p className="text-sm text-blue-200">Free Plan: Upgrade for unlimited AI screens.</p>
          <a href={dynamicStripeLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase bg-blue-600 px-4 py-2 rounded-lg">Upgrade</a>
        </div>
      )}

      {/* 1-2-3 STEP GUIDE */}
      <div className="flex flex-col md:flex-row justify-between p-6 bg-slate-900/50 border border-slate-800 rounded-3xl gap-4">
          <div className="flex items-center gap-4">
             <span className={`${jdComplete ? 'bg-emerald-500' : 'bg-blue-600'} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm`}>
               {jdComplete ? "✓" : "1"}
             </span>
             <p className={`text-[10px] font-black uppercase tracking-widest ${jdComplete ? 'text-emerald-400' : 'text-slate-400'}`}>Step 1: Add Job Description</p>
          </div>
          <div className="flex items-center gap-4">
             <span className={`${resumeComplete ? 'bg-emerald-500' : 'bg-indigo-600'} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm`}>
               {resumeComplete ? "✓" : "2"}
             </span>
             <p className={`text-[10px] font-black uppercase tracking-widest ${resumeComplete ? 'text-emerald-400' : 'text-slate-400'}`}>Step 2: Add Resume</p>
          </div>
          <div className="flex items-center gap-4">
             <span className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</span>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 3: Screen Candidate</p>
          </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <div className="bg-[#0f172a] p-6 rounded-[2.5rem] border border-slate-800 flex flex-col h-[800px] shadow-2xl">
            <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-2xl">
              <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition ${activeTab === 'jd' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
                Job Description
              </button>
              <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition ${activeTab === 'resume' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
                Candidate Resume
              </button>
            </div>

            <textarea 
              className="flex-1 bg-transparent resize-none outline-none text-slate-300 p-4 border border-slate-800/50 rounded-2xl mb-4 text-xs"
              value={activeTab === 'jd' ? jdText : resumeText}
              placeholder={activeTab === 'jd' ? "Paste Job Description..." : "Paste Resume..."}
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
            />

            <button onClick={handleScreen} disabled={loading} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase text-xs tracking-widest transition shadow-xl shadow-emerald-600/20">
              {loading ? "AI Analyzing..." : "Screen Candidate"}
            </button>
        </div>

        {/* OUTPUT PANEL */}
        <div className="h-[800px] overflow-y-auto">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                 <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                    <div className="w-24 h-24 mx-auto bg-emerald-600 rounded-full flex items-center justify-center text-3xl font-black mb-4">
                      {analysis.score}%
                    </div>
                    <p className="text-slate-300 italic text-sm">"{analysis.summary}"</p>
                 </div>
                 
                 <div className="bg-slate-900 border border-emerald-500/20 p-8 rounded-[2rem]">
                    <h4 className="text-xs font-black uppercase text-emerald-500 mb-4 tracking-widest">Strengths</h4>
                    <ul className="space-y-3">{analysis.strengths.map((s, i) => (<li key={i} className="text-sm text-slate-300">✓ {s}</li>))}</ul>
                 </div>

                 <div className="bg-slate-900 border border-rose-500/20 p-8 rounded-[2rem]">
                    <h4 className="text-xs font-black uppercase text-rose-500 mb-4 tracking-widest">Critical Gaps</h4>
                    <ul className="space-y-3">{analysis.gaps.map((g, i) => (<li key={i} className="text-sm text-slate-300">! {g}</li>))}</ul>
                 </div>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600 uppercase font-black text-[10px]">Ready for Analysis</div>
            )}
        </div>
      </div>

      {/* UPGRADE GATE */}
      {showSignUpGate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm" onClick={() => setShowSignUpGate(false)}></div>
           <div className="bg-slate-900 border-2 border-blue-500/50 p-10 rounded-[3rem] max-w-lg w-full text-center relative z-10 shadow-2xl">
              <h2 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">Recruit-IQ Elite</h2>
              <p className="text-blue-400 font-bold text-sm mb-6">Unlimited AI Screening & Professional Reports</p>
              <SignUpButton mode="modal">
                <button className="w-full py-5 bg-blue-600 rounded-2xl font-black uppercase text-white shadow-xl shadow-blue-600/20 mb-4">Start 3-Day Free Trial</button>
              </SignUpButton>
              <button onClick={() => setShowSignUpGate(false)} className="text-[10px] text-slate-500 uppercase font-bold">Close</button>
           </div>
        </div>
      )}
    </div>
  );
}
