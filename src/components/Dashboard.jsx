import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [libsReady, setLibsReady] = useState(false);

  // Load mammoth.js from CDN dynamically to handle Word files
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
    script.onload = () => setLibsReady(true);
    document.head.appendChild(script);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !libsReady) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      
      if (file.name.endsWith('.docx')) {
        // Use the globally loaded mammoth library
        const result = await window.mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      } else {
        const text = new TextDecoder().decode(arrayBuffer);
        activeTab === 'jd' ? setJdText(text) : setResumeText(text);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  // ... rest of your UI
}
