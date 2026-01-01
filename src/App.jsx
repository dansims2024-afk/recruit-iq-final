import React, { useState } from 'react';
// Make sure to npm install lucide-react first!
import { Download, Upload, Mail, TrendingUp, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';

const IntelligenceApp = () => {
  const [fileName, setFileName] = useState(null);

  // Feature: Quantifiable Strengths & Gaps
  const reportData = {
    strengths: [
      { area: "Revenue Growth", metric: "32% increase in YoY ARR ($1.2M)", impact: "High" },
      { area: "Retention", metric: "98% client retention rate over 24 months", impact: "High" }
    ],
    gaps: [
      { area: "Market Share", metric: "Currently holds <2% of APAC region", impact: "Medium" },
      { area: "Tech Debt", metric: "Legacy system causes 4.5s latency in checkout", impact: "High" }
    ]
  };

  // Feature: Download to Word (Mock functionality)
  const handleDownload = () => {
    const header = "MARKET INTELLIGENCE & GAP ANALYSIS\n" + "=".repeat(30) + "\n\n";
    const body = reportData.strengths.map(s => `[STRENGTH] ${s.area}: ${s.metric}`).join("\n");
    const blob = new Blob([header + body], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "Market_Intelligence_Report.doc";
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header & Upload/Download Controls */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">Intelligence Dashboard</h1>
          <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition">
            <Upload size={18} />
            <span>{fileName ? fileName : "Upload Data"}</span>
            <input type="file" className="hidden" onChange={(e) => setFileName(e.target.files[0].name)} />
          </label>
        </div>
        <button onClick={handleDownload} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition">
          <Download size={18} /> Download Word Doc
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Market Intelligence Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold">
            <TrendingUp size={20} />
            <h2>Market Intelligence</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Competitor volatility index: <strong>4.2 (Stable)</strong></p>
            <p>• Emerging Tech Trend: <strong>Generative UI (+115% YoY)</strong></p>
            <p>• Key Player Activity: <strong>Meta hiring 400+ specialists in your niche.</strong></p>
          </div>
        </div>

        {/* Email Outreach Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-purple-600 font-bold">
            <Mail size={20} />
            <h2>Email Outreach</h2>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-sm text-purple-800 italic border border-purple-100">
            "I noticed your team achieved <strong>32% growth</strong> recently. We've identified a <strong>4.5s latency gap</strong> in your checkout that, if fixed, could boost that by another 10%..."
          </div>
        </div>

        {/* Detailed Strengths & Gaps Table */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-700">Detailed Analysis (Quantifiable)</h2>
          </div>
          <table className="w-full text-left">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
              <tr>
                <th className="p-4">Category</th>
                <th className="p-4">Evidence & Metric</th>
                <th className="p-4">Priority</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {reportData.strengths.map((s, i) => (
                <tr key={i} className="hover:bg-green-50/30 transition">
                  <td className="p-4 flex items-center gap-2 text-green-700 font-medium"><CheckCircle size={14}/> {s.area}</td>
                  <td className="p-4 text-gray-600">{s.metric}</td>
                  <td className="p-4"><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">{s.impact}</span></td>
                </tr>
              ))}
              {reportData.gaps.map((g, i) => (
                <tr key={i} className="hover:bg-red-50/30 transition">
                  <td className="p-4 flex items-center gap-2 text-red-700 font-medium"><AlertTriangle size={14}/> {g.area}</td>
                  <td className="p-4 text-gray-600">{g.metric}</td>
                  <td className="p-4"><span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">{g.impact}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Interview Questions Section */}
        <div className="md:col-span-2 bg-indigo-900 text-white p-6 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={20} className="text-indigo-300" />
            <h2 className="font-bold">Targeted Interview Questions</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-sm space-y-2">
              <p className="font-bold text-indigo-200">1. Scaling Strategy:</p>
              <p className="italic">"How would you address the 4.5s latency issue while maintaining your 98% retention rate?"</p>
            </div>
            <div className="text-sm space-y-2">
              <p className="font-bold text-indigo-200">2. Market Expansion:</p>
              <p className="italic">"What is your 90-day roadmap for moving the APAC market share above 2%?"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceApp;
