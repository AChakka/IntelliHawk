// components/Dashboard.js
import React from 'react';
import ThreatLevel from './ThreatLevel';
import ActivityFeed from './ActivityFeed';
import RiskChart from './RiskChart';
import ThreatOverview from './ThreatOverview';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-main">
        <ThreatOverview />
      </div>
    </div>
  );
};

export default Dashboard;