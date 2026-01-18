import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignInButton, UserButton, SignUpButton } from "@clerk/clerk-react";
import logo from '../logo.png'; // Points to src/logo.png

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const handleScreen = async () => {
    if ((!isSignedIn && scanCount >= 3) || (isSignedIn && !isPro)) {
      setShowLimitModal(true);
      return;
    }
    // ... AI Screen logic would go here
  };

  if (!isLoaded) return null;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto text-white bg-[#0B1120] min-h-screen pt-20">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="h-12 w-auto" />
          <h1 className="text-2xl font-black uppercase">Recruit-IQ</h1>
        </div>
        <div className="flex items-center gap-4">
          {!isSignedIn && <SignInButton mode="modal"><button className="bg-indigo-600 px-5 py-2 rounded-lg text-xs font-bold uppercase">Log In</button></SignInButton>}
          <UserButton afterSignOutUrl="/"/>
        </div>
      </div>

      <button onClick={handleScreen} className="py-5 w-full bg-indigo-600 rounded-2xl font-black uppercase text-xs shadow-xl">Execute AI Screen</button>

      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/80">
          <div className="relative w-full max-w-3xl bg-[#0F172A] border border-slate-700/50 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row p-10">
            <div className="md:w-3/5">
              <img src={logo} alt="Logo" className="h-10 w-auto mb-6" />
              <h2 className="text-4xl font-black mb-3">Hire Your Next Star In Seconds.</h2>
              <p className="text-slate-400 text-sm mb-8">Unlock unlimited analysis and elite reports.</p>
              
              {!isSignedIn ? (
                <SignUpButton mode="modal" forceRedirectUrl="/upgrade" signInForceRedirectUrl="/upgrade">
                  <button className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl uppercase text-xs">Create Free Account</button>
                </SignUpButton>
              ) : (
                <a href={STRIPE_URL} className="block w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-xl uppercase text-xs">Start 3-Day Free Trial</a>
              )}
              <button onClick={() => setShowLimitModal(false)} className="mt-5 text-slate-500 underline w-full text-[10px] font-bold uppercase">Maybe Later</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
