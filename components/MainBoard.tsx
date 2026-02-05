const handleAnalyze = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: yourPromptVariable }), 
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // This is the key fix: it checks for .analysis, then .text, then .result
    const finalResult = data.analysis || data.text || data.result;
    
    if (finalResult) {
      setAnalysis(finalResult);
    } else {
      console.error("API returned empty data:", data);
      setAnalysis("Error: Received empty response from AI.");
    }

  } catch (err) {
    console.error("Analysis failed:", err);
    setAnalysis("Failed to connect to AI. Please check your connection.");
  } finally {
    setLoading(false);
  }
};
