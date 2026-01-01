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
      fontFamily: 'sans-serif',
      textAlign: 'center'
    }}>
      {/* This header is now visible to EVERYONE immediately */}
      <h1>My App is Live!</h1>
      <p>Welcome to the main page. This is now public!</p>

      <div style={{ marginTop: '20px' }}>
        {/* If a user is logged in, show their profile button in the corner */}
        <SignedIn>
          <p>You are logged in:</p>
          <UserButton />
        </SignedIn>

        {/* If they aren't logged in, just show a small optional sign-in link */}
        <SignedOut>
          <SignInButton mode="modal">
            <button style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>
              Sign in (Optional)
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
}

export default App;
