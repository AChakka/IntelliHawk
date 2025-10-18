// components/Dashboard.js
import React from 'react';
import ThreatLevel from './ThreatLevel';
import ActivityFeed from './ActivityFeed';
import RiskChart from './RiskChart';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-main">
        <div className="dashboard-column">
          <ThreatLevel />
          <ActivityFeed />
        </div>
        <div className="dashboard-column">
          <RiskChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;