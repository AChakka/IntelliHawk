// components/ThreatLevel.js
import React from 'react';

const ThreatLevel = () => {
  return (
    <div className="threat-level card">
      <h2>Current Threat Level</h2>
      <div className="threat-indicator">
        <div className="threat-level-medium">
          <span>MEDIUM</span>
        </div>
      </div>
      <div className="threat-metrics">
        <div className="metric">
          <label>External Threats</label>
          <div className="progress-bar">
            <div className="progress" style={{ width: '30%' }}></div>
          </div>
        </div>
        <div className="metric">
          <label>Internal Threats</label>
          <div className="progress-bar">
            <div className="progress" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatLevel;