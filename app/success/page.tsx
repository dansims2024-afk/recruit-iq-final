export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center text-white p-6">
      <div className="bg-[#111827] border border-slate-700 rounded-[2.5rem] p-10 text-center shadow-2xl">
        <h2 className="text-3xl font-black mb-4 text-emerald-400">Payment Successful!</h2>
        <p className="text-slate-400 mb-8 text-sm">Your Elite access is active. Click below to start scanning.</p>
        <a href="/" className="block w-full bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all">
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
