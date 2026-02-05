"use client";

import React, { useState } from 'react';

// Define the component
const MainBoard = () => {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis("AI is thinking...");
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: "Analyze this resume" }),
      });
      const data = await response.json();
      setAnalysis(data.analysis || data.text || "No results found.");
    } catch (err) {
      setAnalysis("Error connecting to AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Recruit-IQ Dashboard</h1>
      <button 
        onClick={handleAnalyze}
        className="bg-blue-600 px-4 py-2 rounded mb-6"
        disabled={loading}
      >
        {loading ? "Processing..." : "Execute Analysis"}
      </button>
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Analysis Results</h2>
        <div className="whitespace-pre-wrap text-gray-300">
          {analysis || "Results will appear here..."}
        </div>
      </div>
    </div>
  );
};

// EXPORT DEFAULT IS MANDATORY FOR THE DYNAMIC IMPORT TO WORK
export default MainBoard;
