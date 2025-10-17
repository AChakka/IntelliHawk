// App.js
import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-content">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;