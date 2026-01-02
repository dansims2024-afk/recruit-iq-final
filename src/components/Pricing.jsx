const PricingPage = () => (
  <section className="py-20 px-10 max-w-5xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Choose Your Tier</h2>
      <p className="text-slate-400">Upgrade to unlock unlimited AI screening and premium exports.</p>
    </div>
    <div className="grid md:grid-cols-2 gap-8">
      {/* Free Tier */}
      <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[3rem] opacity-80">
        <h3 className="text-lg font-black uppercase text-slate-500 mb-2">Freemium</h3>
        <p className="text-4xl font-black mb-6">$0 <span className="text-sm font-normal text-slate-500">/ forever</span></p>
        <ul className="space-y-4 mb-10 text-sm text-slate-400">
          <li>• 3 Candidate Screens</li>
          <li>• Basic Synergy Score</li>
          <li>• Public Community Support</li>
        </ul>
        <button className="w-full py-4 border border-slate-700 rounded-2xl font-bold uppercase text-[10px]">Current Plan</button>
      </div>

      {/* Premium Tier */}
      <div className="bg-[#0f172a] border-2 border-blue-500 p-10 rounded-[3rem] relative shadow-2xl shadow-blue-500/10 scale-105">
        <div className="absolute top-0 right-10 bg-blue-600 text-white text-[8px] font-black uppercase px-4 py-1.5 rounded-b-lg">Most Popular</div>
        <h3 className="text-lg font-black uppercase text-blue-400 mb-2">Elite</h3>
        <p className="text-4xl font-black mb-1">$29.99 <span className="text-sm font-normal text-slate-500">/ month</span></p>
        <p className="text-[10px] text-emerald-400 font-bold uppercase mb-6">3-Day Free Trial Included</p>
        <ul className="space-y-4 mb-10 text-sm text-slate-200 font-medium">
          <li>• Unlimited AI Synergy Screens</li>
          <li>• Full Market Intelligence Access</li>
          <li>• Professional Word Doc Exports</li>
          <li>• Custom Outreach Generator</li>
        </ul>
        <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase text-[10px] transition-all shadow-lg shadow-blue-600/30">Start My Free Trial</button>
      </div>
    </div>
  </section>
);
