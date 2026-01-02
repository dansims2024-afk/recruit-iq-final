import React from 'react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="bg-[#020617] text-white font-sans">
      {/* Hero Section */}
      <section className="py-24 px-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/10 blur-[120px] rounded-full" />
        <h1 className="text-6xl font-black tracking-tighter mb-6 relative z-10">
          Hire with <span className="text-blue-500">Synergy</span>, Not Guesswork.
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Recruit-IQ uses advanced AI to quantify candidate alignment, providing real-time Market Intelligence and instant interview guides.
        </p>
        <button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-500 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-600/20 transition-all active:scale-95">
          Start Your 3 Free Screens
        </button>
      </header>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-10 py-20 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-slate-800">
          <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 font-black">1</div>
          <h3 className="text-xl font-bold mb-4">Synergy Score</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Instantly see how a candidate's quantifiable background matches your specific mission context.</p>
        </div>
        <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-slate-800">
          <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/20 font-black">2</div>
          <h3 className="text-xl font-bold mb-4">Market Intel</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Live 2026 salary benchmarks (Entry to Premium) based on real-time industry demand.</p>
        </div>
        <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-slate-800">
          <div className="bg-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-600/20 font-black">3</div>
          <h3 className="text-xl font-bold mb-4">One-Click Outreach</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Generate personalized cold outreach or interview invites based on candidate gaps and strengths.</p>
        </div>
      </section>
    </div>
  );
};
