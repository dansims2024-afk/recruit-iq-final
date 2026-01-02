import mammoth from 'mammoth';

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    const arrayBuffer = event.target.result;
    
    if (file.name.endsWith('.docx')) {
      // Correctly extract text from Word files
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
    } else {
      // Standard handling for .txt or other text-based files
      const text = new TextDecoder().decode(arrayBuffer);
      activeTab === 'jd' ? setJdText(text) : setResumeText(text);
    }
  };
  reader.readAsArrayBuffer(file);
};
