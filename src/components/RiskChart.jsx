// components/RiskChart.js
import React from 'react';

const RiskChart = () => {
  return (
    <div className="risk-chart card">
      <h2>Risk Distribution</h2>
      <div className="chart-placeholder">
        {/* Replace with actual chart component */}
        <div className="mock-chart">
          <div className="chart-bar" style={{ height: '80%' }}>High</div>
          <div className="chart-bar" style={{ height: '60%' }}>Medium</div>
          <div className="chart-bar" style={{ height: '30%' }}>Low</div>
        </div>
      </div>
    </div>
  );
};

export default RiskChart;