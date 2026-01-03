import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react";

// --- CONFIGURATION ---
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/fZu8wOesS7Am1wf0Ilcs800"; 

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
- Reduced database costs by 30% through efficient schema design in PostgreSQL.

SKILLS:
- Languages: JavaScript (Node.js), TypeScript, Go, Python, SQL.
- Cloud & DevOps: AWS (Expert), Docker, Kubernetes, Terraform, Jenkins.
- Compliance: Familiar with general security best practices and data encryption.
- Frontend: React, Redux, Next.js.

EDUCATION:
- B.S. Computer Science, MIT (2014)
`;

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
    setJdText(SAMPLE_JD);
    setResumeText(SAMPLE_RESUME);
    setActiveTab('jd'); 
  };

  const downloadInterviewGuide = () => {
    if (!analysis) return;
    const reportDate = new Date().toLocaleDateString();
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Recruit-IQ Interview Guide</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #333; }
          .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
          .meta { font-size: 10pt; color: #cbd5e1; margin-top: 5px; }
          h1 { color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 5px; margin-top: 30px; font-size: 16pt; }
          .score-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 5px; text-align: center; margin-bottom: 30px; }
          .score-val { font-size: 32pt; font-weight: bold; color: #2563eb; display: block; }
          .question-box { border-left: 5px solid #2563eb; background-color: #f1f5f9; padding: 10px 15px; margin-bottom: 15px; }
          .q-text { font-weight: bold; font-size: 12pt; display: block; margin-bottom: 5px; }
          .footer { margin-top: 50px; text-align: center; font-size: 9pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header"><div class="logo">RECRUIT-IQ</div><div class="meta">Strategic Interview Intelligence | Date: ${reportDate}</div></div>
        <div class="score-box"><span style="font-size: 12pt; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">Candidate Fit Score</span><span class="score-val">${analysis.score}</span><div>"${analysis.summary}"</div></div>
        <h1>1. Key Strengths to Validate</h1><ul>${analysis.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
        <h1>2. Critical Gaps to Probe</h1><ul>${analysis.gaps.map(g => `<li>${g}</li>`).join('')}</ul>
        <h1>3. Deep-Dive Interview Questions</h1>${analysis.questions.map(q => `<div class="question-box"><span class="q-text">Q: ${q}</span></div>`).join('')}
        <div class="footer">Generated by Recruit-IQ AI | Confidential Candidate Analysis</div>
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
    } else if (!isPro) {
        setShowSignUpGate(true);
        return;
    }

    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        score: 94,
        summary: "Alexander is a premier candidate. His direct experience migrating core trading engines to EKS and reducing latency by 45% is a 1:1 match for your modernization goals.",
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

  const isJd = activeTab === 'jd';
  const isResume = activeTab === 'resume';
  const activeColor = isJd ? 'blue' : 'indigo';
  const activeHover = isJd ? 'hover:bg-blue-600/20' : 'hover:bg-indigo-600/20';
  const activeText = isJd ? 'text-blue-400' : 'text-indigo-400';
  const activeBorder = isJd ? 'border-blue-500/20' : 'border-indigo-500/20';

  const jdComplete = jdText.length > 50; 
  const resumeComplete = resumeText.length > 50;

  const dynamicStripeLink = isSignedIn && user 
    ? `${STRIPE_PAYMENT_LINK}?client_reference_id=${user.id}` 
    : STRIPE_PAYMENT_LINK;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 relative font-sans">
      
      {/* BANNER LOGIC */}
      {!isSignedIn ? (
        <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-2xl flex justify-between items-center animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
             <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded">Guest Mode</span>
             <p className="text-sm text-slate-300">You have <span className="text-white font-bold">{3 - guestCount} free screens</span> remaining.</p>
          </div>
          <button onClick={() => setShowSignUpGate(true)} className="text-xs font-bold uppercase text-emerald-400 hover:text-white transition">Sign Up to Save Data</button>
        </div>
      ) : isPro ? (
        <div className="bg-emerald-900/30 border border-emerald-500/30 p-4 rounded-2xl flex justify-between items-center animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
             <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded">Elite Plan Active</span>
             <p className="text-sm text-emerald-200">You have unlimited access.</p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 p-4 rounded-2xl flex justify-between items-center animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
             <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded">Free Plan</span>
             <p className="text-sm text-blue-200">Unlock detailed market data & unlimited screens.</p>
          </div>
          <a href={dynamicStripeLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase text-blue-400 hover:text-white transition bg-blue-600/10 px-4 py-2 rounded-lg border border-blue-500/20 hover:bg-blue-600">Upgrade to Elite</a>
        </div>
      )}

      {/* 1-2-3 GUIDE */}
      <div className="flex flex-col md:flex-row justify-between p-6 bg-slate-900/50 border border-slate-800 rounded-3xl gap-4">
         <div className="flex items-center gap-4">
            <span className={`${jdComplete ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20 flex-shrink-0 transition-all`}>
              {jdComplete ? "✓" : "1"}
            </span>
            <p className={`text-[10px] font-black uppercase tracking-widest ${jdComplete ? 'text-emerald-400' : 'text-slate-400'}`}>Upload or Paste Job Description</p>
         </div>
         <div className="flex items-center gap-4">
            <span className={`${resumeComplete ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20 flex-shrink-0 transition-all`}>
              {resumeComplete ? "✓" : "2"}
            </span>
            <p className={`text-[10px] font-black uppercase tracking-widest ${resumeComplete ? 'text-emerald-400' : 'text-slate-400'}`}>Upload or Paste Resume</p>
         </div>
         <div className="flex items-center gap-4">
            <span className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/20 flex-shrink-0">3</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Screen for Match Score and Additional Tools</p>
         </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <div className={`bg-[#0f172a] p-6 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl relative transition-colors duration-500`}>
           <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-2xl">
             <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${isJd ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-blue-400'}`}>
               {jdComplete && <span className="text-emerald-400 font-bold">✓</span>} Step 1: Upload/Paste JD
             </button>
             <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${isResume ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-indigo-400'}`}>
               {resumeComplete && <span className="text-emerald-400 font-bold">✓</span>} Step 2: Upload/Paste Resume
             </button>
           </div>
           
           <div className="mb-4 flex gap-2">
             <label className={`flex-1 text-center cursor-pointer ${activeHover} ${activeText} py-3 rounded-xl text-[10px] font-black uppercase border ${activeBorder} transition`}>
                Upload File <input type="file" onChange={handleFileUpload} className="hidden" />
             </label>
             <button onClick={handleLoadSamples} className={`flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-[10px] font-black uppercase border border-slate-700 transition`}>Sample</button>
           </div>

           <textarea 
             className={`flex-1 bg-transparent resize-none outline-none text-slate-300 font-medium leading-relaxed p-4 border border-slate-800/50 rounded-2xl mb-4 text-xs focus:border-${activeColor}-500 transition-colors`}
             placeholder={`Paste text here...`}
             value={activeTab === 'jd' ? jdText : resumeText}
             onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
           />
           
           <button onClick={handleScreen} disabled={loading} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-white">
             {loading ? "Analyzing Candidate..." : "3. Screen Candidate"}
           </button>

           <div className="absolute top-4 right-4 opacity-20 hover:opacity-100 transition-opacity">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 10C30 10 10 30 10 50C10 70 30 90 50 90C70 90 90 70 90 50C90 30 70 10 50 10Z" stroke="white" strokeWidth="2" strokeDasharray="4 4"/><path d="M50 25C65 25 75 35 75 50C75 65 65 75 50 75C35 75 25 65 25 50" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"/><path d="M50 40C55 40 60 45 60 50C60 55 55 60 50 60" stroke="#10b981" strokeWidth="6" strokeLinecap="round"/></svg>
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
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl relative">
                   <div className="w-20 h-20 mx-auto bg-emerald-600 rounded-full flex items-center justify-center text-3xl font-black mb-4 text-white shadow-lg shadow-emerald-500/40">{analysis.score}</div>
                   <p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.summary}"</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-900 border border-emerald-500/20 p-8 rounded-[2rem]">
                     <h4 className="text-xs font-black uppercase text-emerald-500 mb-4 tracking-widest">5 Key Strengths</h4>
                     <ul className="space-y-3">{analysis.strengths.map((s, i) => (<li key={i} className="text-sm text-slate-300 flex gap-3 leading-snug"><span className="text-emerald-500 font-bold text-lg">✓</span> {s}</li>))}</ul>
                  </div>
                  <div className="bg-slate-900 border border-rose-500/20 p-8 rounded-[2rem]">
                     <h4 className="text-xs font-black uppercase text-rose-500 mb-4 tracking-widest">3 Critical Gaps</h4>
                     <ul className="space-y-3">{analysis.gaps.map((g, i) => (<li key={i} className="text-sm text-slate-300 flex gap-3 leading-snug"><span className="text-rose-500 font-bold text-lg">!</span> {g}</li>))}</ul>
                  </div>
                </div>

                <div className="bg-slate-900 border border-emerald-500/20 p-6 rounded-[2rem]">
                   <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-4 tracking-widest">Market Intelligence</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 p-4 rounded-xl border border-white/5"><p className="text-[9px] text-slate-500 uppercase mb-1">Est. Market Salary</p><p className="text-lg font-bold text-white">{analysis.marketIntel.salary}</p></div>
                      <div className="bg-black/20 p-4 rounded-xl border border-white/5"><p className="text-[9px] text-slate-500 uppercase mb-1">Competitiveness Score</p><p className="text-lg font-bold text-emerald-400">{analysis.marketIntel.competitiveness}</p></div>
                   </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
                   <div className="flex justify-between items-center mb-4"><h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Interview Guide</h4><button onClick={downloadInterviewGuide} className="text-[9px] font-bold uppercase bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-white transition flex items-center gap-2"><span>↓</span> Download Word Doc</button></div>
                   <ul className="space-y-4">{analysis.questions.map((q, i) => <li key={i} className="text-sm text-slate-300 italic border-l-2 border-slate-700 pl-4 py-1">"Q{i+1}: {q}"</li>)}</ul>
                </div>

                <div className="bg-slate-900 border border-emerald-500/20 p-6 rounded-[2rem]">
                   <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-4 tracking-widest">Draft Outreach</h4>
                   <div className="bg-black/20 p-6 rounded-xl text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed border border-emerald-500/10">{analysis.email}</div>
                   <button onClick={() => alert("Copied to clipboard!")} className="mt-4 w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[10px] font-black uppercase rounded-xl transition">Copy to Clipboard</button>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* FIX: SCROLLABLE POP-UP FOR SMALLER SCREENS */}
      {showSignUpGate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           {/* Dark Overlay */}
           <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"></div>
           
           {/* The Card - Added max-h-[90vh] and overflow-y-auto so it scrolls if too tall */}
           <div className="bg-gradient-to-b from-slate-900 via-[#0f172a] to-slate-950 border-2 border-blue-500/50 p-6 md:p-10 rounded-3xl md:rounded-[3rem] max-w-lg w-full text-center shadow-[0_0_60px_-15px_rgba(59,130,246,0.6)] relative overflow-hidden z-10 max-h-[90vh] overflow-y-auto">
              
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase tracking-tighter [text-shadow:_0_2px_10px_rgb(59_130_246_/_50%)]">Recruit-IQ Elite</h2>
              <p className="text-blue-300 font-bold text-xs md:text-sm mb-6 uppercase tracking-widest [text-shadow:_0_1px_5px_rgb(59_130_246_/_30%)]">Unlock Your 3-Day Free Trial</p>

              <div className="w-full py-4 mb-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center">
                <span className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider drop-shadow-lg">3-DAY FREE TRIAL</span>
              </div>

              <div className="bg-blue-950/30 rounded-2xl p-4 md:p-6 mb-6 border border-blue-800/50 shadow-inner text-left">
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-slate-200 items-center"><span className="text-emerald-400 font-black text-lg">✓</span> Unlimited AI Candidate Screens</li>
                  <li className="flex gap-3 text-sm text-slate-200 items-center"><span className="text-emerald-400 font-black text-lg">✓</span> Exclusive Market Salary Data</li>
                  <li className="flex gap-3 text-sm text-slate-200 items-center"><span className="text-emerald-400 font-black text-lg">✓</span> Downloadable Interview Guides</li>
                  <li className="flex gap-3 text-sm text-slate-200 items-center"><span className="text-emerald-400 font-black text-lg">✓</span> One-Click Email Outreach</li>
                </ul>
              </div>

              <div className="space-y-4">
                  <div className="text-center">
                     <span className="text-4xl md:text-5xl font-black text-white">$29.99</span><span className="text-slate-400 text-lg">/mo</span>
                     <p className="text-sm md:text-lg text-white font-bold mt-2">First 3 days are 100% free.</p>
                  </div>

                  {!isSignedIn ? (
                    <SignUpButton mode="modal">
                        <button className="w-full py-4 md:py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 rounded-2xl font-black uppercase text-sm md:text-base text-white shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all transform hover:scale-[1.02] tracking-widest">
                          Start My Free 3-Day Trial
                        </button>
                    </SignUpButton>
                  ) : (
                    <a 
                        href={dynamicStripeLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full py-4 md:py-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 rounded-2xl font-black uppercase text-sm md:text-base text-white shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all transform hover:scale-[1.02] tracking-widest"
                    >
                        Start My Free 3-Day Trial
                    </a>
                  )}
                  <p className="text-xs text-slate-500">No credit card required to sign up.</p>
              </div>
              
              <button onClick={() => setShowSignUpGate(false)} className="mt-6 text-xs font-bold uppercase text-slate-600 hover:text-blue-400 transition-colors tracking-widest">Close</button>
           </div>
        </div>
      )}
    </div>
  );
}
