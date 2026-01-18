import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import UpgradeRedirect from './components/UpgradeRedirect';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upgrade" element={<UpgradeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
