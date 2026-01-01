import React from 'react';

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#0f172a', 
      color: '#f8fafc',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Welcome to My App</h1>
      <p style={{ fontSize: '1.5rem', maxWidth: '600px', lineHeight: '1.6' }}>
        The login gate has been removed. You are now looking at the actual 
        home page of your application!
      </p>
      
      <div style={{ marginTop: '40px' }}>
        <button style={{ 
          padding: '12px 24px', 
          backgroundColor: '#3b82f6', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px', 
          fontSize: '1rem',
          cursor: 'pointer' 
        }}>
          Explore Features
        </button>
      </div>
    </div>
  );
}

export default App;
