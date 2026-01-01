import React from 'react';
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#0f172a', // Dark blue background
      color: '#f8fafc',           // Bright white text
      fontFamily: 'sans-serif',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>My App is Live!</h1>
      <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>Welcome to the main page. This is now public!</p>

      <div style={{ marginTop: '30px' }}>
        <SignedIn>
          <p>You are logged in:</p>
          <UserButton afterSignOutUrl="/"/>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button style={{ 
              padding: '10px 20px', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              Sign in (Optional)
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
}

export default App;
