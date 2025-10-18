// components/Sidebar.js
import React from 'react';
import './Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGauge,
  faShieldHalved,
  faUser,
  faChartLine,
  faTriangleExclamation,
  faGear,
} from '@fortawesome/free-solid-svg-icons'

export default function Sidebar() {
  const menuItems = [
    { name: 'Overview',        icon: faGauge },
    { name: 'Threat Detection',icon: faShieldHalved },
    { name: 'User Activity',   icon: faUser },
    { name: 'Risk Assessment', icon: faChartLine },
    { name: 'Incidents',       icon: faTriangleExclamation },
    { name: 'Settings',        icon: faGear },
  ];

  return (
    <aside className="sidebar glass">
      <div className="sidebar-brand">
        <div className="brand-dot" />
        <span className="brand-text">Security Center</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <a key={item.name} href="#/" className="nav-item">
            <FontAwesomeIcon icon={item.icon} className="nav-icon" />
            <span className="nav-label">{item.name}</span>
          </a>
        ))}
      </nav>

      {/* optional footer pill */}
      <div className="sidebar-footer">
        <span className="status-pill">Online</span>
      </div>
    </aside>
  )
};