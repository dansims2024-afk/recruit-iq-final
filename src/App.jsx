import React, { useState } from 'react';

function App() {
  // Simple state to handle the inputs (just visual for now)
  const [jd, setJd] = useState('');
  const [resume, setResume] = useState('');

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', // Brand Black/Dark Blue
      color: '#f8fafc',           // White text
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* 1. BRAND HEADER */}
      <header style={{ 
        padding: '20px 40px', 
        borderBottom: '1px solid #1e293b', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#60a5fa' }}>
          Recruit-IQ
        </div>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          Welcome, Dan
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* Quick Start Instructions */}
        <section style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Candidate Analysis</h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            <strong>Quick Start:</strong> Paste the Job Description on the left and the Candidate's Resume on the right. 
            Click "Analyze" to see the match score.
          </p>
        </section>

        {/* 3. INPUT SECTION (The Core Tool) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* Left Side: Job Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontWeight: 'bold', color: '#60a5fa' }}>JOB DESCRIPTION</label>
            <textarea 
              placeholder="Paste the Job Description here..." 
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              style={{
                width: '100%',
                height: '300px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: 'white',
                padding: '15px',
                fontSize: '0.9rem',
                resize: 'none',
                outline: 'none'
              }}
            />
          </div>

          {/* Right Side: Resume */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontWeight: 'bold', color: '#60a5fa' }}>RESUME</label>
            <textarea 
              placeholder="Paste the Candidate Resume here..." 
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              style={{
                width: '100%',
                height: '300px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: 'white',
                padding: '15px',
                fontSize: '0.9rem',
                resize: 'none',
                outline: 'none'
              }}
            />
          </div>

        </div>

        {/* 4. ACTION BUTTON */}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
          <button style={{
            padding: '15px 40px',
            backgroundColor: '#3b82f6', // Brand Blue
            color: 'white',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}>
            Analyze Candidate
          </button>
        </div>

      </main>
    </div>
  );
}

export default App;
