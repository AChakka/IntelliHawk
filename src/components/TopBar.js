// components/TopBar.js
import React from 'react';

const TopBar = ({ onMenuClick }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={onMenuClick}>
          ☰
        </button>
        <h1>Employee Threat Detection</h1>
      </div>
      <div className="topbar-right">
        <div className="notifications">🔔</div>
        <div className="user-profile">
          <span>Admin User</span>
          <div className="avatar">👤</div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;