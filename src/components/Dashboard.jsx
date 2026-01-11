import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react";
// Logo path fixed to match your 'src/logo.png' structure
import logo from '../logo.png';

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [guestUsage, setGuestUsage] = useState(0);
  const GUEST_LIMIT = 3;

  const isPro = user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;

  // --- UPDATED REDIRECT LOGIC (BREAKS THE LOOP) ---
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const justPaid = query.get('success');

    // Resetting local usage if returning from Stripe
    if (justPaid) {
      localStorage.setItem('riq_guest_usage', '0');
      setGuestUsage(0);
    }

    // Force a reload of user metadata if returning from Stripe to catch the Zapier update
    if (justPaid && isLoaded && isSignedIn) {
      user.reload().then(() => { 
        window.history.replaceState({}, document.title, "/"); 
      });
    }

    // THE SAFETY HATCH: Only redirect if NOT Pro AND NOT returning with success flag
    if (isLoaded && isSignedIn && !isPro && !justPaid) {
       window.location.href = STRIPE_URL;
    }
  }, [isLoaded, isSignedIn, isPro]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
    } catch (err) { alert("Error reading file."); }
  };

  const handleScreen = async () => {
    if (!isSignedIn && guestUsage >= GUEST_LIMIT) return setShowUpgrade(true);
    if (isSignedIn && !isPro) return setShowUpgrade(true);
    if (!jdReady || !resumeReady) return alert("Please complete Step 1 and Step 2.");
    
    setLoading(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Analyze JD: ${jdText} and Resume: ${resumeText}. Return JSON with score (0-100) and summary.` }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      setAnalysis(JSON.parse(data.candidates[0].content.parts[0].text));
    } catch (err) { alert("Analysis failed."); } finally { setLoading(false); }
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;
  
  // Display a syncing message if they just paid but metadata hasn't updated yet
  if (isSignedIn && !isPro) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center text-white">
         <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
         <h2 className="text-xl font-bold uppercase tracking-widest italic text-indigo-400">Syncing Pro Access...</h2>
         <p className="text-slate-400 mt-2">Checking your subscription status...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white bg-[#0B1120] min-h-screen relative font-sans">
      <div className="flex justify-between items-center mb-8">
        <img src={logo} alt="Recruit-IQ" className="h-12 w-auto" />
        <div className="bg-indigo-500/10 border border-indigo-500/50 px-4 py-2 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest">
          {isPro ? "Pro Plan Active" : `Guest Usage: ${guestUsage}/${GUEST_LIMIT}`}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 flex flex-col h-[700px]">
            <div className="flex gap-3 mb-6">
               <button onClick={() => setActiveTab('jd')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider ${activeTab === 'jd' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Job Description</button>
               <button onClick={() => setActiveTab('resume')} className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider ${activeTab === 'resume' ? 'bg-indigo-600' : 'bg-slate-800'}`}>Resume</button>
            </div>
            <textarea 
              className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono mb-6"
              value={activeTab === 'jd' ? jdText : resumeText} 
              onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
              placeholder="Paste content here..."
            />
            <button onClick={handleScreen} disabled={loading} className="py-5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl font-black uppercase text-xs">
              {loading ? "Analyzing..." : "Screen Candidate"}
            </button>
        </div>

        <div className="h-[700px] bg-[#111827] border border-slate-800 p-8 rounded-[2.5rem]">
            {analysis ? (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-5xl font-black mb-6">{analysis.score}%</div>
                <p className="text-slate-200 text-sm italic">"{analysis.summary}"</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 uppercase tracking-widest text-[10px]">
                 Waiting for data...
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
