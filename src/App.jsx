import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useUser, RedirectToSignIn, UserButton } from "@clerk/clerk-react";
import { LayoutDashboard, Users, Briefcase, Settings, Menu, Sparkles, CheckCircle, XCircle } from 'lucide-react';

// --- CONFIGURATION ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export default function RecruitIQ() {
  const { isSignedIn, user } = useUser();
  const [activeTab, setActiveTab] = useState("pipeline"); // Default view
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // --- AI ENGINE ---
  const handleAiAnalysis = async () => {
    if (!resumeText) return alert("Please paste a resume first.");
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Act as an expert recruiter. Analyze this resume for a small business role. 
      Format the response with these headers: 
      1. 🎯 Match Score (0-100)
      2. ✅ Key Strengths
      3. 🚩 Potential Red Flags
      4. 💡 Interview Question to Ask
      
      Resume Text: ${resumeText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAnalysis(response.text());
    } catch (error) {
      console.error("AI Error:", error);
      setAnalysis("Error: Verify VITE_GEMINI_API_KEY is correct in Vercel.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  return (
    <div style={styles.appContainer}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}><Users color="white" size={24} /></div>
          <h2 style={styles.logoText}>Staff-IQ</h2>
        </div>

        <nav style={styles.nav}>
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Briefcase size={20} />} label="Active Jobs" active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} />
          <NavItem icon={<Sparkles size={20} />} label="AI Candidate Pipeline" active={activeTab === 'pipeline'} onClick={() => setActiveTab('pipeline')} />
          <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div style={styles.userProfile}>
          <UserButton />
          <span style={styles.userName}>{user.firstName}'s Team</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        {/* HEADER */}
        <header style={styles.header}>
          <h1 style={styles.pageTitle}>
            {activeTab === 'pipeline' ? 'Candidate Intelligence' : 'Dashboard'}
          </h1>
          <button style={styles.newJobBtn}>+ Post New Job</button>
        </header>

        {/* WORKSPACE */}
        <div style={styles.contentArea}>
          
          {/* VIEW: AI PIPELINE (The Working Engine) */}
          {activeTab === 'pipeline' && (
            <div style={styles.gridTwoColumn}>
              
              {/* INPUT CARD */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>📄 Resume Screener</h3>
                <textarea
                  style={styles.textarea}
                  placeholder="Paste candidate resume here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <button 
                  style={loading ? styles.buttonDisabled : styles.buttonPrimary} 
                  onClick={handleAiAnalysis}
                  disabled={loading}
                >
                  {loading ? <span style={styles.spin}>⏳ Analyzing...</span> : <span>✨ Analyze with Staff-IQ</span>}
                </button>
              </div>

              {/* RESULTS CARD */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>📊 AI Analysis Report</h3>
                {analysis ? (
                  <div style={styles.analysisBox}>
                    <pre style={styles.preWrap}>{analysis}</pre>
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    <p>Results will appear here...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PLACEHOLDER VIEWS */}
          {activeTab !== 'pipeline' && (
            <div style={styles.placeholder}>
              <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View</h3>
              <p>This module is under construction. Head to "AI Candidate Pipeline" to use the engine.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS & STYLES ---
const NavItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} style={{...styles.navItem, backgroundColor: active ? '#334155' : 'transparent', color: active ? '#fff' : '#94a3b8'}}>
    {icon}
    <span style={{marginLeft: '10px'}}>{label}</span>
  </div>
);

const styles = {
  appContainer: { display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', backgroundColor: '#f1f5f9' },
  sidebar: { width: '260px', backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px' },
  logoArea: { display: 'flex', alignItems: 'center', marginBottom: '40px', gap: '10px' },
  logoIcon: { backgroundColor: '#6366f1', padding: '8px', borderRadius: '8px', display: 'flex' },
  logoText: { fontSize: '20px', fontWeight: 'bold', margin: 0 },
  nav: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' },
  userProfile: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '20px', borderTop: '1px solid #334155' },
  userName: { fontSize: '14px', color: '#cbd5e1' },
  
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { height: '70px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' },
  pageTitle: { fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 },
  newJobBtn: { backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
  
  contentArea: { padding: '30px', overflowY: 'auto', height: '100%' },
  gridTwoColumn: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '1200px', margin: '0 auto' },
  card: { backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  cardTitle: { marginTop: 0, marginBottom: '20px', color: '#1e293b', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' },
  
  textarea: { width: '100%', height: '300px', padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '14px', lineHeight: '1.5', resize: 'none', outline: 'none', transition: '0.2s', fontFamily: 'monospace' },
  buttonPrimary: { width: '100%', marginTop: '16px', padding: '14px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' },
  buttonDisabled: { width: '100%', marginTop: '16px', padding: '14px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '10px', cursor: 'not-allowed' },
  
  analysisBox: { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '300px', overflowY: 'auto' },
  preWrap: { whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px', color: '#334155', lineHeight: '1.6' },
  emptyState: { height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontStyle: 'italic' },
  placeholder: { textAlign: 'center', marginTop: '100px', color: '#94a3b8' }
};
