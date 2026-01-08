import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useUser, RedirectToSignIn } from "@clerk/clerk-react";

// ACCESSING THE VAULT: 
// Make sure your key in Vercel is named VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(apiKey || "");

const RecruitIQ = () => {
  const { isSignedIn, user } = useUser();
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  // PROTECT THE ROUTE: Only signed-in users can see the app
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  const handleAiAnalysis = async () => {
    // PREVENT EMPTY SUBMISSIONS
    if (!resumeText) {
      alert("Please paste a resume first.");
      return;
    }

    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analyze this candidate for a small business role: ${resumeText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAnalysis(response.text());
    } catch (error) {
      console.error("Live AI Error:", error);
      setAnalysis("Analysis failed. Verify your VITE_GEMINI_API_KEY is restricted to this domain in Google Cloud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ color: '#6366f1' }}>Recruit-IQ</h1>
        <p>Welcome, {user.firstName}! Ready to analyze your next hire?</p>
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
          {loading ? "Analyzing..." : "Analyze with Staff-IQ Engine"}
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

const styles = {
  container: { fontFamily: 'Inter, sans-serif', padding: '40px', maxWidth: '800px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '40px' },
  main: { display: 'flex', flexDirection: 'column', gap: '20px' },
  textarea: { height: '200px', padding: '15px', borderRadius: '12px', border: '1px solid #cbd5e1' },
  button: { padding: '15px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' },
  buttonDisabled: { padding: '15px', backgroundColor: '#94a3b8', color: 'white', borderRadius: '12px', cursor: 'not-allowed' },
  results: { marginTop: '30px', padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '12px', borderLeft: '6px solid #6366f1' },
  text: { whiteSpace: 'pre-wrap', lineHeight: '1.6' }
};

export default RecruitIQ;
