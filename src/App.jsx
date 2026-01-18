import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import UpgradeRedirect from './components/UpgradeRedirect';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B1120] text-white">
        <Routes>
          {/* Main Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* The bridge page Clerk will redirect to after verification */}
          <Route path="/upgrade" element={<UpgradeRedirect />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
