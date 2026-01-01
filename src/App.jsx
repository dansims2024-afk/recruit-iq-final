import React, { useState } from 'react';

const IntelligenceApp = () => {
  const [fileName, setFileName] = useState("");

  const data = {
    intel: {
      salary: "$160,000 - $195,000",
      demand: "Aggressive",
      competitors: ["Salesforce", "HubSpot", "Zendesk"]
    },
    analysis: [
      { type: "Strength", area: "Efficiency", metric: "Automated 40% of manual reporting, saving 15 hrs/week.", score: "94%" },
      { type: "Strength", area: "Revenue", metric: "Attributed to $3.1M in expansion revenue in FY25.", score: "88%" },
      { type: "Gap", area: "Global Ops", metric: "Limited to US/EMEA; lacks experience in APAC scaling.", score: "42%" },
      { type: "Gap", area: "Security", metric: "No direct experience with HIPAA compliance protocols.", score: "30%" }
    ]
  };

  const downloadDoc = () => {
    const text = `INTELLIGENCE REPORT\n\nMARKET INTEL:\nSalary: ${data.intel.salary}\n\nSTRENGTHS/GAPS:\n` + 
                 data.analysis.map(a => `${a.type}: ${a.area} - ${a.metric}`).join("\n");
    const blob = new Blob([text], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "Intelligence_Report.doc";
    link.click();
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Dashboard Intelligence</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <label style={{ cursor: 'pointer', backgroundColor: '#2563eb', color: '#fff', padding: '10px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
            Upload File {fileName && `(${fileName})`}
            <input type="file" style={{ display: 'none' }} onChange={(e) => setFileName(e.target.files[0].name)} />
          </label>
          <button onClick={downloadDoc} style={{ cursor: 'pointer', backgroundColor: '#1e293b', color: '#fff', padding: '10px 18px', border: 'none', borderRadius: '8px', fontSize: '14px' }}>
            Download Word Doc
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* MARKET INTELLIGENCE */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '16px', color: '#2563eb', marginBottom: '15px' }}>Market Intelligence</h2>
          <div style={{ fontSize: '14px', lineHeight: '2' }}>
            <div>Benchmark: <strong>{data.intel.salary}</strong></div>
            <div>Demand: <span style={{ color: '#059669', fontWeight: 'bold' }}>{data.intel.demand}</span></div>
            <div style={{ marginTop: '10px', color: '#64748b' }}>Active Competitors: {data.intel.competitors.join(', ')}</div>
          </div>
        </div>

        {/* EMAIL OUTREACH */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '16px', color: '#7c3aed', marginBottom: '15px' }}>Email Outreach</h2>
          <div style={{ backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '8px', fontSize: '13px', fontStyle: 'italic', color: '#334155' }}>
            "I saw you achieved a <strong>40% automation rate</strong>. We are looking for that specific quantifiable impact to lead our next phase..."
          </div>
        </div>

        {/* STRENGTHS AND GAPS (QUANTIFIABLE) */}
        <div style={{ gridColumn: '1 / -1', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '15px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>
            Strengths & Gaps (Detailed Metrics)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '15px 20px' }}>Type</th>
                <th style={{ padding: '15px 20px' }}>Quantifiable Detail</th>
                <th style={{ padding: '15px 20px' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {data.analysis.map((row, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px 20px', fontWeight: 'bold', color: row.type === 'Strength' ? '#059669' : '#dc2626' }}>{row.type}</td>
                  <td style={{ padding: '15px 20px', color: '#334155' }}>{row.metric}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <span style={{ backgroundColor: row.type === 'Strength' ? '#dcfce7' : '#fee2e2', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                      {row.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* INTERVIEW QUESTIONS */}
        <div style={{ gridColumn: '1 / -1', backgroundColor: '#1e293b', color: '#fff', padding: '25px', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Targeted Interview Questions</h2>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8', color: '#cbd5e1' }}>
            <li>"Walk me through the technical stack you used to achieve the 40% automation metric."</li>
            <li>"Given your lack of APAC experience, how would you approach cultural localization for our Tokyo team?"</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default IntelligenceApp;
