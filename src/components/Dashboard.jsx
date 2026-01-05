import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react";

// --- CONFIGURATION ---
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

// --- BRAND KIT COLORS ---
const COLORS = {
  primary: '#2B81B9',    // Blue - JD & Primary Action
  secondary: '#52438E',  // Purple - Resume & Secondary Action
  accent: '#8C50A1',     // Magenta - Market Intel
  light: '#b2acce',      // Soft Lavender - Highlights
  glow: '#00c9ff'        // Neon Blue - Glowing Effects
};

// --- FULL SAMPLE DATA ---
const SAMPLE_JD = `JOB TITLE: Senior FinTech Architect...`; 
const SAMPLE_RESUME = `ALEXANDER MERCER...`;

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
      } catch (err) { console.error(err); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLoadSamples = () => {
    setJdText("JOB TITLE: Senior FinTech Architect\n..."); 
    setResumeText("ALEXANDER MERCER\n...");
    setActiveTab('jd'); 
  };

  const handleScreen = () => {
    if (!isSignedIn) {
      if (guestCount >= 3) { setShowSignUpGate(true); return; }
      const newCount = guestCount + 1;
      setGuestCount(newCount);
      localStorage.setItem('guest_screens', newCount.toString());
    } else if (!isPro) {
        setShowSignUpGate(true);
        return;
    }
    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        score: 94,
        summary: "Candidate is a premier match...",
        strengths: ["Strong technical alignment", "Scale experience"],
        gaps: ["Needs security probe"],
        questions: ["Explain your architecture..."],
        marketIntel: { salary: "$210k - $245k Base" },
        email: "Hi Alexander..."
      });
      setLoading(false);
    }, 1500);
  };

  const isJd = activeTab === 'jd';
  const jdComplete = jdText.length > 50; 
  const resumeComplete = resumeText.length > 50;
  const dynamicStripeLink = isSignedIn && user ? `${STRIPE_PAYMENT_LINK}?client_reference_id=${user.id}` : STRIPE_PAYMENT_LINK;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 relative font-sans text-slate-200">
      
      {/* GUEST / PRO BANNERS */}
      {!isSignedIn ? (
        <div style={{ borderColor: COLORS.primary }} className="bg-slate-900/50 border p-4 rounded-2xl flex justify-between items-center">
          <p className="text-sm">Guest Mode: <span className="font-bold">{3 - guestCount} screens left</span></p>
          <button onClick={() => setShowSignUpGate(true)} style={{ color: COLORS.glow }} className="text-xs font-black uppercase">Sign Up</button>
        </div>
      ) : isPro ? (
        <div style={{ borderColor: COLORS.glow }} className="bg-slate-900/50 border p-4 rounded-2xl flex justify-between items-center">
          <p className="text-sm font-bold" style={{ color: COLORS.glow }}>ELITE PLAN ACTIVE</p>
        </div>
      ) : null}

      {/* 1-2-3 GUIDE */}
      <div className="flex flex-col md:flex-row justify-between p-6 bg-slate-900/50 border border-slate-800 rounded-3xl gap-4">
         <div className="flex items-center gap-4">
            <span style={{ backgroundColor: jdComplete ? '#10b981' : COLORS.primary }} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white">
              {jdComplete ? "✓" : "1"}
            </span>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 1: Job Description</p>
         </div>
         <div className="flex items-center gap-4">
            <span style={{ backgroundColor: resumeComplete ? '#10b981' : COLORS.secondary }} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white">
              {resumeComplete ? "✓" : "2"}
            </span>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 2: Resume</p>
         </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <div className="bg-[#0f172a] p-6 rounded-[2.5rem] border border-slate-800 flex flex-col h-[700px] shadow-2xl relative">
           <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-2xl">
             <button onClick={() => setActiveTab('jd')} 
               style={{ backgroundColor: isJd ? COLORS.primary : 'transparent' }}
               className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${isJd ? 'text-white' : 'text-slate-500'}`}>JD</button>
             <button onClick={() => setActiveTab('resume')} 
               style={{ backgroundColor: !isJd ? COLORS.secondary : 'transparent' }}
               className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${!isJd ? 'text-white' : 'text-slate-500'}`}>Resume</button>
           </div>
           
           <textarea 
             className="flex-1 bg-transparent resize-none outline-none text-slate-300 p-4 border border-slate-800 rounded-2xl mb-4 text-xs"
             value={activeTab === 'jd' ? jdText : resumeText}
             onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
           />
           
           <button onClick={handleScreen} disabled={loading} 
             style={{ backgroundColor: COLORS.primary }}
             className="w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-xl">
             {loading ? "Analyzing..." : "Run Analysis"}
           </button>
        </div>
        
        {/* OUTPUT PANEL */}
        <div className="h-[700px] overflow-y-auto pr-2">
           {!analysis ? (
             <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600 uppercase font-black text-[10px]">Analysis Result</div>
           ) : (
             <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                   <div style={{ backgroundColor: COLORS.primary }} className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-black mb-4 text-white">{analysis.score}</div>
                   <p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.summary}"</p>
                </div>
                <div style={{ borderColor: COLORS.accent }} className="bg-slate-900 border-l-4 p-6 rounded-[2rem]">
                   <h4 style={{ color: COLORS.accent }} className="text-[10px] font-black uppercase mb-4 tracking-widest">Market Intelligence</h4>
                   <p className="text-lg font-bold text-white">{analysis.marketIntel.salary}</p>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* BRANDED POP-UP */}
      {showSignUpGate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"></div>
           <div style={{ borderColor: COLORS.primary, boxShadow: `0 0 50px -10px ${COLORS.primary}` }} 
                className="bg-[#0f172a] border-2 p-8 rounded-[3rem] max-w-lg w-full text-center relative z-10 max-h-[90vh] overflow-y-auto">
              
              <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Recruit-IQ Elite</h2>
              
              <div style={{ background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})` }} 
                   className="w-full py-4 mb-6 rounded-2xl shadow-lg flex items-center justify-center">
                <span className="text-2xl font-black text-white uppercase tracking-wider">3-DAY FREE TRIAL</span>
              </div>

              <div className="bg-blue-950/20 rounded-2xl p-6 mb-6 border border-slate-800 text-left">
                <ul className="space-y-3">
                  {["Unlimited AI Screens", "Market Salary Data", "Interview Guides", "One-Click Outreach"].map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-200 items-center">
                      <span style={{ color: COLORS.glow }} className="font-black text-lg">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                  <div className="text-center">
                     <span className="text-5xl font-black text-white">$29.99</span><span className="text-slate-400 text-lg">/mo</span>
                     <p className="text-sm text-white font-bold mt-2">First 3 days are 100% free.</p>
                  </div>

                  {!isSignedIn ? (
                    <SignUpButton mode="modal">
                        <button style={{ backgroundColor: COLORS.primary }} className="w-full py-5 rounded-2xl font-black uppercase text-sm text-white shadow-xl hover:scale-[1.02] transition-transform">
                          Start My Free 3-Day Trial
                        </button>
                    </SignUpButton>
                  ) : (
                    <a href={dynamicStripeLink} target="_blank" rel="noopener noreferrer"
                        style={{ backgroundColor: COLORS.primary }}
                        className="block w-full py-5 rounded-2xl font-black uppercase text-sm text-white shadow-xl hover:scale-[1.02] transition-transform">
                        Start My Free 3-Day Trial
                    </a>
                  )}
              </div>
              
              <button onClick={() => setShowSignUpGate(false)} className="mt-6 text-xs font-bold uppercase text-slate-600 hover:text-white transition-colors">Close</button>
           </div>
        </div>
      )}
    </div>
  );
}
