import React, { useState } from 'react';
import { Download, Upload, Mail, BarChart2, AlertCircle, CheckCircle } from 'lucide-react';

const AppDashboard = () => {
  const [data, setData] = useState(null);
  const [outreach, setOutreach] = useState("");

  // Feature 1: Market Intelligence Data
  const marketIntel = {
    avgSalary: "$145,000",
    demandLevel: "High",
    competitorHiring: ["Google", "Meta", "Stripe"],
    skillTrend: "+24% demand for LLM integration"
  };

  // Feature 2: Strengths & Gaps (Detailed & Quantifiable)
  const analysis = {
    strengths: [
      { metric: "Project Delivery", detail: "Delivered 4 major releases 15% ahead of schedule.", score: 92 },
      { metric: "Team Growth", detail: "Scaled department from 5 to 25 headcount in 12 months.", score: 88 }
    ],
    gaps: [
      { metric: "Budget Management", detail: "Managed maximum budget of $50k; role requires $500k+.", score: 45 },
      { metric: "Tech Stack", detail: "Lacks 2+ years of required Rust experience.", score: 30 }
    ]
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {/* Header with Upload & Download */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Intelligence Dashboard</h1>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            <Upload size={18} /> Upload Candidate/Data
          </button>
          <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100">
            <Download size={18} /> Download Word Doc
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Market Intelligence Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <BarChart2 size={20} />
            <h2 className="font-semibold text-lg">Market Intelligence</h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Avg. Market Rate: <strong>{marketIntel.avgSalary}</strong></p>
            <p className="text-sm text-gray-600">Demand: <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{marketIntel.demandLevel}</span></p>
            <div className="text-sm text-gray-600">
              <p className="mb-1">Active Competitors:</p>
              <div className="flex gap-2 font-medium">{marketIntel.competitorHiring.join(", ")}</div>
            </div>
          </div>
        </div>

        {/* Email Outreach Generator */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-purple-600">
            <Mail size={20} />
            <h2 className="font-semibold text-lg">Email Outreach</h2>
          </div>
          <textarea 
            className="w-full h-24 p-2 border rounded-md text-sm mb-3"
            placeholder="AI will generate outreach here based on upload..."
            value={outreach}
            onChange={(e) => setOutreach(e.target.value)}
          />
          <button className="text-xs bg-purple-50 text-purple-600 font-bold py-1 px-3 rounded hover:bg-purple-100">
            Regenerate Template
          </button>
        </div>

        {/* Strengths & Gaps (Quantifiable) */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="font-semibold text-lg mb-4">Detailed Analysis (Quantifiable Metrics)</h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Evidence / Metric</th>
                <th className="p-3">Impact</th>
              </tr>
            </thead>
            <tbody>
              {analysis.strengths.map((s, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="p-3 font-medium text-green-700 flex items-center gap-2"><CheckCircle size={14}/> {s.metric}</td>
                  <td className="p-3 text-gray-600">{s.detail}</td>
                  <td className="p-3 font-bold">{s.score}%</td>
                </tr>
              ))}
              {analysis.gaps.map((g, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="p-3 font-medium text-red-700 flex items-center gap-2"><AlertCircle size={14}/> {g.metric}</td>
                  <td className="p-3 text-gray-600">{g.detail}</td>
                  <td className="p-3 font-bold">{g.score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Interview Questions Section */}
        <div className="md:col-span-2 bg-gray-800 text-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold text-lg mb-3">Targeted Interview Questions</h2>
          <ul className="list-disc ml-5 space-y-2 text-gray-300 text-sm">
            <li>"You mentioned scaling a team to 25; what was the biggest bottleneck in your hiring pipeline?"</li>
            <li>"Given your background in smaller budgets, how would you adjust your strategy for a $500k quarterly spend?"</li>
            <li>"Walk us through a time a release went off-schedule and how you mitigated the delay."</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AppDashboard;
