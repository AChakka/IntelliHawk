// components/ActivityFeed.js
import React from 'react';

const ActivityFeed = () => {
  const activities = [
    { user: 'John D.', action: 'Unusual login location', time: '2 min ago', risk: 'high' },
    { user: 'Sarah M.', action: 'Multiple failed logins', time: '5 min ago', risk: 'medium' },
    { user: 'Mike R.', action: 'After hours access', time: '10 min ago', risk: 'low' },
    { user: 'Lisa K.', action: 'Data export attempt', time: '15 min ago', risk: 'high' }
  ];

  return (
    <div className="activity-feed card">
      <h2>Recent Security Events</h2>
      <div className="activity-list">
        {activities.map(activity => (
          <div key={activity.time} className={`activity-item ${activity.risk}`}>
            <div className="activity-content">
              <strong>{activity.user}</strong> - {activity.action}
            </div>
            <div className="activity-time">{activity.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;