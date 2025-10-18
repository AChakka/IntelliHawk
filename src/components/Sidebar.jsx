// components/Sidebar.js
import React from 'react';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Overview', icon: '📊' },
    { name: 'Threat Detection', icon: '🛡️' },
    { name: 'User Activity', icon: '👥' },
    { name: 'Risk Assessment', icon: '📈' },
    { name: 'Incidents', icon: '🚨' },
    { name: 'Settings', icon: '⚙️' }
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Security Center</h2>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <a key={item.name} href="#/" className="nav-item">
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;