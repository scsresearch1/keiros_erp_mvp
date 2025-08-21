import React, { useState } from 'react';
import './Header.css';

const Header = ({ currentUser, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'System maintenance scheduled for tonight', type: 'info', time: '2 hours ago' },
    { id: 2, message: 'New user registration request', type: 'warning', time: '4 hours ago' },
    { id: 3, message: 'Monthly report generated successfully', type: 'success', time: '1 day ago' }
  ]);

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
            🔔
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
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
            <span className="user-avatar">{currentUser.avatar}</span>
            <span className="user-name">{currentUser.fullName}</span>
            <span className="user-arrow">▼</span>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-info">
                  <div className="user-full-name">{currentUser.fullName}</div>
                  <div className="user-email">{currentUser.email}</div>
                  <div className="user-role">{currentUser.role}</div>
                </div>
              </div>
              <div className="user-dropdown-menu">
                <button className="dropdown-item">
                  👤 Profile
                </button>
                <button className="dropdown-item">
                  ⚙️ Settings
                </button>
                <button className="dropdown-item">
                  🆘 Help
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  🚪 Sign Out
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
