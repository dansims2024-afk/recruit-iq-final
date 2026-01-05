import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, SignUpButton } from "@clerk/clerk-react";

// --- CONFIGURATION ---
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803"; 

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
  
  // Logic to determine if user is on the paid plan
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
          body { font-family: 'Segoe UI', 'Arial', sans-serif; font-size: 11pt; color: #333; }
          
          /* HEADER STYLES */
          .header-container { background-color: #0f172a; padding: 30px; margin-bottom: 20px; color: white; text-align: center; }
          .brand-title { font-size: 28pt; font-weight: bold; letter-spacing: 4px; text-transform: uppercase; margin: 0; }
          .sub-title { font-size: 10pt; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }

          /* SCORECARD */
          .score-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #cbd5e1; }
          .score-cell { padding: 20px; text-align: center; background-color: #f8fafc; width: 20%; vertical-align: middle; border-right: 1px solid #cbd5e1; }
          .score-number { font-size: 48pt; font-weight: bold; color: #2563eb; display: block; line-height: 1; }
          .score-label { font-size: 9pt; text-transform: uppercase; color: #64748b; font-weight: bold; }
          .summary-cell { padding: 20px; background-color: #ffffff; vertical-align: middle; font-style: italic; color: #475569; font-size: 11pt; }

          /* SECTIONS */
          h2 { font-size: 14pt; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 25px; text-transform: uppercase; }
          
          .strength-item { color: #065f46; margin-bottom: 8px; font-weight: bold; }
          .gap-item { color: #9f1239; margin-bottom: 8px; font-weight: bold; }

          /* QUESTIONS */
          .q-box { background-color: #f1f5f9; border-left: 6px solid #2563eb; padding: 15px; margin-bottom: 15px; }
          .q-header { font-size: 9pt; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
          .q-text { font-size: 12pt; font-weight: bold; color: #1e293b; }
          .notes-area { border: 1px dashed #cbd5e1; height: 60px; margin-top: 10px; background-color: white; }

          .footer { margin-top: 50px; text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header-container">
            <div class="brand-title">RECRUIT-IQ</div>
            <div class="sub-title">Strategic Interview Intelligence | ${reportDate}</div>
        </div>

        <table class="score-table">
            <tr>
                <td class="score-cell">
                    <span class="score-number">${analysis.score}%</span>
                    <span class="score-label">Match Score</span>
                </td>
                <td class="summary-cell">
                    "${analysis.summary}"
                </td>
            </tr>
        </table>

        <h2>✅ Key Strengths to Validate</h2>
        <ul>${analysis.strengths.map(s => `<li class="strength-item">${s}</li>`).join('')}</ul>

        <h2>⚠️ Critical Gaps to Probe</h2>
        <ul>${analysis.gaps.map(g => `<li class="gap-item">${g}</li>`).join('')}</ul>

        <h2>🎤 Deep-Dive Interview Questions</h2>
        ${analysis.questions.map((q, i) => `
            <div class="q-box">
                <div class="q-header">Question ${i+1}</div>
                <div class="q-text">${q}</div>
                <div style="font-size: 9pt; color: #94a3b8; margin-top:10px;">Interviewer Notes:</div>
                <div class="notes-area"></div>
            </div>
        `).join('')}

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
            <span className={`${jdComplete ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20 flex-shrink-0 transition-all`}>
              {jdComplete ? "✓" : "1"}
            </span>
            <p className={`text-[10px] font-black uppercase tracking-widest ${jdComplete ? 'text-blue-400' : 'text-slate-400'}`}>Step 1: Add Job Description</p>
         </div>
         <div className="flex items-center gap-4">
            <span className={`${resumeComplete ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/20 flex-shrink-0 transition-all`}>
              {resumeComplete ? "✓" : "2"}
            </span>
            <p className={`text-[10px] font-black uppercase tracking-widest ${resumeComplete ? 'text-indigo-400' : 'text-slate-400'}`}>Step 2: Add Resume</p>
         </div>
         <div className="flex items-center gap-4">
            <span className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-500/20 flex-shrink-0">3</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 3: Screen candidate for Match Score and additional tools</p>
         </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <div className={`bg-[#0f172a] p-6 rounded-[2.5rem] border border-slate-800 flex flex-col h-[850px] shadow-2xl relative`}>
           {/* TABS WITH STRICT COLOR MATCHING */}
           <div className="flex flex-col md:flex-row gap-2 mb-4 bg-black/20 p-1 rounded-2xl">
             
             {/* STEP 1 BUTTON: ALWAYS BLUE WHEN ACTIVE */}
             <button onClick={() => setActiveTab('jd')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${isJd ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-blue-400'}`}>
               <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${isJd ? 'bg-white text-blue-600' : 'bg-slate-700 text-slate-400'}`}>{jdComplete ? "✓" : "1"}</span> Upload/ Paste Job Description
             </button>
             
             {/* STEP 2 BUTTON: ALWAYS INDIGO WHEN ACTIVE */}
             <button onClick={() => setActiveTab('resume')} className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all ${isResume ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-indigo-400'}`}>
               <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${isResume ? 'bg-white text-indigo-600' : 'bg-slate-700 text-slate-400'}`}>{resumeComplete ? "✓" : "2"}</span> Upload/ Paste Resume
             </button>
           </div>
           
           <div className="mb-4 flex gap-2">
             <label className={`flex-1 text-center cursor-pointer ${activeHover} ${activeText} py-3 rounded-xl text-[10px] font-black uppercase border ${activeBorder} transition`}>
                Upload File <input type="file" onChange={handleFileUpload} className="hidden" />
             </label>
             <button onClick={handleLoadSamples} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-[10px] font-black uppercase border border-slate-700 transition">Sample</button>
           </div>

           <textarea 
             className={`flex-1 bg-transparent resize-none outline-none text-slate-300 font-medium leading-relaxed p-4 border border-slate-800/50 rounded-2xl mb-4 text-xs focus:border-${activeColor}-500 transition-colors`}
             value={activeTab === 'jd' ? jdText : resumeText}
             placeholder={activeTab === 'jd' ? "Paste Job Description Text Here..." : "Paste Resume Text Here..."}
             onChange={(e) => activeTab === 'jd' ? setJdText(e.target.value) : setResumeText(e.target.value)}
           />
           
           {/* STEP 3 BUTTON: ALWAYS EMERALD */}
           <button onClick={handleScreen} disabled={loading} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase text-xs tracking-widest text-white shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3">
             <span className="w-6 h-6 bg-white text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
             {loading ? "Analyzing..." : "Screen Candidate"}
           </button>
        </div>
        
        {/* OUTPUT PANEL */}
        <div className="h-[850px] overflow-y-auto pr-2 custom-scrollbar">
           {!analysis ? (
             <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-600 uppercase font-black text-[10px]">
               Analysis View
             </div>
           ) : (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl">
                   {/* 📝 ADDED % SYMBOL TO MATCH SCORE */}
                   <div className="w-24 h-24 mx-auto bg-emerald-600 rounded-full flex items-center justify-center text-3xl font-black mb-4 text-white shadow-lg shadow-emerald-500/40">
                     {analysis.score}<span className="text-lg align-top relative top-[-4px] ml-1">%</span>
                   </div>
                   <p className="text-slate-300 italic text-sm leading-relaxed">"{analysis.summary}"</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-900 border border-emerald-500/20 p-8 rounded-[2rem]">
                     <h4 className="text-xs font-black uppercase text-emerald-500 mb-4 tracking-widest">Key Strengths</h4>
                     <ul className="space-y-3">{analysis.strengths.map((s, i) => (<li key={i} className="text-sm text-slate-300 flex gap-3"><span className="text-emerald-500 font-bold text-lg">✓</span> {s}</li>))}</ul>
                  </div>
                  <div className="bg-slate-900 border border-rose-500/20 p-8 rounded-[2rem]">
                     <h4 className="text-xs font-black uppercase text-rose-500 mb-4 tracking-widest">Critical Gaps</h4>
                     <ul className="space-y-3">{analysis.gaps.map((g, i) => (<li key={i} className="text-sm text-slate-300 flex gap-3"><span className="text-rose-500 font-bold text-lg">!</span> {g}</li>))}</ul>
                  </div>
                </div>

                <div className="bg-slate-900 border border-emerald-500/20 p-6 rounded-[2rem]">
                   <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-4 tracking-widest">Market Intelligence</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 p-4 rounded-xl border border-white/5"><p className="text-[9px] text-slate-500 uppercase mb-1">Salary Range</p><p className="text-lg font-bold text-white">{analysis.marketIntel.salary}</p></div>
                      <div className="bg-black/20 p-4 rounded-xl border border-white/5"><p className="text-[9px] text-slate-500 uppercase mb-1">Status</p><p className="text-lg font-bold text-emerald-400">Competitive</p></div>
                   </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
                   <div className="flex justify-between items-center mb-4"><h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Interview Guide</h4><button onClick={downloadInterviewGuide} className="text-[9px] font-bold uppercase bg-slate-800 px-3 py-1 rounded-lg text-white">Download Doc</button></div>
                   <ul className="space-y-4">{analysis.questions.map((q, i) => <li key={i} className="text-sm text-slate-300 italic border-l-2 border-slate-700 pl-4 py-1">"{q}"</li>)}</ul>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* 🚀 GLOWING POP-UP FOR FREE TRIAL */}
      {showSignUpGate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"></div>
           
           <div className="bg-gradient-to-b from-slate-900 via-[#0f172a] to-slate-950 border-2 border-blue-500/50 p-6 md:p-10 rounded-3xl md:rounded-[3rem] max-w-lg w-full text-center shadow-[0_0_60px_-15px_rgba(59,130,246,0.6)] relative overflow-hidden z-10 max-h-[90vh] overflow-y-auto">
              
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase tracking-tighter [text-shadow:_0_2px_10px_rgb(59_130_246_/_50%)]">Recruit-IQ Elite</h2>
              <p className="text-blue-300 font-bold text-xs md:text-sm mb-6 uppercase tracking-widest">Unlock Your 3-Day Free Trial</p>

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
              </div>
              
              <button onClick={() => setShowSignUpGate(false)} className="mt-6 text-xs font-bold uppercase text-slate-600 hover:text-blue-400 transition-colors tracking-widest">Close</button>
           </div>
        </div>
      )}
    </div>
  );
}
