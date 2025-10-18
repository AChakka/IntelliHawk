// components/Dashboard.js
import React from 'react';
import StatsGrid from './StatsGrid';
import ThreatLevel from './ThreatLevel';
import ActivityFeed from './ActivityFeed';
import RiskChart from './RiskChart';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <StatsGrid />
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