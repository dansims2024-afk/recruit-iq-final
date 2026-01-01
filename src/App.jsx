import React, { useState } from 'react';
// Ensure you run: npm install lucide-react
import { Download, Upload, Mail, BarChart2, AlertCircle, CheckCircle, FileText } from 'lucide-react';

const AppDashboard = () => {
  const [isUploading, setIsUploading] = useState(false);

  // Mock Data for the requested features
  const marketIntel = {
    avgSalary: "$155,000",
    demandLevel: "Extreme",
    competitorHiring: ["OpenAI", "Anthropic", "Tesla"],
    skillTrend: "+40% growth in Agentic Workflows"
  };

  const analysis = {
    strengths: [
      { metric: "Revenue Impact", detail: "Generated $2.4M in new pipeline within 6 months.", score: 95 },
      { metric: "Efficiency", detail: "Reduced cloud infrastructure costs by 30% ($12k/mo).", score: 90 }
    ],
    gaps: [
      { metric: "Leadership Span", detail: "Experience limited to teams of <10; role requires 50+.", score: 50 },
      { metric: "Compliance", detail: "No direct experience with SOC2 or ISO 27001 audits.", score: 35 }
    ]
  };

  // Feature: Download Button Logic
  const handleDownload = () => {
    const content = `Report: Strengths and Gaps\n\nStrengths:\n- ${analysis.strengths[0].detail}\nGaps:\n- ${analysis.gaps[0].detail}`;
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "Assessment_Report.doc";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Top Navigation / Actions */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-heavy tracking-tight">Intelligence Engine v2</h1>
        <div className="flex gap-3">
          {/* Feature: Upload Button */}
          <label className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition">
            <Upload size={18} />
            <span>Upload Data</span>
            <input type="file" className="hidden" onChange={() => setIsUploading(true)} />
          </label>
          
          {/* Feature: Download Button */}
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition"
          >
            <Download size={18} /> Download Doc
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Feature: Market Intelligence */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold">
            <BarChart2 size={20} />
            <h2>Market Intelligence</h2>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Benchmark Salary</span>
              <span className="font-semibold">{marketIntel.avgSalary}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Market Demand</span>
              <span className="text-orange-600 font-bold">{marketIntel.demandLevel}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-2">Targeting Competitors:</span>
              <div className="flex gap-2">
                {marketIntel.competitorHiring.map(c => (
                  <span key={c} className="bg-slate-100 px-2 py-1 rounded text-xs">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature: Email Outreach */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <Mail size={20} />
              <h2>Email Outreach</h2>
            </div>
            <button className="text-xs text-indigo-600 hover:underline">Copy Template</button>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300 text-sm leading-relaxed text-slate-600">
            "Hi [Name], I saw your work on **{analysis.strengths[0].metric}** where you hit **{analysis.strengths[0].detail.split(' ')[1]}**. 
            Our team is currently looking for someone with exactly that quantifiable impact..."
          </div>
        </div>

        {/* Feature: Strengths & Gaps (Detailed/Quantifiable) */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold">Strengths & Gaps Analysis</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 font-medium border-b border-slate-100">
                <th className="p-4">Category</th>
                <th className="p-4">Quantifiable Metric / Evidence</th>
                <th className="p-4 text-center">Fit Score</th>
              </tr>
            </thead>
            <tbody>
              {analysis.strengths.map((s, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-emerald-50/30 transition">
                  <td className="p-4 font-semibold text-emerald-700 flex items-center gap-2"><CheckCircle size={16}/> {s.metric}</td>
                  <td className="p-4 text-slate-600">{s.detail}</td>
                  <td className="p-4 text-center"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">{s.score}%</span></td>
                </tr>
              ))}
              {analysis.gaps.map((g, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-red-50/30 transition">
                  <td className="p-4 font-semibold text-red-700 flex items-center gap-2"><AlertCircle size={16}/> {g.metric}</td>
                  <td className="p-4 text-slate-600">{g.detail}</td>
                  <td className="p-4 text-center"><span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">{g.score}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Feature: Interview Questions */}
        <div className="lg:col-span-3 bg-indigo-900 text-white p-6 rounded-xl shadow-lg shadow-indigo-200">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-indigo-300" />
            <h2 className="text-lg font-bold">Targeted Interview Guide</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-indigo-800/50 p-4 rounded-lg border border-indigo-700">
              <p className="text-xs uppercase tracking-wider text-indigo-300 mb-2 font-bold">Question 1</p>
              <p className="text-sm italic">"Your data shows a 30% reduction in cloud costs. What specific trade-offs did you make to achieve that without affecting uptime?"</p>
            </div>
            <div className="bg-indigo-800/50 p-4 rounded-lg border border-indigo-700">
              <p className="text-xs uppercase tracking-wider text-indigo-300 mb-2 font-bold">Question 2</p>
              <p className="text-sm italic">"Since you've primarily led teams of under 10, how would you approach the first 90 days of managing a 50-person department?"</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppDashboard;
