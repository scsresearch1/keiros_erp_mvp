import React, { useState } from 'react';
import './Settings.css';

const Settings = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('devices');
  const [deviceSettings, setDeviceSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    geofenceAlerts: true,
    proximityAlerts: true,
    lowBatteryThreshold: 20
  });
  const [fleetSettings, setFleetSettings] = useState({
    slaThreshold: 95,
    violationNotifications: true,
    routeOptimization: true,
    maintenanceReminders: true
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    pushNotifications: true,
    smsAlerts: true,
    dashboardNotifications: true
  });

  const canManageSettings = ['admin', 'manager'].includes(currentUser.level);

  if (!canManageSettings) {
    return (
      <div className="settings">
        <div className="empty-state">
          <div className="empty-state-icon">🚫</div>
          <div className="empty-state-title">Access Denied</div>
          <div className="empty-state-description">
            You don't have permission to manage system settings.
          </div>
        </div>
      </div>
    );
  }

  const handleDeviceSettingChange = (setting, value) => {
    setDeviceSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleFleetSettingChange = (setting, value) => {
    setFleetSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleNotificationSettingChange = (setting, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    console.log('Saving settings:', { deviceSettings, fleetSettings, notificationSettings });
    alert('Settings saved successfully!');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      setDeviceSettings({
        autoRefresh: true,
        refreshInterval: 30,
        geofenceAlerts: true,
        proximityAlerts: true,
        lowBatteryThreshold: 20
      });
      setFleetSettings({
        slaThreshold: 95,
        violationNotifications: true,
        routeOptimization: true,
        maintenanceReminders: true
      });
      setNotificationSettings({
        emailAlerts: true,
        pushNotifications: true,
        smsAlerts: true,
        dashboardNotifications: true
      });
      alert('Settings reset to defaults!');
    }
  };

  return (
    <div className="settings">
      <div className="content-header">
        <div className="header-content">
          <h1 className="content-title">System Settings</h1>
          <p className="content-subtitle">
            Configure device tracking, fleet management, and system preferences
          </p>
        </div>
        <div className="header-actions">
          <div className="settings-status">
            <span className="status-indicator active"></span>
            <span className="status-text">All systems operational</span>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="settings-tabs">
        <button 
          className={`settings-tab ${activeTab === 'devices' ? 'active' : ''}`}
          onClick={() => setActiveTab('devices')}
          title="Configure device tracking and monitoring settings"
        >
          <span className="tab-icon">📱</span>
          <span className="tab-label">Device Settings</span>
        </button>
        <button 
          className={`settings-tab ${activeTab === 'fleet' ? 'active' : ''}`}
          onClick={() => setActiveTab('fleet')}
          title="Manage fleet operations and compliance settings"
        >
          <span className="tab-icon">🚚</span>
          <span className="tab-label">Fleet Settings</span>
        </button>
        <button 
          className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
          title="Configure notification preferences and alert settings"
        >
          <span className="tab-icon">🔔</span>
          <span className="tab-label">Notifications</span>
        </button>
      </div>

      {/* Device Settings */}
      {activeTab === 'devices' && (
        <div className="settings-section">
          <div className="section-header">
            <h3 className="section-title">Device Tracking Configuration</h3>
            <p className="section-description">Configure how devices are monitored and tracked in real-time</p>
          </div>
          
          <div className="settings-grid">
            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-icon">🔄</div>
                <div className="setting-info">
                  <h4 className="setting-name">Auto-refresh Device Locations</h4>
                  <p className="setting-description">Automatically update device positions on the map</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={deviceSettings.autoRefresh}
                    onChange={(e) => handleDeviceSettingChange('autoRefresh', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              {deviceSettings.autoRefresh && (
                <div className="setting-detail">
                  <label className="detail-label">Refresh Interval:</label>
                  <select
                    className="detail-select"
                    value={deviceSettings.refreshInterval}
                    onChange={(e) => handleDeviceSettingChange('refreshInterval', parseInt(e.target.value))}
                  >
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={120}>2 minutes</option>
                  </select>
                </div>
              )}
            </div>

            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-icon">🎯</div>
                <div className="setting-info">
                  <h4 className="setting-name">Geofence Violation Alerts</h4>
                  <p className="setting-description">Receive notifications when devices violate geofence boundaries</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={deviceSettings.geofenceAlerts}
                    onChange={(e) => handleDeviceSettingChange('geofenceAlerts', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-icon">📍</div>
                <div className="setting-info">
                  <h4 className="setting-name">Proximity Alerts</h4>
                  <p className="setting-description">Notify users when they are close to their assigned devices</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={deviceSettings.proximityAlerts}
                    onChange={(e) => handleDeviceSettingChange('proximityAlerts', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-icon">🔋</div>
                <div className="setting-info">
                  <h4 className="setting-name">Low Battery Threshold</h4>
                  <p className="setting-description">Alert when device battery falls below this percentage</p>
                </div>
              </div>
              <div className="setting-detail">
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={deviceSettings.lowBatteryThreshold}
                  onChange={(e) => handleDeviceSettingChange('lowBatteryThreshold', parseInt(e.target.value))}
                  className="battery-slider"
                />
                <span className="battery-value">{deviceSettings.lowBatteryThreshold}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fleet Settings */}
      {activeTab === 'fleet' && (
        <div className="settings-section">
          <div className="section-header">
            <h3 className="section-title">Fleet Management Configuration</h3>
            <p className="section-description">Configure fleet operations, compliance, and optimization settings</p>
          </div>
          
          <div className="settings-grid">
            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-icon">📊</div>
                <div className="setting-info">
                  <h4 className="setting-name">SLA Compliance Threshold</h4>
                  <p className="setting-description">Minimum acceptable service level agreement compliance rate</p>
                </div>
              </div>
              <div className="setting-detail">
                <input
                  type="range"
                  min="80"
                  max="100"
                  value={fleetSettings.slaThreshold}
                  onChange={(e) => handleFleetSettingChange('slaThreshold', parseInt(e.target.value))}
                  className="sla-slider"
                />
                <span className="sla-value">{fleetSettings.slaThreshold}%</span>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-icon">🚨</div>
                <div className="setting-info">
                  <h4 className="setting-name">Violation Notifications</h4>
                  <p className="setting-description">Notify fleet managers of geofence violations and SLA breaches</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={fleetSettings.violationNotifications}
                    onChange={(e) => handleFleetSettingChange('violationNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-icon">🛣️</div>
                <div className="setting-info">
                  <h4 className="setting-name">Route Optimization</h4>
                  <p className="setting-description">Automatically optimize delivery routes for better efficiency</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={fleetSettings.routeOptimization}
                    onChange={(e) => handleFleetSettingChange('routeOptimization', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-icon">🔧</div>
                <div className="setting-info">
                  <h4 className="setting-name">Maintenance Reminders</h4>
                  <p className="setting-description">Remind operators of scheduled device maintenance</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={fleetSettings.maintenanceReminders}
                    onChange={(e) => handleFleetSettingChange('maintenanceReminders', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <div className="settings-section">
          <div className="section-header">
            <h3 className="section-title">Notification Preferences</h3>
            <p className="section-description">Configure how and when you receive system notifications and alerts</p>
          </div>
          
          <div className="settings-grid">
            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-icon">📧</div>
                <div className="setting-info">
                  <h4 className="setting-name">Email Notifications</h4>
                  <p className="setting-description">Receive critical alerts and system updates via email</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailAlerts}
                    onChange={(e) => handleNotificationSettingChange('emailAlerts', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-icon">📱</div>
                <div className="setting-info">
                  <h4 className="setting-name">Push Notifications</h4>
                  <p className="setting-description">Get instant alerts on your mobile device</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => handleNotificationSettingChange('pushNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-icon">💬</div>
                <div className="setting-info">
                  <h4 className="setting-name">SMS Alerts</h4>
                  <p className="setting-description">Receive urgent violation alerts via text message</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsAlerts}
                    onChange={(e) => handleNotificationSettingChange('smsAlerts', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-card">
              <div className="setting-header">
                <div className="setting-icon">🖥️</div>
                <div className="setting-info">
                  <h4 className="setting-name">Dashboard Notifications</h4>
                  <p className="setting-description">Show notifications directly on the dashboard</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.dashboardNotifications}
                    onChange={(e) => handleNotificationSettingChange('dashboardNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="settings-actions">
        <button 
          className="btn btn-primary"
          onClick={handleSaveSettings}
          title="Save all current settings"
        >
          <span className="btn-icon">💾</span>
          <span className="btn-text">Save Settings</span>
        </button>
        <button 
          className="btn btn-secondary"
          onClick={handleResetDefaults}
          title="Reset all settings to default values"
        >
          <span className="btn-icon">🔄</span>
          <span className="btn-text">Reset to Defaults</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
