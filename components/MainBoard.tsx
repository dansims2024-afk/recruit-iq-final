const handleAnalyze = async () => {
  setLoading(true);
  // Clear the "Results will appear here..." message immediately
  setAnalysis("AI is thinking..."); 
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: "Please analyze the uploaded document and provide a detailed report." 
      }),
    });

    const data = await response.json();

    if (data.error) {
      setAnalysis(`Error from AI: ${data.error}`);
      return;
    }

    // This checks every possible field the API might have sent
    const finalResult = data.analysis || data.text || data.result;
    
    if (finalResult) {
      setAnalysis(finalResult);
    } else {
      setAnalysis("The AI responded, but no text was found in the data.");
    }

  } catch (err) {
    console.error("Fetch error:", err);
    setAnalysis("Failed to connect to the server. Please try again.");
  } finally {
    setLoading(false);
  }
};
