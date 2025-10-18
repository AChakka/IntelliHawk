// App.js
import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

// Import pages
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Alerts from './components/Alerts';
import SecurityCenter from './components/SecurityCenter';
import Settings from './components/Settings';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="app">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="main-content">
          <TopBar onMenuClick={() => setSidebarOpen(true)} />

          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/Security Center" element={<SecurityCenter />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
