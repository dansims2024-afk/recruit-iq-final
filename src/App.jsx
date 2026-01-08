import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

/** * VITE REQUIREMENT: 
 * Environment variables must be prefixed with VITE_ to be exposed to your code.
 * Ensure your variable in Vercel/Hosting is named: VITE_GEMINI_API_KEY
 */
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(apiKey || "");

const RecruitIQ = () => {
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  
  // MOCK USER STATE: In a real app, this status should be fetched from your database
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
    if (!resumeText) {
      alert("Please paste a resume first.");
      return;
    }

    setLoading(true);
    try {
      // Using gemini-1.5-flash for faster small business analysis
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analyze this candidate for a small business role. 
                      Identify key technical strengths, potential red flags, 
                      and cultural fit based on this text: ${resumeText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAnalysis(response.text());
    } catch (error) {
      console.error("AI Error:", error);
      setAnalysis("Error: Analysis failed. Please check if VITE_GEMINI_API_KEY is correctly set in your Dashboard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ color: '#6366f1' }}>Recruit-IQ</h1>
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
          {loading ? "Analyzing Candidate..." : "Analyze with AI (Pro)"}
        </button>

        {analysis && (
          <div style={styles.results}>
            <h3 style={{ marginTop: 0 }}>AI Analysis Results:</h3>
            <p style={styles.text}>{analysis}</p>
          </div>
        )}
      </main>
    </div>
  );
};

// Inline CSS for clean, scannable UI
const styles = {
  container: { fontFamily: 'Inter, sans-serif', padding: '40px', maxWidth: '800px', margin: '0 auto', color: '#334155' },
  header: { textAlign: 'center', marginBottom: '40px' },
  main: { display: 'flex', flexDirection: 'column', gap: '20px' },
  textarea: { height: '200px', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' },
  button: { padding: '15px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', transition: '0.2s' },
  buttonDisabled: { padding: '15px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '12px', cursor: 'not-allowed' },
  results: { marginTop: '30px', padding: '24px', backgroundColor: '#f1f5f9', borderRadius: '12px', borderLeft: '6px solid #6366f1' },
  text: { whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '15px' }
};

export default RecruitIQ;
