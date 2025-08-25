import React, { useState, useEffect } from 'react';
import './Overview.css';

const Overview = ({ currentUser }) => {
  const [dashboardData, setDashboardData] = useState({
    totalDevices: 0,
    activeDevices: 0,
    totalUsers: 0,
    recentActivities: [],
    pendingApprovals: []
  });

  useEffect(() => {
    // Simulate data loading
    const loadDashboardData = () => {
      setDashboardData({
        totalDevices: 156,
        activeDevices: 142,
        totalUsers: 89,
        recentActivities: [
          { id: 1, type: 'device', action: 'Device offline', time: '2 minutes ago', device: 'GPS-001' },
          { id: 2, type: 'user', action: 'New user registered', time: '15 minutes ago', user: 'john.doe' },
          { id: 3, type: 'alert', action: 'Geofence violation', time: '1 hour ago', device: 'GPS-003' },
          { id: 4, type: 'device', action: 'Location update', time: '2 hours ago', device: 'GPS-007' },
          { id: 5, type: 'system', action: 'System backup completed', time: '3 hours ago' }
        ],
        pendingApprovals: [
          { id: 1, type: 'device', description: 'New GPS device registration', requester: 'fleet.manager@company.com' },
          { id: 2, type: 'user', description: 'Driver access request', requester: 'hr@company.com' },
          { id: 3, type: 'geofence', description: 'New restricted area creation', requester: 'operations@company.com' }
        ]
      });
    };

    loadDashboardData();
  }, []);

  return (
    <div className="overview-content">
      <div className="overview-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {currentUser?.username || 'Administrator'}</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <h3>Total Devices</h3>
            <p className="stat-number">{dashboardData.totalDevices}</p>
            <span className="stat-change positive">+12 this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>Active Devices</h3>
            <p className="stat-number">{dashboardData.activeDevices}</p>
            <span className="stat-change positive">91% online</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{dashboardData.totalUsers}</p>
            <span className="stat-change positive">+5 this week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Pending Approvals</h3>
            <p className="stat-number">{dashboardData.pendingApprovals.length}</p>
            <span className="stat-change neutral">Requires attention</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="overview-content">
        {/* Recent Activities */}
        <div className="content-section">
          <h2>Recent Activities</h2>
          <div className="activities-list">
            {dashboardData.recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'device' && '📱'}
                  {activity.type === 'user' && '👤'}
                  {activity.type === 'alert' && '🚨'}
                  {activity.type === 'system' && '⚙️'}
                </div>
                <div className="activity-content">
                  <p className="activity-text">{activity.action}</p>
                  <p className="activity-details">
                    {activity.device && `Device: ${activity.device}`}
                    {activity.user && `User: ${activity.user}`}
                  </p>
                </div>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="content-section">
          <h2>Pending Approvals</h2>
          <div className="approvals-list">
            {dashboardData.pendingApprovals.map(approval => (
              <div key={approval.id} className="approval-item">
                <div className="approval-icon">
                  {approval.type === 'device' && '📱'}
                  {approval.type === 'user' && '👤'}
                  {approval.type === 'geofence' && '📍'}
                </div>
                <div className="approval-content">
                  <p className="approval-text">{approval.description}</p>
                  <p className="approval-requester">Requested by: {approval.requester}</p>
                </div>
                <div className="approval-actions">
                  <button className="btn-approve">Approve</button>
                  <button className="btn-reject">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;

