import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk } from "@clerk/clerk-react";
import logo from '../logo.png'; 

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

// --- SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect...`;
const SAMPLE_RESUME = `MARCUS VANDELAY...`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();
  
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const finalStripeUrl = userEmail 
    ? `${STRIPE_URL}?prefilled_email=${encodeURIComponent(userEmail)}` 
    : STRIPE_URL;

  // --- REQUISITE DATA LOAD ---
  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleClear = () => {
    setJdText(''); setResumeText(''); setAnalysis(null); setActiveTab('jd');
    showToast("Dashboard cleared", "info");
  };

  // --- CLIPBOARD LOGIC ---
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Email copied to clipboard!", "success");
    });
  };

  // --- FILE UPLOAD LOGIC ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        const pdfjs = window.pdfjsLib;
        if (!pdfjs) { showToast("PDF Reader loading...", "error"); return; }
        const loadingTask = pdfjs.getDocument(URL.createObjectURL(file));
        const pdf = await loadingTask.promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => item.str).join(' ') + "\n";
        }
        text = fullText;
      } else { text = await file.text(); }
      
      if (activeTab === 'jd') setJdText(text); else setResumeText(text);
      showToast(`${file.name} uploaded!`, "success");
    } catch (err) { showToast("Upload failed. Try copy/paste.", "error"); }
  };

  const handleScreen = async () => {
    if (!isPro && scanCount >= 3) {
      setShowLimitModal(true);
      return;
    }
    // Analysis logic here...
    setLoading(true);
    setTimeout(() => { // Simulating AI
        setAnalysis({ candidate_name: "Marcus Vandelay", score: 85, summary: "Strong match...", strengths: ["AWS", "Kubernetes"], gaps: ["FinTech experience"], questions: ["Tell us about your low-latency design..."], outreach_email: "Hi Marcus, I saw your profile..." });
        if (!isPro) {
            const newCount = scanCount + 1;
            setScanCount(newCount);
            localStorage.setItem('recruit_iq_scans', newCount.toString());
        }
        setLoading(false);
    }, 2000);
  };

  if (!isLoaded) return <div className="min-h-screen bg-[#0B1120]" />;

  return (
    <div className="relative p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      
      {/* --- HEADER --- */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
            <img src={logo} alt="Recruit-IQ" className="h-12 w-auto" />
            <h1 className="text-2xl font-black">Recruit-IQ</h1>
        </div>
        <div className={`px-4 py-2 rounded-full text-[10px] font-bold border ${isPro ? 'border-emerald-500 text-emerald-400' : 'border-indigo-400 text-indigo-400'}`}>
            {isPro ? "ELITE ACTIVE" : `TRIAL: ${3 - scanCount} LEFT`}
        </div>
      </header>

      {/* --- ELITE MODAL --- */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className="bg-[#111827] border border-slate-700 p-8 rounded-[2rem] max-w-md w-full text-center shadow-2xl">
            <h2 className="text-2xl font-black mb-2">Upgrade to Elite</h2>
            <p className="text-slate-400 text-sm mb-6">Unlock unlimited scans and exclusive interview guides.</p>
            <a href={finalStripeUrl} className="block w-full py-4 bg-indigo-600 rounded-xl font-bold uppercase text-xs mb-3">Start 3-Day Free Trial</a>
            <button onClick={() => setShowLimitModal(false)} className="text-[10px] text-slate-500 uppercase font-bold underline">Maybe Later</button>
          </div>
        </div>
      )}

      {/* --- TOAST --- */}
      {toast.show && <div className="fixed top-24 right-5 z-[60] px-6 py-3 bg-indigo-600 rounded-lg shadow-xl text-xs font-bold animate-pulse">{toast.message}</div>}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Input */}
        <div className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 flex flex-col h-[700px]">
            <div className="flex gap-3 mb-4">
              <label className="flex-1 text-center cursor-pointer bg-slate-800 py-3 rounded-xl text-[10px] font-bold uppercase border border-slate-700 text-slate-400 hover:text-white transition-colors">
                Upload pdf or doc
                <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
              <button onClick={handleClear} className="bg-rose-500/10 border border-rose-500/50 py-3 px-4 rounded-xl text-[10px] font-bold uppercase text-rose-400">Clear</button>
            </div>
            <textarea 
                className="flex-1 bg-[#0B1120] resize-none outline-none text-slate-300 p-6 border border-slate-800 rounded-2xl text-xs font-mono"
                value={activeTab === 'jd' ? jdText : resumeText} 
                onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
                placeholder={activeTab === 'jd' ? "Paste JD..." : "Paste Resume..."}
            />
            <button onClick={handleScreen} disabled={loading} className="mt-6 py-5 rounded-2xl font-black uppercase text-xs bg-indigo-600">
                {loading ? "Analyzing..." : "Screen Candidate →"}
            </button>
        </div>

        {/* Right Column: Analysis */}
        <div className="h-[700px] overflow-y-auto space-y-6">
          {analysis ? (
            <div className="animate-in fade-in space-y-4">
                <div className="bg-indigo-600/10 border border-indigo-600 p-8 rounded-[2rem] text-center">
                    <div className="text-4xl font-black">{analysis.score}% Match</div>
                    <div className="text-lg font-bold mt-2">{analysis.candidate_name}</div>
                </div>
                {analysis.outreach_email && (
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase">AI Outreach Email</span>
                        <button onClick={() => copyToClipboard(analysis.outreach_email)} className="text-[10px] underline">Copy Email</button>
                    </div>
                    <p className="text-[11px] text-slate-300 whitespace-pre-wrap">{analysis.outreach_email}</p>
                  </div>
                )}
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-[2rem] flex items-center justify-center text-slate-600 uppercase text-[10px] font-bold tracking-widest">Waiting for data...</div>
          )}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-20 border-t border-slate-800 pt-8 pb-12 text-center">
        <p className="text-slate-600 text-xs mb-4">&copy; {new Date().getFullYear()} Recruit-IQ. Powered by Core Creativity AI.</p>
        <div className="flex justify-center gap-6 text-[10px] font-bold tracking-widest uppercase text-slate-500">
          <a href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
          <a href="mailto:support@recruit-iq.com" className="hover:text-indigo-400 transition-colors">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}
