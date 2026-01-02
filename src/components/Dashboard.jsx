import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react";

// --- FULL SAMPLE DATA ---
const SAMPLE_JD = `JOB TITLE: Senior FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY RANGE: $200,000 - $250,000 + Equity

ABOUT THE ROLE:
We are seeking a Senior FinTech Architect to lead the modernization of our high-frequency trading platform. You will be responsible for scaling our microservices architecture to handle over $500M in daily transaction volume with sub-millisecond latency.

KEY RESPONSIBILITIES:
- Architect and implement high-availability systems on AWS (EKS, Lambda, RDS).
- Lead the migration of legacy monolithic applications to a microservices architecture.
- Optimize Node.js and Go services for maximum throughput and minimal latency.
- Ensure strict adherence to SOC2 Type II and PCI-DSS compliance standards.
- Mentor a team of 10-15 senior engineers and conduct code reviews.
- Design real-time data streaming pipelines using Kafka or Kinesis.

REQUIRED QUALIFICATIONS:
- 10+ years of software engineering experience, with at least 5 years in an architectural role.
- Deep expertise in AWS cloud-native services and Kubernetes orchestration.
- Proven track record of scaling high-volume transactional systems (FinTech preferred).
- Strong proficiency in React (frontend) and Node.js/Go (backend).
- Experience with database sharding and partitioning strategies.

PREFERRED SKILLS:
- Experience with React 19 concurrent features.
- Knowledge of Blockchain/Ledger technologies.
- Previous experience navigating SOC2 audits.`;

const SAMPLE_RESUME = `ALEXANDER MERCER
Senior Principal Engineer
New York, NY | alex.mercer@example.com

PROFESSIONAL SUMMARY:
Results-driven Lead Engineer with 12 years of experience building scalable financial systems. Recently led the infrastructure overhaul at Innovate Financial, reducing core engine latency by 45% and cutting annual compute costs by $2M. Expert in cloud-native architectures, team leadership, and high-performance computing.

WORK EXPERIENCE:

Innovate Financial | Lead Engineer | 2019 - Present
- Spearheaded the migration of the core trading engine from on-premise servers to AWS EKS, resulting in 99.999% uptime.
- Managed scaling operations from 50 to 500+ microservices, utilizing Terraform for Infrastructure as Code.
- Optimized database queries and caching strategies (Redis), reducing P99 latency by 45%.
- Mentored a cross-functional team of 15 engineers, establishing best practices for CI/CD and automated testing.
- Direct experience handling daily transaction volumes exceeding $500M.

TechStream Solutions | Senior Backend Developer | 2015 - 2019
- Designed and built RESTful APIs using Node.js and Express for a payment processing gateway.
- Implemented real-time fraud detection algorithms processing 10k events per second.
- reduced database costs by 30% through efficient schema design in PostgreSQL.

SKILLS:
- Languages: JavaScript (Node.js), TypeScript, Go, Python, SQL.
- Cloud & DevOps: AWS (Expert), Docker, Kubernetes, Terraform, Jenkins.
- Compliance: Familiar with general security best practices and data encryption.
- Frontend: React, Redux, Next.js.

EDUCATION:
- B.S. Computer Science, MIT (2014)
`;

export default function Dashboard() {
  const { isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState('jd'); 
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSignUpGate, setShowSignUpGate] = useState(false);
  const [guestCount, setGuestCount] = useState(0);

  // Load guest usage
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
    setJdText(SAMPLE_JD);
    setResumeText(SAMPLE_RESUME);
    setActiveTab('jd'); 
  };

  // --- DOWNLOAD WORD DOC FUNCTION ---
  const downloadInterviewGuide = () => {
    if (!analysis) return;
    
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Interview Guide</title></head>
      <body>
        <h1>Recruit-IQ Strategic Interview Guide</h1>
        <h2>Candidate Analysis Score: ${analysis.score}</h2>
        <hr/>
        <h3>Strengths to Validate</h3>
        <ul>${analysis.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
        <h3>Critical Gaps to Probe</h3>
        <ul>${analysis.gaps.map(g => `<li>${g}</li>`).join('')}</ul>
        <hr/>
        <h3>Deep-Dive Questions</h3>
        ${analysis.questions.map(q => `<p><strong>Q: ${q}</strong><br/><em>Look for specific metrics and "I" statements vs "We" statements.</em></p>`).join('')}
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "RecruitIQ_Interview_Guide.doc";
    link.click();
  };

  const handleScreen = () => {
    if (!isSignedIn) {
      if (guestCount >= 3) {
        setShowSignUpGate(true);
        return;
      }
      const newCount = guestCount + 1;
      setGuestCount(newCount);
      localStorage.setItem('guest_screens', newCount.toString());
    }

    setLoading(true);
    
    // SIMULATED AI ANALYSIS
    setTimeout(() => {
      setAnalysis({
        score: 94,
        summary: "Alexander is a premier candidate. His direct experience migrating core trading engines to EKS and reducing latency by 45% is a 1:1 match for your modernization goals. He brings the rare combination of architectural vision and hands-on execution.",
        strengths: [
          "Direct evidence of high-impact latency reduction (45% / $2M savings).",
          "proven capability scaling microservices from 50 to 500+ (Exact scale match).",
          "Strong leadership capability managing large teams (15 engineers).",
          "Perfect tech stack alignment: AWS, EKS, Node.js, and Go.",
          "High-volume transaction experience ($500M+ daily) matches your specific domain needs."
        ],
        gaps: [
          "Resume mentions 'familiarity' with security but lacks specific evidence of leading a SOC2 Type II audit.",
          "No explicit mention of React 19 concurrent rendering features in recent projects.",
          "Recent focus has been infrastructure-heavy; need to verify current hands-on coding speed."
        ],
        questions: [
          "In your migration to EKS, how specifically did you handle data consistency during the cutover phase?",
          "You mentioned reducing latency by 45%. Walk us through the specific bottleneck you identified in the database layer.",
          "Tell me about a time you had to enforce a security practice that slowed down development. How did you handle the pushback?",
          "How would you approach architecting a real-time stream for compliance logging without impacting transaction throughput?",
          "Describe your strategy for partitioning the database when transaction volume doubled."
        ],
        marketIntel: {
          salary: "$210k - $245k Base",
          competitiveness: "Top 2% (Highly Competitive)",
          availability: "Likely entertaining multiple offers"
        },
        email: "Subject: Interview Request - Senior FinTech Architect\n\nHi Alexander,\n\nI reviewed your background and was incredibly impressed by your work at Innovate Financial—specifically how you reduced core engine latency by 45% while migrating to EKS.\n\nWe are currently tackling a similar scale challenge ($500M+ daily volume) and I think your architectural approach would be invaluable here.\n\nAre you open to a brief conversation this Thursday or Friday?\n\nBest,\n[Your Name]"
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 relative font-sans">
      
      {/* FREE SCREEN COUNTER */}
      {!isSignedIn && (
        <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-2xl flex justify-between items-center animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
             <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded">Guest Mode</span>
             <p className="text-sm text-blue-200">You have <span className="text-white font-bold">{3 - guestCount} free screens</span> remaining.</p>
          </div>
          <SignUpButton mode="modal">
            <button className="text-xs font-bold uppercase text-blue-400 hover:text-white transition">Sign Up to Save Data</button>
          </SignUpButton>
        </div>
      )}

      {/* 1-2-3 GUIDE */}
      <div className="flex flex-col md:flex-row justify-between p-6 bg-slate-900/50 border border-slate-800 rounded-3xl gap-4">
         <div className="flex items-center gap-4"><span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20">1</span><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Set JD</p></div>
         <div className="flex items-center gap-4"><span className="bg-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20">2</span><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Resume</p></div>
         <div className="flex items-center gap-4"><span className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/20">3</span><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Screen</p></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <div className="bg-[#0f172a] p-6 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl relative">
           
           <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-2xl">
             <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'jd' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}>JD Editor</button>
             <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'resume' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}>Resume View</button>
           </div>
           
           <div className="mb-4 flex gap-2">
             <label className="flex-1 text-center cursor-pointer bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 py-3 rounded-xl text-[10px] font-black uppercase border border-blue-500/20 transition">
                Upload File <input type="file" onChange={handleFileUpload} className="hidden" />
             </label>
             <button 
                onClick={handleLoadSamples}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-[10px] font-black uppercase border border-slate-700 transition"
             >
                Load Full Samples
             </button>
           </div>

           <textarea 
             className="flex-1 bg-transparent resize-none outline-none text-slate-300 font-medium leading-relaxed p-4 border border-slate-800/50 rounded-2xl mb-4 text-xs"
             placeholder={`Paste text or use the Load Sample button...`}
             value={activeTab === 'jd' ? jdText : resumeText}
             onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
           />
           
           <button onClick={handleScreen} disabled={loading} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2">
             {loading ? "Analyzing Candidate..." : "3. Get Analysis Score"}
           </button>

           {/* SWIRL LOGO */}
           <div className="absolute top-4 right-4 opacity-20 hover:opacity-100 transition-opacity">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10C30 10 10 30 10 50C10 70 30 90 50 90C70 90 90 70 90 50C90 30 70 10 50 10Z" stroke="white" strokeWidth="2" strokeDasharray="4 4"/>
                <path d="M50 25C65 25 75 35 75 50C75 65 65 75 50 75C35 75 25 65 25 50" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"/>
                <path d="M50 40C55 40 60 45 60 50C60 55 55 60 50 60" stroke="#10b981" strokeWidth="6" strokeLinecap="round"/>
              </svg>
           </div>
        </div>
        
        {/* OUTPUT PANEL */}
        <div className="h-[850px] overflow-y-auto pr-2 custom-scrollbar">
           {!analysis ? (
             <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 uppercase font-black text-[10px] tracking-widest">
               <p>Analysis Result View</p>
             </div>
           ) : (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                {/* Score & Summary */}
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative">
                   <div className="w-20 h-20 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-3xl font-black mb-4 text-white shadow-lg shadow-blue-500/40">
                     {analysis.score}
                   </div>
                   <p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.summary}"</p>
                </div>

                {/* Strengths (5) & Gaps (3) - LARGER FONT */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-900 border border-emerald-500/20 p-8 rounded-[2rem]">
                     <h4 className="text-xs font-black uppercase text-emerald-500 mb-4 tracking-widest">5 Key Strengths</h4>
                     <ul className="space-y-3">
                       {analysis.strengths.map((s, i) => (
                         <li key={i} className="text-sm text-slate-300 flex gap-3 leading-snug">
                           <span className="text-emerald-500 font-bold text-lg">✓</span> {s}
                         </li>
                       ))}
                     </ul>
                  </div>
                  <div className="bg-slate-900 border border-rose-500/20 p-8 rounded-[2rem]">
                     <h4 className="text-xs font-black uppercase text-rose-500 mb-4 tracking-widest">3 Critical Gaps</h4>
                     <ul className="space-y-3">
                       {analysis.gaps.map((g, i) => (
                         <li key={i} className="text-sm text-slate-300 flex gap-3 leading-snug">
                           <span className="text-rose-500 font-bold text-lg">!</span> {g}
                         </li>
                       ))}
                     </ul>
                  </div>
                </div>

                {/* Market Intelligence - SALARY & COMPETITIVENESS */}
                <div className="bg-slate-900 border border-indigo-500/20 p-6 rounded-[2rem]">
                   <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-4 tracking-widest">Market Intelligence</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase mb-1">Est. Market Salary</p>
                        <p className="text-lg font-bold text-white">{analysis.marketIntel.salary}</p>
                      </div>
                      <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase mb-1">Competitiveness Score</p>
                        <p className="text-lg font-bold text-emerald-400">{analysis.marketIntel.competitiveness}</p>
                      </div>
                   </div>
                </div>

                {/* Strategic Interview Questions - DOWNLOADABLE */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
                   <div className="flex justify-between items-center mb-4">
                     <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Interview Guide</h4>
                     <button onClick={downloadInterviewGuide} className="text-[9px] font-bold uppercase bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-white transition flex items-center gap-2">
                       <span>↓</span> Download Word Doc
                     </button>
                   </div>
                   <ul className="space-y-4">
                     {analysis.questions.map((q, i) => <li key={i} className="text-sm text-slate-300 italic border-l-2 border-slate-700 pl-4 py-1">"Q{i+1}: {q}"</li>)}
                   </ul>
                </div>

                {/* Targeted Email Outreach - SPECIFIC DETAILS */}
                <div className="bg-slate-900 border border-blue-500/20 p-6 rounded-[2rem]">
                   <h4 className="text-[10px] font-black uppercase text-blue-400 mb-4 tracking-widest">Draft Outreach</h4>
                   <div className="bg-black/20 p-6 rounded-xl text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed border border-blue-500/10">
                     {analysis.email}
                   </div>
                   <button onClick={() => alert("Copied to clipboard!")} className="mt-4 w-full py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[10px] font-black uppercase rounded-xl transition">Copy to Clipboard</button>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* DETAILED PAYWALL MODAL */}
      {showSignUpGate && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
           <div className="bg-[#0f172a] border border-slate-700 p-10 rounded-[3rem] max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
              {/* Highlight Glow */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              
              <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Unlock Unlimited</h2>
              <p className="text-blue-400 font-bold text-sm mb-6 uppercase tracking-widest">Recruit-IQ Elite</p>

              <div className="bg-slate-900/50 rounded-2xl p-6 mb-8 border border-slate-800 text-left">
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-slate-300"><span className="text-emerald-500 font-bold">✓</span> Unlimited AI Screening & Parsing</li>
                  <li className="flex gap-3 text-sm text-slate-300"><span className="text-emerald-500 font-bold">✓</span> Detailed Market Intelligence Data</li>
                  <li className="flex gap-3 text-sm text-slate-300"><span className="text-emerald-500 font-bold">✓</span> Downloadable Interview Guides</li>
                  <li className="flex gap-3 text-sm text-slate-300"><span className="text-emerald-500 font-bold">✓</span> One-Click Email Outreach Generation</li>
                </ul>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-black text-white">$29.99</span><span className="text-slate-500">/mo</span>
                <p className="text-xs text-slate-400 mt-2">Start your <span className="text-white font-bold">3-Day Free Trial</span> today.</p>
              </div>

              <SignUpButton mode="modal">
                <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl font-black uppercase text-xs text-white shadow-xl shadow-blue-600/30 transition-all transform hover:scale-[1.02]">
                  Start Free 3-Day Trial
                </button>
              </SignUpButton>
              <button onClick={() => setShowSignUpGate(false)} className="mt-6 text-[10px] font-bold uppercase text-slate-600 hover:text-slate-400">No Thanks</button>
           </div>
        </div>
      )}
    </div>
  );
}
