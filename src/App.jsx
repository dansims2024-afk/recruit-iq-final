import React, { useState } from 'react';

const DashboardIntelligence = () => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [isUploading, setIsUploading] = useState(false);

  // Core Data Structure
  const marketIntel = {
    benchmark: "$165,000 - $210,000",
    demand: "Critical / High",
    competitors: ["Microsoft", "Google", "Amazon Web Services"],
    trends: ["AI-Driven Automation", "Zero-Trust Architecture"]
  };

  const analysisData = [
    { type: 'Strength', category: 'Operational Growth', detail: 'Increased team output by 35% through Agile restructuring.', score: 96 },
    { type: 'Strength', category: 'Revenue Impact', detail: 'Closed $4.2M in new enterprise contracts within Q3-Q4.', score: 92 },
    { type: 'Gap', category: 'Compliance', detail: 'No previous experience with FedRAMP or high-level gov security.', score: 38 },
    { type: 'Gap', category: 'Technical Scaling', detail: 'Lacks experience managing databases exceeding 1PB of data.', score: 25 },
  ];

  // Feature: Download to Word
  const handleDownload = () => {
    const content = `INTELLIGENCE REPORT\n\nMARKET INTEL:\nSalary: ${marketIntel.benchmark}\n\nANALYSIS:\n` + 
                    analysisData.map(d => `${d.type}: ${d.category} - ${d.detail}`).join('\n');
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "Assessment_Report.doc";
    link.click();
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Navigation Bar */}
      <header style={{ backgroundColor: '#1e293b', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Intelligence Engine v3</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <label style={{ backgroundColor: '#2563eb', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
            <input type="file" style={{ display: 'none' }} onChange={() => setIsUploading(true)} />
            {isUploading ? 'File Uploaded' : 'Upload Button'}
          </label>
          <button onClick={handleDownload} style={{ backgroundColor: '#475569', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
            Download Word Doc
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Feature: Market Intelligence */}
          <section style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
            <h2 style={{ color: '#2563eb', fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               Market Intelligence
            </h2>
            <div style={{ fontSize: '0.9rem', color: '#374151' }}>
              <p><strong>Salary Benchmark:</strong> {marketIntel.benchmark}</p>
              <p><strong>Demand Level:</strong> <span style={{ color: '#059669', fontWeight: 'bold' }}>{marketIntel.demand}</span></p>
              <p style={{ marginTop: '0.5rem' }}><strong>Target Competitors:</strong> {marketIntel.competitors.join(', ')}</p>
            </div>
          </section>

          {/* Feature: Email Outreach */}
          <section style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
            <h2 style={{ color: '#7c3aed', fontSize: '1rem', marginBottom: '1rem' }}>Email Outreach</h2>
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #7c3aed', fontSize: '0.875rem', fontStyle: 'italic', color: '#4b5563' }}>
              "I noticed your track record in <strong>{analysisData[0].category}</strong>, specifically your ability to <strong>{analysisData[0].detail}</strong>. We're looking for that level of quantifiable impact..."
            </div>
          </section>
        </div>

        {/* Feature: Strengths & Gaps (Detailed Table) */}
        <section style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>Detailed Strengths & Gaps (Quantifiable)</span>
            <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>Showing 4 Data Points</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Type</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Quantifiable Evidence</th>
                <th style={{ padding: '1rem' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.map((row, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: row.type === 'Strength' ? '#059669' : '#dc2626' }}>{row.type}</td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{row.category}</td>
                  <td style={{ padding: '1rem', color: '#4b5563' }}>{row.detail}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '999px', height: '8px' }}>
                      <div style={{ width: `${row.score}%`, backgroundColor: row.type === 'Strength' ? '#10b981' : '#ef4444', height: '100%', borderRadius: '999px' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Feature: Interview Questions */}
        <section style={{ marginTop: '2rem', backgroundColor: '#111827', borderRadius: '12px', padding: '1.5rem', color: 'white' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: '#93c5fd' }}>Strategic Interview Questions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold' }}>Probe Strength</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', fontStyle: 'italic' }}>"You mentioned a 35% output increase. What specific friction points did you identify in the Agile process to reach that number?"</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 'bold' }}>Address Gap</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', fontStyle: 'italic' }}>"How would your scaling strategy change if you were suddenly tasked with managing a petabyte-scale environment?"</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardIntelligence;
