// Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGauge, 
  faUser, 
  faShieldHalved, 
  faChartLine, 
  faGear,
  faPeopleGroup,
   
} from '@fortawesome/free-solid-svg-icons';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: faGauge },
    { name: 'Users', path: '/users', icon: faUser },
    { name: 'Roles', path: '/roles', icon: faPeopleGroup },
    { name: 'Risk Assessment', path: '/alerts', icon: faChartLine },
    { name: 'Security Center', path: '/SecurityCenter', icon: faShieldHalved },
    { name: 'Settings', path: '/settings', icon: faGear },
    
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>IntelliHawk</h2>
              </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link 
            key={item.name} 
            to={item.path} 
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={onClose}
          >
            <FontAwesomeIcon icon={item.icon} className="nav-icon" />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
