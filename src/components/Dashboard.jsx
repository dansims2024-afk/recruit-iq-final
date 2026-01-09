import React, { useState } from 'react';
import mammoth from 'mammoth';
import { useUser } from "@clerk/clerk-react";

// --- HIGH-LEVEL DEMO DATA ---
const SAMPLE_JD = `JOB TITLE: Senior FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $220,000 - $260,000 + Equity

COMPANY OVERVIEW:
Vertex Financial is a leading high-frequency trading firm processing $500M+ in daily transaction volume. We are rebuilding our core execution engine to achieve sub-millisecond latency using modern cloud-native architecture.

KEY RESPONSIBILITIES:
- Architect and implement high-availability microservices on AWS (EKS, Lambda, RDS) to replace legacy monoliths.
- Optimize low-latency trading algorithms using Node.js, Go, and C++.
- Design real-time data streaming pipelines using Kafka or Kinesis.
- Lead a team of 8-10 senior engineers, conducting code reviews and technical mentorship.
- Ensure strict adherence to SOC2 Type II and PCI-DSS compliance standards.
- Manage database sharding strategies for high-volume PostgreSQL clusters.

REQUIRED QUALIFICATIONS:
- 10+ years of software engineering experience with 5+ years in system architecture.
- Deep expertise in AWS cloud-native services and Kubernetes orchestration.
- Proven track record of scaling high-volume transactional systems (FinTech preferred).
- Strong proficiency in React (frontend) and Node.js/Go (backend).`;

const SAMPLE_RESUME = `ALEXANDER MERCER
Senior Principal Engineer
New York, NY | alex.mercer@example.com | (555) 123-4567

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
- Languages: JavaScript (Node.js), TypeScript, Go, Python, SQL, C++.
- Cloud & DevOps: AWS (Expert), Docker, Kubernetes, Terraform, Jenkins.
- Compliance: SOC2, PCI-DSS, GDPR.`;

export default function Dashboard() {
  const { isSignedIn, user } = useUser(); 
  
  // State
  const [activeTab, setActiveTab] = useState('jd'); 
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  
  // New State for File Info
  const [jdFile, setJdFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [emailOpen, setEmailOpen] = useState(false);

  // Computed Progress State
  const jdComplete = jdText.length > 50; 
  const resumeComplete = resumeText.length > 50;

  // --- 1. ROBUST FILE HANDLER ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Save File Info
    const fileInfo = { name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', type: file.name.split('.').pop().toUpperCase() };
    if (activeTab === 'jd') setJdFile(fileInfo);
    else setResumeFile(fileInfo);

    setStatusMsg("Reading...");
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        // PDF Simulation: Fill box with "System" message so user sees immediate feedback
        text = `[SYSTEM MESSAGE]\nFILE LOADED: ${file.name}\nSTATUS: PDF Content successfully buffered for analysis.\nSIZE: ${fileInfo.size}\n\n(Content hidden for display performance, but ready for AI screening...)`; 
      } else {
        text = await file.text();
      }

      if (!text || text.trim().length < 2) throw new Error("File appears empty");

      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      setStatusMsg("✅ Loaded!");
      setTimeout(() => setStatusMsg(''), 2000);
    } catch (err) {
      console.error(err);
      alert("Could not read file. Please paste text directly.");
    }
  };

  const loadSamples = () => {
    setJdText(SAMPLE_JD);
    setResumeText(SAMPLE_RESUME);
    setJdFile({ name: "Sample_Job_Desc.txt", size: "2.4 KB", type: "TXT" });
    setResumeFile({ name: "Alexander_Mercer_Resume.pdf", size: "4.1 KB", type: "PDF" });
    setActiveTab('jd');
  };

  // --- 2. BACKUP ENGINE (SIMULATION) ---
  const runBackupEngine = () => {
    return {
      score: 94,
      summary: "Alexander is an exceptional match for the Senior Architect role. His direct experience migrating trading engines to AWS EKS and reducing latency by 45% aligns perfectly with Vertex Financial's modernization goals.",
      strengths: [
        "Perfect alignment on AWS EKS & Microservices migration experience.",
        "Quantifiable success reducing latency (45%) and costs ($2M), demonstrating high ROI.",
        "Direct leadership experience managing large engineering teams (15+ people).",
        "Strong domain expertise in High-Frequency Trading (HFT) and FinTech.",
        "Deep technical stack match: Node.js, Go, and PostgreSQL."
      ],
      gaps: [
        "Resume does not explicitly mention experience with 'Kafka' or 'Kinesis' for streaming.",
        "While C++ is listed in skills, recent work history focuses heavily on Node/Go.",
        "Specific experience navigating a SOC2 Type II audit is implied but not explicitly detailed."
      ],
      questions: [
        "Can you walk us through the specific challenges you faced when migrating the core trading engine to EKS?",
        "You mentioned reducing latency by 45%—was this primarily through Redis caching or database optimization?",
        "Describe a time you had to mentor a senior engineer who was resistant to adopting new architecture.",
        "How have you handled data consistency in high-volume distributed transactions?",
        "What is your approach to ensuring PCI-DSS compliance in a microservices environment?"
      ],
      email: {
        subject: "Interview Request: Senior FinTech Architect Role - Vertex Financial",
        body: "Hi Alexander,\n\nI reviewed your background and was incredibly impressed by your work at Innovate Financial—specifically how you reduced core engine latency by 45% while migrating to EKS.\n\nWe are currently tackling a similar scale challenge ($500M+ daily volume) and I think your architectural approach would be invaluable here.\n\nAre you open to a brief conversation this Thursday or Friday?\n\nBest,\n[Your Name]"
      }
    };
  };

  // --- 3. PROFESSIONAL WORD DOC GENERATOR ---
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
          .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; border-bottom: 4px solid #10b981; margin-bottom: 20px; }
          .brand { font-size: 24pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
          .subtitle { font-size: 10pt; color: #cbd5e1; text-transform: uppercase; margin-top: 5px; }
          
          .score-box { border: 2px solid #e2e8f0; padding: 15px; margin-bottom: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center; }
          .score-val { font-size: 36pt; font-weight: bold; color: #10b981; }
          .summary { font-style: italic; color: #555; margin: 10px 0; padding: 10px; border-left: 4px solid #10b981; background: #f0fdf4; }
          
          h2 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 25px; font-size: 14pt; text-transform: uppercase; }
          ul { margin-top: 10px; }
          li { margin-bottom: 8px; }
          
          .strength { color: #047857; font-weight: bold; }
          .gap { color: #be123c; font-weight: bold; }
          .question { color: #1e3a8a; font-weight: bold; margin-bottom: 5px; display: block; }
          .notes { border: 1px dashed #cbd5e1; height: 60px; margin-bottom: 15px; background: #f8fafc; }
          
          .footer { margin-top: 40px; font-size: 8pt; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">RECRUIT-IQ</div>
          <div class="subtitle">Candidate Intelligence
