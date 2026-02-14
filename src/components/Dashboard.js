import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Overview from './Overview';
import Devices from './Devices';
import Users from './Users';
import GeofenceAlerts from './GeofenceAlerts';
import Reports from './Reports';
import Settings from './Settings';
import DeliveryAgency from './DeliveryAgency';
import EndUserDevicesView from './EndUserDevicesView';
import DevicesLanding from './DevicesLanding';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  console.log('Dashboard: currentUser:', currentUser);
  console.log('Dashboard: isAuthenticated:', isAuthenticated);
  console.log('Dashboard: Current location:', location.pathname);

  // Debug logging for sidebar and content
  useEffect(() => {
    console.log('Dashboard: Location changed to:', location.pathname);
    console.log('Dashboard: Sidebar element:', document.querySelector('.sidebar'));
    console.log('Dashboard: Sidebar width:', document.querySelector('.sidebar')?.offsetWidth);
    console.log('Dashboard: Dashboard content element:', document.querySelector('.dashboard-content'));
    console.log('Dashboard: Dashboard content margin-left:', document.querySelector('.dashboard-content')?.style.marginLeft);
    console.log('Dashboard: Dashboard content classes:', document.querySelector('.dashboard-content')?.className);
  }, [location.pathname]);

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
  
  // Check if user is data admin
  const isDataAdmin = currentUser.level === 'dataadmin';
  
  console.log('Dashboard: isEndUser:', isEndUser);
  console.log('Dashboard: isFleetManager:', isFleetManager);
  console.log('Dashboard: isDataAdmin:', isDataAdmin);

  return (
    <div className="dashboard">
      <div className="dashboard-content" id="main-content" style={{ marginLeft: 0 }}>
        <Header currentUser={currentUser} onLogout={logout} />
        
        <div className="content-container">
          <Routes>
            {isEndUser ? (
              <>
                <Route path="/" element={<EndUserDevicesView />} />
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
            ) : isDataAdmin ? (
              <>
                <Route path="/" element={<Navigate to="/devices-landing" replace />} />
                <Route path="/devices-landing" element={<DevicesLanding />} />
                <Route path="/overview" element={<Overview currentUser={currentUser} />} />
                <Route path="/devices" element={<Devices currentUser={currentUser} />} />
                <Route path="/users" element={<Users currentUser={currentUser} />} />
                <Route path="/geofence-alerts" element={<GeofenceAlerts currentUser={currentUser} />} />
                <Route path="/reports" element={<Reports currentUser={currentUser} />} />
                <Route path="/settings" element={<Settings currentUser={currentUser} />} />
                <Route path="*" element={<Navigate to="/devices-landing" replace />} />
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
    </div>
  );
};

export default Dashboard;
