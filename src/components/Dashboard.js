import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Overview from './Overview';
import Devices from './Devices';
import Users from './Users';
import GeofenceAlerts from './GeofenceAlerts';
import Reports from './Reports';
import Settings from './Settings';
import DeliveryAgency from './DeliveryAgency';
import EndUserDashboard from './EndUserDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();

  console.log('Dashboard: currentUser:', currentUser);
  console.log('Dashboard: isAuthenticated:', isAuthenticated);

  if (!currentUser) {
    console.log('Dashboard: No current user, showing loading');
    return (
      <div className="loading-container">
        <span className="loading-spinner"></span>
        Loading user data...
      </div>
    );
  }

  // Check if user is an end user
  const isEndUser = currentUser.level === 'enduser';
  
  // Check if user is a fleet manager
  const isFleetManager = currentUser.level === 'fleetmanager';
  
  console.log('Dashboard: isEndUser:', isEndUser);
  console.log('Dashboard: isFleetManager:', isFleetManager);

  return (
    <div className="dashboard">
      <Sidebar currentUser={currentUser} />
      <div className="dashboard-content" id="main-content">
        <Header currentUser={currentUser} onLogout={logout} />
        
        <Routes>
          {isEndUser ? (
            <>
              <Route path="/" element={<EndUserDashboard currentUser={currentUser} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : isFleetManager ? (
            <>
              <Route path="/" element={<Navigate to="/delivery-agency" replace />} />
              <Route path="/delivery-agency" element={<DeliveryAgency currentUser={currentUser} />} />
              <Route path="/devices" element={<Devices currentUser={currentUser} />} />
              <Route path="/reports" element={<Reports currentUser={currentUser} />} />
              <Route path="/settings" element={<Settings currentUser={currentUser} />} />
              <Route path="*" element={<Navigate to="/delivery-agency" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<Overview currentUser={currentUser} />} />
              <Route path="/devices" element={<Devices currentUser={currentUser} />} />
              <Route path="/users" element={<Users currentUser={currentUser} />} />
              <Route path="/geofence-alerts" element={<GeofenceAlerts currentUser={currentUser} />} />
              <Route path="/reports" element={<Reports currentUser={currentUser} />} />
              <Route path="/settings" element={<Settings currentUser={currentUser} />} />
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
