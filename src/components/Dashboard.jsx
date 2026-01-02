import mammoth from 'mammoth'; // This fixes the garbled text

// Inside your handleFileUpload function:
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      let extractedText = "";
      if (file.name.endsWith('.docx')) {
        // Correctly parse Word files
        const result = await mammoth.extractRawText({ arrayBuffer: event.target.result });
        extractedText = result.value;
      } else {
        extractedText = new TextDecoder().decode(event.target.result);
      }
      
      // Update the correct text area
      if (activeTab === 'jd') setJdText(extractedText);
      else setResumeText(extractedText);
    } catch (err) {
      console.error("Parsing error:", err);
    }
  };
  reader.readAsArrayBuffer(file);
};
