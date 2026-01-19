"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { useUser, useClerk, SignInButton, UserButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";

// FIXED PATH: Ensure you put your logo.png inside the 'public' folder of your project!
const logo = "/logo.png"; 

const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

// --- FULL EXTENDED SAMPLES ---
const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

ABOUT THE COMPANY:
Vertex Financial Systems is a global leader in high-frequency trading technology. We are seeking a visionary Architect to lead the evolution of our next-generation platform.

KEY RESPONSIBILITIES:
- Design and implement high-availability microservices using AWS EKS and Fargate to ensure 99.999% uptime.
- Lead the migration from legacy monolithic structures to a modern, event-driven architecture using Kafka and gRPC.
- Optimize C++ and Go-based trading engines for sub-millisecond latency.
- Establish CI/CD best practices and mentor a global team of 15+ senior engineers.
- Collaborate with quantitative researchers to implement complex trading algorithms.
- Ensure strict compliance with financial regulations and data security standards (SOC2, ISO 27001).

REQUIREMENTS:
- 12+ years of software engineering experience in FinTech or Capital Markets.
- Deep expertise in AWS Cloud Architecture (AWS Certified Solutions Architect preferred).
- Proven track record with Kubernetes, Docker, Kafka, Redis, and Terraform.
- Strong proficiency in Go (Golang), C++, Python, and TypeScript.
- Experience designing low-latency, high-throughput systems.
- Bachelor’s or Master’s degree in Computer Science or related field.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com | (555) 123-4567

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers and successfully delivered multi-million dollar platform overhauls.

PROFESSIONAL EXPERIENCE:
Global Quant Solutions | Principal Architect | New York, NY | 2018 - Present
- Architected a serverless data processing pipeline handling 5TB of daily market data using AWS Lambda and Kinesis.
- Reduced infrastructure costs by 35% through aggressive AWS Graviton migration and spot instance orchestration.
- Led a team of 15 engineers in re-writing the core risk engine, improving calculation speed by 400%.
- Implemented a zero-trust security model across the entire engineering organization.

InnovaTrade | Senior Staff Engineer | Chicago, IL | 2014 - 2018
- Built the core execution engine in Go, achieving a 50% reduction in order latency (sub-50 microseconds).
- Implemented automated failover protocols that prevented over $10M in potential slippage during market volatility.
- Mentored junior developers and established the company's first formal code review process.

TECHNICAL SKILLS:
- Languages: Go, C++, Python, TypeScript, Java, Rust.
- Cloud: AWS (EKS, Lambda, Aurora, SQS, DynamoDB), Terraform, Docker, Kubernetes.
- Architecture: Microservices, Event-Driven Design, Serverless, CQRS.
- Tools: GitLab CI, Prometheus, Grafana, Splunk, Jira.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const clerk = useClerk();
  
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  const jdReady = jdText.trim().length > 50;
  const resumeReady = resumeText.trim().length > 50;
  
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const finalStripeUrl = userEmail 
    ? `${STRIPE_URL}?prefilled_email=${encodeURIComponent(userEmail)}` 
    : STRIPE_URL;

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('recruit_iq_scans') || '0');
    setScanCount(savedCount);
  }, []);

  const showToast = (message: string, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSupportSubmit = (e: any) => {
    e.preventDefault();
    window.location.href = `mailto:hello@corecreativityai.com?subject=Support&body=${encodeURIComponent(supportMessage)}`;
    setShowSupportModal(false);
    setSupportMessage('');
    showToast("Email client opened!", "info");
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let text = "";
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else if (file.name.endsWith('.pdf')) {
        // NOTE: This assumes pdfjsLib is available globally or imported. 
        // For Next.js/React standard, we fallback to text for now to prevent crash if lib is missing.
        try {
            // @ts-ignore
            if (window.pdfjsLib) {
                // @ts-ignore
                const pdfjs = window.pdfjsLib;
                const loadingTask = pdfjs.getDocument(URL.createObjectURL(file));
                const pdf = await loadingTask.promise;
                let fullText = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                  const page = await pdf.getPage(i);
                  const textContent = await page.getTextContent();
                  // @ts-ignore
                  fullText += textContent.items.map(item => item.str).join(' ') + "\n";
                }
                text = fullText;
            } else {
                showToast("PDF Reader not loaded. Copy/Paste text for now.", "error");
                return;
            }
        } catch (e) {
            console.error(e);
            showToast("PDF Read Error. Try pasting text.", "error");
            return;
        }
      } else { text = await file.text(); }
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      show
