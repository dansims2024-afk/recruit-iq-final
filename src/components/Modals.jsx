// Success Notification Popup
const SuccessPopup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-10 left-10 z-[200] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-left-10 flex items-center gap-3 font-bold">
      <div className="bg-white/20 p-1 rounded-full">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      {message}
    </div>
  );
};

// Automatic Paywall Logic
const PaywallModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/95 z-[300] backdrop-blur-md flex items-center justify-center p-4">
    <div className="bg-[#0f172a] border border-blue-500/30 p-12 rounded-[4rem] max-w-md w-full text-center shadow-2xl relative">
      <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition"><X /></button>
      <div className="bg-blue-600/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
        <Icons.Lock size={40} />
      </div>
      <h2 className="text-3xl font-black mb-3">Limit Reached</h2>
      <p className="text-slate-400 mb-8 leading-relaxed">Your 3 free screens are complete. Sign up for Elite to unlock unlimited recruiting intelligence.</p>
      
      <div className="bg-slate-900 p-6 rounded-3xl mb-8 border border-slate-800">
        <p className="text-4xl font-black">$29.99/mo</p>
        <p className="text-xs text-emerald-400 font-black mt-2 uppercase tracking-widest">Risk Free: 3-Day Trial</p>
      </div>
      
      <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">
        Claim My Trial
      </button>
    </div>
  </div>
);
