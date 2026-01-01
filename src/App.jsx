import React from 'react';

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6' }}>
      
      {/* Sidebar - The Navigation Menu */}
      <aside style={{ width: '250px', backgroundColor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #334155' }}>
          MyApp Admin
        </div>
        <nav style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dashboard</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Candidates</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Jobs</a>
          <a href="#" style={{ color: '#94a3b8', textDecoration: 'none' }}>Settings</a>
        </nav>
      </aside>

      {/* Main Content Area - Where the work happens */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header */}
        <header style={{ height: '60px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold', color: '#374151' }}>Dashboard Overview</span>
          <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></div>
        </header>

        {/* The Workspace */}
        <div style={{ padding: '30px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0 }}>Active Projects</h2>
            <p>This is where your actual application features will live.</p>
            <div style={{ marginTop: '20px', padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '8px', color: '#64748b', textAlign: 'center' }}>
              Your data tables or forms go here.
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
