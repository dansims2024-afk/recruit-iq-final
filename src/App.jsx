import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      fontFamily: 'sans-serif' 
    }}>
      <h1>My App is Live!</h1>
      
      {/* This section shows if you are NOT logged in */}
      <SignedOut>
        <p>Your connection to Clerk is working. Please sign in:</p>
        <SignInButton mode="modal">
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}>
            Sign In
          </button>
        </SignInButton>
      </SignedOut>

      {/* This section shows only AFTER you log in */}
      <SignedIn>
        <p>Success! You are securely logged in.</p>
        <UserButton />
      </SignedIn>
    </div>
  );
}

export default App;
