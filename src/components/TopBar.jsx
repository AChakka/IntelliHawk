import React from 'react'
import './TopBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faUserCircle } from '@fortawesome/free-solid-svg-icons'


export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">Insider Threat Detection</h1>
      </div>

      <div className="topbar-right">
        <button className="tb-btn">+ New Report</button>

        <button className="tb-icon" title="Notifications">
          <i className="fas fa-bell"></i>
        </button>

        <div className="tb-user">
          <FontAwesomeIcon icon={faUserCircle} className="tb-avatar" />
          <span className="tb-name">Admin User</span>
        </div>
      </div>
    </header>
  )
}
