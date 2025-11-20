import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getUserLevel } from '../data/demoUsers';
import './Sidebar.css';

const Sidebar = ({ currentUser }) => {
  const location = useLocation();
  
  // Check if user is an end user
  const isEndUser = currentUser.level === 'enduser';
  
  // Check if user is a fleet manager
  const isFleetManager = currentUser.level === 'fleetmanager';
  
  // Check if user is data admin
  const isDataAdmin = currentUser.level === 'dataadmin';

  // Debug logging
  useEffect(() => {
    console.log('Sidebar: Location changed to:', location.pathname);
    console.log('Sidebar: Current DOM element:', document.querySelector('.sidebar'));
    console.log('Sidebar: Sidebar width:', document.querySelector('.sidebar')?.offsetWidth);
    console.log('Sidebar: Sidebar classes:', document.querySelector('.sidebar')?.className);
  }, [location.pathname]);

  // Different navigation items for different user types
  const navigationItems = isEndUser ? [
    {
      name: 'My Devices',
      icon: '🏠',
      path: '/',
      title: 'View and manage your assigned Keiros door number plate devices'
    }
  ] : isFleetManager ? [
    {
      name: 'Fleet Dashboard',
      icon: '🚚',
      path: '/delivery-agency',
      title: 'Fleet management, package tracking, and compliance monitoring'
    },
    {
      name: 'Reports',
      icon: '📈',
      path: '/reports',
      title: 'Generate and view fleet reports'
    }
  ] : isDataAdmin ? [
    {
      name: 'Live Devices',
      icon: '📡',
      path: '/devices-landing',
      title: 'Real-time Firebase device monitoring'
    },
    {
      name: 'Overview',
      icon: '📊',
      path: '/overview',
      title: 'System overview and key metrics dashboard'
    },
    {
      name: 'Devices',
      icon: '📱',
      path: '/devices',
      title: 'Manage all IoT devices, SIMs, and connectivity'
    },
    {
      name: 'Users',
      icon: '👥',
      path: '/users',
      title: 'User account management and role assignments'
    },
    {
      name: 'Geofence Alerts',
      icon: '🚨',
      path: '/geofence-alerts',
      title: 'Monitor geofence violations and alerts'
    },
    {
      name: 'Reports',
      icon: '📈',
      path: '/reports',
      title: 'Generate and view system reports'
    },
    {
      name: 'Settings',
      icon: '⚙️',
      path: '/settings',
      title: 'System configuration and preferences'
    }
  ] : [
    {
      name: 'Overview',
      icon: '📊',
      path: '/overview',
      title: 'System overview and key metrics dashboard'
    },
    {
      name: 'Devices',
      icon: '📱',
      path: '/devices',
      title: 'Manage all IoT devices, SIMs, and connectivity'
    },
    {
      name: 'Users',
      icon: '👥',
      path: '/users',
      title: 'User account management and role assignments'
    },
    {
      name: 'Geofence Alerts',
      icon: '🚨',
      path: '/geofence-alerts',
      title: 'Monitor geofence violations and alerts'
    },
    {
      name: 'Reports',
      icon: '📈',
      path: '/reports',
      title: 'Generate and view system reports'
    },
    {
      name: 'Settings',
      icon: '⚙️',
      path: '/settings',
      title: 'System configuration and preferences'
    }
  ];

  console.log('Sidebar: currentUser:', currentUser);
  console.log('Sidebar: navigationItems:', navigationItems);
  console.log('Sidebar: Current path:', location.pathname);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🏢</span>
          <span className="logo-text">Keiros ERP</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-info">
          <div className="user-name">{currentUser.fullName}</div>
          <div className="user-role">{getUserLevel(currentUser.level).name}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={item.title}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
