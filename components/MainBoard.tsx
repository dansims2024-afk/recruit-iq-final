const handleAnalyze = async () => {
  setLoading(true);
  // This clears the "Results will appear here..." message immediately
  setAnalysis("AI is analyzing your request... please wait."); 
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: "Analyze the uploaded document and provide a detailed report." 
      }),
    });

    const data = await response.json();

    if (data.error) {
      setAnalysis(`Error: ${data.error}`);
      return;
    }

    // This checks every possible field the API might have sent
    const finalResult = data.analysis || data.text || data.result;
    
    if (finalResult) {
      setAnalysis(finalResult);
    } else {
      setAnalysis("The AI responded, but no analysis text was found.");
    }

  } catch (err) {
    console.error("Fetch error:", err);
    setAnalysis("Failed to connect to the server. Check your internet or API key.");
  } finally {
    setLoading(false);
  }
};
