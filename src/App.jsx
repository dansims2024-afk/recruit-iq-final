import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';

export default function App() {
  const [kindeClient, setKindeClient] = useState(null);

  // --- INITIALIZE KINDE (No Terminal Method) ---
  useEffect(() => {
    const initKinde = async () => {
      try {
        // window.createKindeClient is provided by the script tag in index.html
        const client = await window.createKindeClient({
          client_id: "af5b33a2a81b41669ecc12860d1f7471",
          domain: "https://ccai1.kinde.com",
          redirect_uri: "http://www.recruit-iq.com",
          is_dangerously_use_local_storage: true
        });
        setKindeClient(client);
      } catch (err) {
        console.error("Kinde failed to load:", err);
      }
    };
    initKinde();
  }, []);

  // Show a dark background while Kinde initializes
  if (!kindeClient) {
    return <div className="min-h-screen bg-[#0B1120]" />;
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans selection:bg-indigo-500/30">
      
      {/* HEADER - Consistent with your original design */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
           {/* Logo placeholder if needed */}
        </div>

        <div>
          {/* Note: User avatar logic moved inside Dashboard for better state handling with Kinde */}
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Recruit-IQ Secure Session
          </p>
        </div>
      </header>

      {/* Pass the kinde client to the Dashboard. 
          The Dashboard now handles the Login/Logout buttons 
          to keep the UI in sync with the user data.
      */}
      <Dashboard kinde={kindeClient} />
      
    </div>
  );
}
