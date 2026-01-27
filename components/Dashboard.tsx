"use client"; // REQUIRED: Must be the absolute first line

import React, { useState, useEffect } from 'react';
import { useUser, useClerk, SignUpButton, UserButton } from "@clerk/nextjs";
// ... other imports

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  // ... other states

  const finalStripeUrl = user?.id 
    ? `${STRIPE_URL}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.primaryEmailAddress?.emailAddress || '')}`
    : STRIPE_URL;

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // THE STRIPE TRAP: Catch users returning from Clerk verification
      if (sessionStorage.getItem('trigger_stripe') === 'true') {
        sessionStorage.removeItem('trigger_stripe');
        window.location.href = finalStripeUrl;
      }
    }
  }, [isLoaded, isSignedIn, finalStripeUrl]);

  return (
    // ... header and UI
    {!isSignedIn ? (
      <SignUpButton mode="modal" afterSignUpUrl="/"> 
        <button 
          onClick={() => sessionStorage.setItem('trigger_stripe', 'true')}
          className="block w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-black rounded-2xl uppercase tracking-wider text-xs shadow-2xl shadow-blue-500/40"
        >
          Start 3-Day Free Trial
        </button>
      </SignUpButton>
    ) : (
      // ... logged in UI
    )}
  );
}
