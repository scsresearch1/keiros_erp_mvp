import React, { useState } from 'react';
import './Header.css';

const Header = ({ currentUser, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'System maintenance scheduled for tonight', type: 'info', time: '2 hours ago' },
    { id: 2, message: 'New user registration request', type: 'warning', time: '4 hours ago' },
    { id: 3, message: 'Monthly report generated successfully', type: 'success', time: '1 day ago' }
  ]);

  // Debug logging
  console.log('Header: currentUser:', currentUser);
  console.log('Header: currentUser.level:', currentUser?.level);
  console.log('Header: currentUser.fullName:', currentUser?.fullName);
  console.log('Header: currentUser.email:', currentUser?.email);

  const handleLogout = () => {
    onLogout();
    setShowUserMenu(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const getUserRoleIcon = (level) => {
    if (!level) return '👤';
    
    switch (level.toLowerCase()) {
      case 'admin': return '👑';
      case 'fleetmanager': return '🚚';
      case 'enduser': return '🏠';
      default: return '👤';
    }
  };

  const getUserRoleColor = (level) => {
    if (!level) return 'default-role';
    
    switch (level.toLowerCase()) {
      case 'admin': return 'admin-role';
      case 'fleetmanager': return 'fleet-role';
      case 'enduser': return 'user-role';
      default: return 'default-role';
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-breadcrumb">
          <span className="breadcrumb-item">Device Tracking Dashboard</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-notifications">
          <button className="notification-btn">
            <div className="notification-icon-wrapper">
              <span className="notification-icon">🔔</span>
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </div>
          </button>
          
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <h3>Notifications</h3>
              <button className="mark-all-read">Mark all read</button>
            </div>
            <div className="notifications-list">
              {notifications.map(notification => (
                <div key={notification.id} className={`notification-item ${notification.type}`}>
                  <span className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="notification-content">
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{notification.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="header-user">
          <button 
            className="user-menu-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar-container">
              <div className={`user-avatar ${getUserRoleColor(currentUser?.level)}`}>
                {getUserRoleIcon(currentUser?.level)}
              </div>
              <div className="user-status-indicator"></div>
            </div>
            <div className="user-info-display">
              <span className="user-name">{currentUser?.fullName || 'User'}</span>
              <span className="user-role-label">{currentUser?.level || 'Unknown'}</span>
            </div>
            <span className={`user-arrow ${showUserMenu ? 'rotated' : ''}`}>▼</span>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-profile-section">
                  <div className={`user-avatar-large ${getUserRoleColor(currentUser?.level)}`}>
                    {getUserRoleIcon(currentUser?.level)}
                  </div>
                  <div className="user-details">
                    <div className="user-full-name">{currentUser?.fullName || 'User'}</div>
                    <div className="user-email">{currentUser?.email || 'user@example.com'}</div>
                    <div className={`user-role-badge ${getUserRoleColor(currentUser?.level)}`}>
                      {currentUser?.level || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="user-dropdown-menu">
                <button className="dropdown-item profile-item">
                  <div className="item-icon">👤</div>
                  <div className="item-content">
                    <span className="item-title">Profile</span>
                    <span className="item-description">View and edit your profile</span>
                  </div>
                  <div className="item-arrow">→</div>
                </button>
                
                <button className="dropdown-item settings-item">
                  <div className="item-icon">⚙️</div>
                  <div className="item-content">
                    <span className="item-title">Settings</span>
                    <span className="item-description">Customize your preferences</span>
                  </div>
                  <div className="item-arrow">→</div>
                </button>
                
                <button className="dropdown-item help-item">
                  <div className="item-icon">🆘</div>
                  <div className="item-content">
                    <span className="item-title">Help & Support</span>
                    <span className="item-description">Get assistance and documentation</span>
                  </div>
                  <div className="item-arrow">→</div>
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <div className="item-icon">🚪</div>
                  <div className="item-content">
                    <span className="item-title">Sign Out</span>
                    <span className="item-description">Securely log out of your account</span>
                  </div>
                  <div className="logout-arrow">↪</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
