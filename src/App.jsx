// ... (Previous state and logic remain the same)

{/* LOCKED PRO ANALYSIS: STRENGTHS & GAPS */}
<div onClick={() => handleFeatureClick('pro', 'Pro Talent Audit')} className="relative cursor-pointer group">
  {!hasAccess('pro') && (
    <div className="absolute inset-0 z-10 bg-slate-950/60 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/5 shadow-2xl">
      <div className="bg-purple-600 p-3 rounded-full text-white shadow-lg"><Lock size={20}/></div>
    </div>
  )}
  
  <div className={`space-y-4 ${!hasAccess('pro') ? 'opacity-40 grayscale blur-[2px]' : ''}`}>
    
    {/* STRENGTHS AUDIT */}
    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
      <span className="text-emerald-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2 italic tracking-[0.2em]">
        <CheckCircle2 size={12}/> Predictive Strengths Audit
      </span>
      <div className="space-y-4">
        {analysis.strengths.map((s, i) => (
          <div key={i} className="border-l-2 border-emerald-500/30 pl-4">
            <p className="text-xs font-black text-white uppercase mb-1">{s.title}</p>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* NEW: MIRRORED GAPS SECTION */}
    <div className="bg-slate-900 p-6 rounded-3xl border border-rose-500/20 shadow-xl">
      <span className="text-rose-500 text-[10px] font-bold uppercase block mb-4 flex items-center gap-2 italic tracking-[0.2em]">
        <AlertCircle size={12}/> Critical Growth Gaps
      </span>
      <div className="space-y-4">
        {analysis.gaps.map((g, i) => (
          <div key={i} className="border-l-2 border-rose-500/30 pl-4">
            <p className="text-xs font-black text-white uppercase mb-1">{g.title}</p>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{g.desc}</p>
          </div>
        ))}
      </div>
    </div>

  </div>
</div>

// ... (Rest of component including Interview Guide and Footer remains)
