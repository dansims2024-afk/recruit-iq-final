import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>My App is Live!</h1>
      <p>If you see this, the Vercel build was successful.</p>
      
      {/* This is where your Clerk login buttons would go later */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => alert('App is working!')}>
          Click Me
        </button>
      </div>
    </div>
  );
}

export default App;
