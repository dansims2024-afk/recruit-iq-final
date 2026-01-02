// Inside your Screen Candidate function:
const handleScreen = () => {
  const localCount = parseInt(localStorage.getItem('screen_count') || '0');
  
  if (!isPremium && localCount >= 3) {
    setShowPaywall(true); // Trigger the $29.99 popup
    return;
  }
  
  // If allowed, run the analysis...
  localStorage.setItem('screen_count', (localCount + 1).toString());
  setScreenCount(localCount + 1);
  // ... rest of your screening logic
};
