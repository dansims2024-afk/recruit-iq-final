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
      backgroundColor: '#0f172a', 
      color: '#f8fafc',
      fontFamily: 'sans-serif',
      textAlign: 'center'
    }}>
      <h1>My App is Live!</h1>
      <p>This page is now public and visible to everyone.</p>

      {/* The login buttons are now optional extras in the UI */}
      <div style={{ marginTop: '20px' }}>
        <SignedIn>
          <UserButton afterSignOutUrl="/"/>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button style={{ cursor: 'pointer', color: '#3b82f6', background: 'none', border: 'none', textDecoration: 'underline' }}>
              Sign in (Optional)
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
}

export default App;
