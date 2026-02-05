"use client";

import React, { useState } from 'react';
// ... other imports (lucide, etc.)

const MainBoard = () => {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(""); // Clear previous results
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: "Analyze this resume..." }), // Your actual prompt logic here
      });

      const data = await response.json();

      // This fix ensures that even if the API field name changes, we catch the data
      const resultText = data.analysis || data.text || data.result;
      
      if (resultText) {
        setAnalysis(resultText);
      } else {
        setAnalysis("The AI returned an empty response. Please try again.");
      }
    } catch (err) {
      setAnalysis("Error: Could not connect to the AI server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Your Dashboard UI Code */}
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Execute"}
      </button>
      
      {/* Result Display */}
      <div className="mt-4 p-4 bg-gray-800 text-white whitespace-pre-wrap">
        {analysis || "Results will appear here..."}
      </div>
    </div>
  );
};

// CRITICAL FIX: This line must exist for the dynamic import in page.tsx to work
export default MainBoard;
