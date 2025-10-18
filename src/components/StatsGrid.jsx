// components/StatsGrid.js
import React from 'react';

const StatsGrid = () => {
  const stats = [
    { title: 'Total Employees', value: '247', change: '+2%' },
    { title: 'Active Threats', value: '12', change: '-5%' },
    { title: 'High Risk Users', value: '8', change: '+1%' },
    { title: 'Incidents Today', value: '3', change: '0%' }
  ];

  return (
    <div className="stats-grid">
      {stats.map(stat => (
        <div key={stat.title} className="stat-card">
          <h3>{stat.title}</h3>
          <div className="stat-value">{stat.value}</div>
          <div className="stat-change">{stat.change}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;