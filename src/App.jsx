import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize Gemini using the key from your Vercel/Hosting Vault
// Note: If using Vite, use import.meta.env.VITE_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const RecruitIQ = () => {
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  
  // MOCK USER STATE: In a real app, this comes from your Auth (Firebase/Supabase)
  const [isSubscribed, setIsSubscribed] = useState(false); 

  const handleAiAnalysis = async () => {
    // --- STEP 2: THE BILLING GATE ---
    if (!isSubscribed) {
      alert("Recruit-IQ Pro Required: Redirecting to secure payment...");
      // Replace with your actual Stripe Payment Link from your Stripe Dashboard
      window.location.href = "https://buy.stripe.com/your_payment_link_here";
      return;
    }

    // --- STEP 1: THE AI LOGIC ---
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analyze this candidate for a small business role. 
                      Identify strengths, red flags, and cultural fit: ${resumeText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAnalysis(response.text());
    } catch (error) {
      console.error("AI Error:", error);
      setAnalysis("Error: Make sure your API key is set in your Dashboard Settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Recruit-IQ</h1>
        <p>Intelligent Hiring for Small Business</p>
      </header>

      <main style={styles.main}>
        <textarea
          style={styles.textarea}
          placeholder="Paste Resume text here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />

        <button 
          style={loading ? styles.buttonDisabled : styles.button} 
          onClick={handleAiAnalysis}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Candidate (Pro)"}
        </button>

        {analysis && (
          <div style={styles.results}>
            <h3>AI Analysis Results:</h3>
            <p style={styles.text}>{analysis}</p>
          </div>
        )}
      </main>
    </div>
  );
};

// Simple Styles so you don't need a separate CSS file
const styles = {
  container: { fontFamily: 'sans-serif', padding: '40px', maxWidth: '800px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '40px', color: '#1e293b' },
  main: { display: 'flex', flexDirection: 'column', gap: '20px' },
  textarea: { height: '200px', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px' },
  button: { padding: '15px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' },
  buttonDisabled: { padding: '15px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'not-allowed' },
  results: { marginTop: '30px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '5px solid #6366f1' },
  text: { whiteSpace: 'pre-wrap', lineHeight: '1.6' }
};

export default RecruitIQ;
