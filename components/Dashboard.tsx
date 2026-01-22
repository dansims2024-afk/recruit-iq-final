"use client";

import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
// --- ADDED SignUpButton HERE ---
import { useUser, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { jsPDF } from "jspdf";
import { 
  Loader2, Download, Zap, Shield, HelpCircle, Sparkles, 
  Star, Check, Info, Target, Upload, Mail, Copy, ArrowRight, FileText, LogOut 
} from "lucide-react";

// --- YOUR REAL STRIPE LINK ---
const STRIPE_URL = "https://buy.stripe.com/bJe5kCfwWdYK0sbbmZcs803";

const SAMPLE_JD = `JOB TITLE: Senior Principal FinTech Architect
LOCATION: New York, NY (Hybrid)
SALARY: $240,000 - $285,000 + Performance Bonus + Equity

ABOUT THE COMPANY:
Vertex Financial Systems is a global leader in high-frequency trading technology. We are seeking a visionary Architect to lead the evolution of our next-generation platform.

KEY RESPONSIBILITIES:
- Design and implement high-availability microservices using AWS EKS and Fargate.
- Lead the migration from legacy monolithic structures to modern gRPC architecture.
- Optimize C++ and Go-based trading engines for sub-millisecond latency.`;

const SAMPLE_RESUME = `MARCUS VANDELAY
Principal Software Architect | New York, NY | m.vandelay@email.com

EXECUTIVE SUMMARY:
Strategic Technical Leader with 14 years of experience building mission-critical financial infrastructure. Expert in AWS cloud-native transformations and low-latency system design. Managed teams of 20+ engineers.`;

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('jd');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '' });

  const isPro = isSignedIn && user?.publicMetadata?.isPro === true;
  
  const getStripeUrl = () => {
    if (!user?.id) return STRIPE_URL;
    const url = new URL(STRIPE_URL);
    url.searchParams.set("client_reference_id", user.id);
    if (user?.primaryEmailAddress?.emailAddress) {
        url.searchParams.set("prefilled_email", user.primaryEmailAddress.emailAddress);
    }
    return url.toString();
  };

  // REDIRECT LOGIC: Watches for the "signup" signal
  useEffect(() => {
    if (isLoaded && isSignedIn && !isPro) {
        // If they just signed up, send them to Stripe
        if (window.location.search.includes('signup=true') || sessionStorage.getItem('pending_stripe') === 'true') {
            sessionStorage.removeItem('pending_stripe');
            window.location.href = getStripeUrl();
        }
    }
  }, [isLoaded, isSignedIn, isPro]);

  useEffect(() => {
    setScanCount(parseInt(localStorage.getItem('recruit_iq_scans') || '0'));
  }, []);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const copyEmail = () => {
    if (analysis?.outreach_email) {
      navigator.clipboard.writeText(analysis.outreach_email);
      showToast("Elite Outreach Email Copied!");
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(`RECRUIT-IQ ELITE REPORT: ${analysis.candidate_name}`, 10, 20);
    doc.setFontSize(12);
    doc.text(`Match Score: ${analysis.score}%`, 10, 30);
    doc.text("Strengths:", 10, 50);
    analysis.strengths.forEach((s: string, i: number) => doc.text(`• ${s}`, 15, 60 + (i * 10)));
    doc.save(`RecruitIQ_${analysis.candidate_name}.pdf`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading
