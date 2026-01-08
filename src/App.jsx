import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import Dashboard from "./components/Dashboard";
import logo from "./logo.png"; 

export default function App() {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');

  const handleSupportSubmit = () => {
    if (!supportMessage.trim()) return;
    
    // Trigger email client
    const subject = encodeURIComponent("Recruit-IQ Support Request");
    const body = encodeURIComponent(supportMessage);
    window.location.href = `mailto:hello@corecreativityai.com?subject=${subject}&body=${body}`;
    
    setIsSupportOpen(false);
    setSupportMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-white font-sans">
      {/* Universal Header */}
      <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        
        {/* LEFT SIDE: LOGO + BRAND */}
        <div className="flex items-center gap-3">
           <img 
             src={logo} 
             alt="Recruit-IQ Logo" 
             className="w-12 h-12 rounded-full shadow-lg shadow-blue-600/20 border border-slate-700 object-cover" 
           />
           <div className="flex flex-col">
             <span className="font-black text-xl tracking-tighter leading-none">Recruit-IQ</span>
             <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">by Core Creativity AI</span>
           </div>
        </div>

        {/* RIGHT SIDE: TAGLINE + AUTH */}
        <div className="flex items-center gap-6">
          {/* Tagline moved here (Hidden on mobile phones for space) */}
          <span className="hidden md:block text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Candidate Match Analyzer
          </span>

          <div>
            {/* Guest Mode: Show Sign In | User Mode: Show Profile */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-slate-800 hover:bg-slate-700 px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest text-white transition border border-slate-700">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Dashboard />
      </main>

      {/* Footer */}
      <footer className="p-8 border-t border-slate-900 bg-[#020617]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-slate-600">
           {/* ✅ UPDATED COPYRIGHT TEXT */}
           <span>© 2026 Core Creativity AI</span>
           
           <div className="flex gap-6 items-center">
             <a href="https://www.corecreativityai.com/blank-2" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition">Terms & Conditions</a>
             <a href="https://www.corecreativityai.com/blank" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition">Privacy Policy</a>
             <button onClick={() => setIsSupportOpen(true)} className="hover:text-blue-500 transition uppercase tracking-widest">Support</button>
           </div>
        </div>
      </footer>

      {/* SUPPORT MODAL POPUP */}
      {isSupportOpen && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[#0f172a] border border-slate-700 p-8 rounded-[2rem] max-w-md w-full shadow-2xl relative">
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Contact Support</h2>
                <button onClick={() => setIsSupportOpen(false)} className="text-slate-500 hover:text-white transition">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <p className="text-slate-400 text-xs mb-4">
                Have a question or feedback? Describe it below and we'll email you back shortly.
              </p>

              <textarea 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition h-32 resize-none mb-6"
                placeholder="How can we help you?"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
              />

              <div className="flex gap-3">
                <button 
                  onClick={handleSupportSubmit}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xs uppercase text-white shadow-lg shadow-blue-600/20 transition-all"
                >
                  Send Message
                </button>
                <button 
                  onClick={() => setIsSupportOpen(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs uppercase text-slate-400 transition-all"
                >
                  Cancel
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
