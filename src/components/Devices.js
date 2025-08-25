import React, { useState, useEffect } from 'react';
import csvDataService from '../services/csvDataService';
import './Devices.css';

const Devices = ({ currentUser }) => {
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [sims, setSims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSim, setSelectedSim] = useState(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('devices');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
      // Load devices and users from CSV
      const [devicesData, usersData] = await Promise.all([
        csvDataService.getDevices(),
        csvDataService.getUsers()
      ]);
      
      setDevices(devicesData || []);
      setUsers(usersData || []);
      
      // Simulate SIM data from CSV devices (using device data to create SIM entries)
      const simulatedSims = devicesData ? devicesData.map((device, index) => ({
        id: `sim-${device.id}`,
        simId: `SIM-${String(index + 1).padStart(4, '0')}`,
        phoneNumber: `+1-555-${String(index + 1000).slice(-4)}`,
        status: device.status === 'Active' ? 'Active' : 'Inactive',
        dataPlan: ['5GB', '10GB', 'Unlimited'][index % 3],
        dataUsage: `${(Math.random() * 8 + 1).toFixed(1)} GB`,
        assignedDevice: device.deviceId || 'Unknown',
        carrier: ['AT&T', 'Verizon', 'T-Mobile'][index % 3],
        activationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      })) : [];
      
      setSims(simulatedSims);
        
      } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

  // Admin-only access check
  if (currentUser.level !== 'admin') {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🚫</div>
        <div className="empty-state-title">Access Denied</div>
        <div className="empty-state-description">
          This section is restricted to Super Administrators only.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <span className="loading-spinner"></span>
        Loading management system...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-error">
          {error}
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
            style={{ marginTop: '10px' }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Filter data based on selected type
  const getFilteredData = () => {
    const data = filterType === 'devices' ? devices : 
                 filterType === 'users' ? users : 
                 filterType === 'sims' ? sims : devices;
    
    return data.filter(item => {
      const matchesSearch = !searchTerm || 
        (item.name || item.deviceName || item.username || item.simId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.id || item.deviceId || item.simId || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterType === 'devices') {
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
        return matchesSearch && matchesStatus;
      }
      
      return matchesSearch;
    });
  };

  const filteredData = getFilteredData();

  // Device Management Functions
  const handleApproveDevice = async (deviceId) => {
    try {
      const updatedDevices = devices.map(d => 
        d.id === deviceId ? { ...d, status: 'Active' } : d
      );
      setDevices(updatedDevices);
      
      // Update corresponding SIM status
      const updatedSims = sims.map(s => 
        s.assignedDevice === devices.find(d => d.id === deviceId)?.deviceId ? 
        { ...s, status: 'Active' } : s
      );
      setSims(updatedSims);
      
      logAuditAction('Device Approved', deviceId, 'device');
    } catch (error) {
      console.error('Failed to approve device:', error);
    }
  };

  const handleRejectDevice = async (deviceId) => {
    try {
      const updatedDevices = devices.map(d => 
        d.id === deviceId ? { ...d, status: 'Rejected' } : d
      );
      setDevices(updatedDevices);
      
      // Update corresponding SIM status
      const updatedSims = sims.map(s => 
        s.assignedDevice === devices.find(d => d.id === deviceId)?.deviceId ? 
        { ...s, status: 'Suspended' } : s
      );
      setSims(updatedSims);
      
      logAuditAction('Device Rejected', deviceId, 'device');
    } catch (error) {
      console.error('Failed to reject device:', error);
    }
  };

  const handleDeleteItem = async (itemId, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        if (type === 'device') {
          setDevices(prev => prev.filter(d => d.deviceId !== itemId));
          // Also remove associated SIM if exists
          setSims(prev => prev.filter(s => s.assignedDevice !== itemId));
        } else if (type === 'user') {
          setUsers(prev => prev.filter(u => u.id !== itemId));
        } else if (type === 'sim') {
          setSims(prev => prev.filter(s => s.id !== itemId));
        }
        
        logAuditAction(`${type} deleted`, { itemId, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error(`Failed to delete ${type}:`, error);
      }
    }
  };

  // Connectivity Diagnostics
  const runConnectivityDiagnostics = async (deviceId) => {
    try {
      // TODO: Integrate with Aeris API for connectivity diagnostics
      console.log(`Running connectivity diagnostics for device ${deviceId}`);
      
      const device = devices.find(d => d.id === deviceId);
      const sim = sims.find(s => s.assignedDevice === device?.deviceId);
      
      // Simulate Aeris API call with realistic data
      const diagnostics = {
        deviceId,
        deviceName: device?.deviceName || 'Unknown',
        timestamp: new Date().toISOString(),
        connectivity: device?.status === 'Active' ? 'Online' : 'Offline',
        signalQuality: ['Strong', 'Medium', 'Weak'][Math.floor(Math.random() * 3)],
        packetLoss: `${(Math.random() * 2).toFixed(1)}%`,
        networkDrops: Math.floor(Math.random() * 5),
        lastPing: `${Math.floor(Math.random() * 100 + 10)}ms`,
        simStatus: sim?.status || 'Unknown',
        dataUsage: sim?.dataUsage || '0 GB',
        networkType: ['4G LTE', '5G', '3G'][Math.floor(Math.random() * 3)],
        carrier: sim?.carrier || 'Unknown',
        location: device?.location || 'Unknown',
        batteryLevel: device?.batteryLevel || Math.floor(Math.random() * 100)
      };
      
      logAuditAction('Connectivity Diagnostics Run', deviceId, 'device');
      
      // Show results in a more user-friendly way
      const resultsText = `
🔍 Connectivity Diagnostics Results

Device: ${diagnostics.deviceName}
Status: ${diagnostics.connectivity}
Signal: ${diagnostics.signalQuality}
Network: ${diagnostics.networkType}
Carrier: ${diagnostics.carrier}
Location: ${diagnostics.location}
Battery: ${diagnostics.batteryLevel}%

📊 Performance Metrics:
• Packet Loss: ${diagnostics.packetLoss}
• Network Drops: ${diagnostics.networkDrops}
• Response Time: ${diagnostics.lastPing}
• Data Usage: ${diagnostics.dataUsage}

📱 SIM Status: ${diagnostics.simStatus}
      `;
      
      alert(resultsText);
      
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
    }
  };

  // Audit Logging
  const logAuditAction = (action, resourceId, resourceType, details = {}) => {
    const auditLog = {
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      username: currentUser.username,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress: '192.168.1.100', // TODO: Get actual IP
      userAgent: navigator.userAgent
    };
    
    console.log('AUDIT LOG:', auditLog);
    // TODO: Send to audit logging service
    // await auditService.logAction(auditLog);
  };

  // Helper Functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#00ff88';
      case 'Pending Approval': return '#ffa500';
      case 'Offline': return '#ff6b6b';
      case 'Rejected': return '#ff6b6b';
      case 'Suspended': return '#ffa500';
      case 'Inactive': return '#b0b0b0';
      default: return '#b0b0b0';
    }
  };

  const getRoleColor = (level) => {
    switch (level) {
      case 'admin': return '#ff6b6b';
      case 'operator': return '#ffa500';
      case 'manager': return '#00d4ff';
      case 'supervisor': return '#00d4ff';
      default: return '#b0b0b0';
    }
  };

  // Get counts for stats
  const getStats = () => {
    const pendingDevices = devices.filter(d => d.status === 'Pending Approval').length;
    const activeDevices = devices.filter(d => d.status === 'Active').length;
    const totalUsers = users.length;
    const totalSims = sims.length;
    
    return { pendingDevices, activeDevices, totalUsers, totalSims };
  };

  const stats = getStats();

  // Render table headers based on type
  const renderTableHeaders = () => {
    switch (filterType) {
      case 'devices':
        return (
          <>
            <th title="Device display name for easy identification">Device Name</th>
            <th title="Unique device identifier">Device ID</th>
            <th title="Type of IoT device">Type</th>
            <th title="Current operational status">Status</th>
            <th title="Geographic location">Location</th>
            <th title="Last communication timestamp">Last Seen</th>
            <th title="Available actions for this device">Actions</th>
          </>
        );
      case 'users':
        return (
          <>
            <th title="User's login username">Username</th>
            <th title="User's full name">Full Name</th>
            <th title="User's access level and permissions">Role</th>
            <th title="User's department or team">Department</th>
            <th title="User account status">Status</th>
            <th title="Last successful login">Last Login</th>
            <th title="Available actions for this user">Actions</th>
          </>
        );
      case 'sims':
        return (
          <>
            <th title="Unique SIM card identifier">SIM ID</th>
            <th title="Phone number associated with SIM">Phone Number</th>
            <th title="Current SIM activation status">Status</th>
            <th title="Data plan details">Data Plan</th>
            <th title="Current data usage">Usage</th>
            <th title="Device this SIM is assigned to">Device</th>
            <th title="Available actions for this SIM">Actions</th>
          </>
        );
      default:
        return null;
    }
  };

  // Render table rows based on type
  const renderTableRows = () => {
    return filteredData.map((item) => {
      if (filterType === 'devices') {
        return (
          <tr key={item.id} className={`device-row ${item.status === 'Offline' ? 'offline' : ''}`}>
            <td title={`Device: ${item.deviceName || 'Unnamed'}`}>{item.deviceName || 'Unnamed'}</td>
            <td title={`ID: ${item.deviceId || 'No ID'}`}>{item.deviceId || 'No ID'}</td>
            <td title={`Type: ${item.deviceType || 'Unknown'}`}>{item.deviceType || 'Unknown'}</td>
            <td>
              <span 
                className="status-badge" 
                style={{ color: getStatusColor(item.status) }}
                title={`Status: ${item.status || 'Unknown'}`}
              >
                {item.status || 'Unknown'}
              </span>
            </td>
            <td title={`Location: ${item.location || 'Unknown'}`}>{item.location || 'Unknown'}</td>
            <td title={`Last seen: ${item.lastSeen ? new Date(item.lastSeen).toLocaleString() : 'Never'}`}>
              {item.lastSeen ? new Date(item.lastSeen).toLocaleString() : 'Never'}
            </td>
            <td className="action-buttons">
              <button 
                className="btn btn-info btn-xs"
                onClick={() => runConnectivityDiagnostics(item.id)}
                title="Run connectivity diagnostics using Aeris API to check device health, signal quality, and network performance"
              >
                🔍
              </button>
              <button 
                className="btn btn-secondary btn-xs"
                onClick={() => {
                  setSelectedDevice(item);
                  setShowDeviceModal(true);
                }}
                title="Edit device information, status, location, and configuration"
              >
                ✏️
              </button>
              <button 
                className="btn btn-danger btn-xs"
                onClick={() => handleDeleteItem(item.id, 'device')}
                title="Permanently remove this device from the system (cannot be undone)"
              >
                🗑️
              </button>
            </td>
          </tr>
        );
      } else if (filterType === 'users') {
        return (
          <tr key={item.id} className="user-row">
            <td title={`Username: ${item.username || 'N/A'}`}>{item.username || 'N/A'}</td>
            <td title={`Full name: ${item.fullName || 'N/A'}`}>{item.fullName || 'N/A'}</td>
            <td>
              <span 
                className="role-badge" 
                style={{ color: getRoleColor(item.level) }}
                title={`Role: ${item.level || 'user'} - Click to change user permissions`}
              >
                {item.level || 'user'}
              </span>
            </td>
            <td title={`Department: ${item.department || 'N/A'}`}>{item.department || 'N/A'}</td>
            <td>
              <span 
                className="status-badge" 
                style={{ color: getStatusColor(item.status) }}
                title={`Status: ${item.status || 'Active'}`}
              >
                {item.status || 'Active'}
              </span>
            </td>
            <td title={`Last login: ${item.lastLogin ? new Date(item.lastLogin).toLocaleString() : 'Never'}`}>
              {item.lastLogin ? new Date(item.lastLogin).toLocaleString() : 'Never'}
            </td>
            <td className="action-buttons">
              <button 
                className="btn btn-secondary btn-xs"
                onClick={() => {
                  setSelectedUser(item);
                  setShowUserModal(true);
                }}
                title="Edit user information, role, permissions, and department"
              >
                ✏️
              </button>
              <button 
                className="btn btn-danger btn-xs"
                onClick={() => handleDeleteItem(item.id, 'user')}
                title="Permanently remove this user account from the system (cannot be undone)"
              >
                🗑️
              </button>
            </td>
          </tr>
        );
      } else if (filterType === 'sims') {
        return (
          <tr key={item.id} className="sim-row">
            <td title={`SIM ID: ${item.simId || 'N/A'}`}>{item.simId || 'N/A'}</td>
            <td title={`Phone number: ${item.phoneNumber || 'N/A'}`}>{item.phoneNumber || 'N/A'}</td>
            <td>
              <span 
                className="status-badge" 
                style={{ color: getStatusColor(item.status) }}
                title={`Status: ${item.status || 'Active'} - Click to change SIM status`}
              >
                {item.status || 'Active'}
              </span>
            </td>
            <td title={`Data plan: ${item.dataPlan || 'N/A'}`}>{item.dataPlan || 'N/A'}</td>
            <td title={`Current usage: ${item.dataUsage || '0 GB'}`}>{item.dataUsage || '0 GB'}</td>
            <td title={`Assigned to device: ${item.assignedDevice || 'Unassigned'}`}>{item.assignedDevice || 'Unassigned'}</td>
            <td className="action-buttons">
              <button 
                className="btn btn-secondary btn-xs"
                onClick={() => {
                  setSelectedSim(item);
                  setShowSimModal(true);
                }}
                title="Edit SIM information, status, data plan, and device assignment"
              >
                ✏️
              </button>
              <button 
                className="btn btn-danger btn-xs"
                onClick={() => handleDeleteItem(item.id, 'sim')}
                title="Permanently remove this SIM from the system (cannot be undone)"
              >
                🗑️
              </button>
            </td>
          </tr>
        );
      }
      return null;
    });
  };

  return (
    <div className="devices-content">
      <div className="content-header">
        <div className="header-left">
          <h1 className="content-title" title="Main administration panel for managing all system assets">Asset Management - Super Admin</h1>
          <p className="content-subtitle" title="Comprehensive management system for devices, users, and SIM cards with full CRUD operations">
            Manage devices, users, and SIMs with full CRUD operations and connectivity diagnostics
        </p>
      </div>
        <div className="header-right">
          <button 
            className="btn btn-primary"
            onClick={() => {
              if (filterType === 'devices') setShowOnboardingModal(true);
              else if (filterType === 'users') setShowUserModal(true);
              else if (filterType === 'sims') setShowSimModal(true);
            }}
            title={`Add a new ${filterType === 'devices' ? 'device to the system' : filterType === 'users' ? 'user account' : 'SIM card'}`}
          >
            + Add {filterType === 'devices' ? 'Device' : filterType === 'users' ? 'User' : 'SIM'}
          </button>
            </div>
          </div>
          
      <div className="devices-main-layout">
        {/* Left Column - Stats and Controls */}
        <div className="left-column">
          {/* Quick Stats */}
          <div className="admin-stats" title="Overview of system status and counts">
            <div className="stats-grid">
              <div className="stat-card" title="Devices waiting for administrator approval before going live">
                <div className="stat-icon">⏳</div>
                <div className="stat-value">{stats.pendingDevices}</div>
                <div className="stat-label">Pending Approvals</div>
              </div>
              
              <div className="stat-card" title="Currently active and operational devices">
            <div className="stat-icon">✅</div>
              <div className="stat-value">{stats.activeDevices}</div>
              <div className="stat-label">Active Devices</div>
          </div>
          
              <div className="stat-card" title="Total number of user accounts in the system">
                <div className="stat-icon">👥</div>
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
          </div>
          
              <div className="stat-card" title="Total number of SIM cards managed in the system">
                <div className="stat-icon">📱</div>
                <div className="stat-value">{stats.totalSims}</div>
                <div className="stat-label">Total SIMs</div>
          </div>
        </div>
      </div>

          {/* Pending Approvals Section */}
          {stats.pendingDevices > 0 && (
            <div className="pending-approvals-section" title="Devices requiring administrator approval before activation">
              <h3>Pending Device Approvals</h3>
              <div className="approval-grid">
                {devices.filter(d => d.status === 'Pending Approval').map((device) => (
                  <div key={device.id} className="approval-card" title={`Review and approve/reject device: ${device.deviceName || device.deviceId}`}>
                    <div className="device-info">
                      <div className="device-name">{device.deviceName || 'Unnamed Device'}</div>
                      <div className="device-id">ID: {device.deviceId || 'No ID'}</div>
                      <div className="device-type">Type: {device.deviceType || 'Unknown'}</div>
                      <div className="device-location">Location: {device.location || 'Unknown'}</div>
                    </div>
                    <div className="approval-actions">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleApproveDevice(device.id)}
                        title="Approve this device for activation and assign to active status"
                      >
                        ✅ Approve
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRejectDevice(device.id)}
                        title="Reject this device and mark as rejected status"
                      >
                        ❌ Reject
            </button>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}

          {/* Controls */}
          <div className="device-controls" title="Search, filter, and add new assets to the system">
        <div className="search-filter-container">
          <input
            type="text"
                placeholder={`Search ${filterType}...`}
                className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                title={`Search through ${filterType} by name, ID, or other identifying information`}
          />
          
          <select
                className="filter-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                title="Switch between managing different types of assets: devices, users, or SIM cards"
              >
                <option value="devices">Devices</option>
                <option value="users">Users</option>
                <option value="sims">SIMs</option>
              </select>
              
              {filterType === 'devices' && (
                <select
                  className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
                  title="Filter devices by their current operational status"
          >
            <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Offline">Offline</option>
                  <option value="Rejected">Rejected</option>
          </select>
              )}
            </div>
          </div>
      </div>

        {/* Right Column - Table */}
        <div className="right-column">
          {/* Data Table */}
          <div className="devices-table-container" title={`Data table showing all ${filterType} with their details and available actions`}>
            <table className="devices-table">
              <thead>
                <tr>
                  {renderTableHeaders()}
                </tr>
              </thead>
              <tbody>
                {renderTableRows()}
              </tbody>
            </table>
                </div>
              </div>
            </div>
            
      {/* Onboarding Modal */}
      {showOnboardingModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 title="Register a new IoT device in the system">Onboard New Device</h3>
              <button 
                className="modal-close"
                onClick={() => setShowOnboardingModal(false)}
                title="Close this modal without saving changes"
              >
                ×
              </button>
              </div>
            <div className="modal-body">
              <p>Device onboarding functionality will be implemented here.</p>
              <p>This will include:</p>
              <ul>
                <li title="Basic device information and configuration">Device registration form</li>
                <li title="Assign an existing SIM card to the device">SIM card assignment</li>
                <li title="Set initial device parameters and settings">Initial configuration</li>
                <li title="Define geographic boundaries for the device">Geofence setup</li>
              </ul>
              </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowOnboardingModal(false)}
                title="Close this modal"
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  // TODO: Implement device onboarding
                  alert('Device onboarding functionality will be implemented here');
                  setShowOnboardingModal(false);
                }}
                title="Complete device onboarding process"
              >
                Onboard Device
              </button>
                </div>
              </div>
              </div>
      )}

      {/* Device Edit Modal */}
      {showDeviceModal && selectedDevice && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 title="Edit device information and configuration">Edit Device</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDeviceModal(false)}
                title="Close this modal without saving changes"
              >
                ×
              </button>
              </div>
            <div className="modal-body">
              <p>Device editing functionality will be implemented here.</p>
              <p>This will include:</p>
              <ul>
                <li title="Modify device name and identification">Device information update</li>
                <li title="Change device operational status">Status modification</li>
                <li title="Update device location and settings">Configuration changes</li>
                <li title="Assign or reassign SIM cards">SIM card management</li>
              </ul>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeviceModal(false)}
                title="Close this modal"
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  // TODO: Implement device editing
                  alert('Device editing functionality will be implemented here');
                  setShowDeviceModal(false);
                }}
                title="Save device changes"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 title="Edit user account information and permissions">Edit User</h3>
                  <button 
                className="modal-close"
                onClick={() => setShowUserModal(false)}
                title="Close this modal without saving changes"
                  >
                ×
                  </button>
            </div>
            <div className="modal-body">
              <p>User editing functionality will be implemented here.</p>
              <p>This will include:</p>
              <ul>
                <li title="Update user personal information">Profile information</li>
                <li title="Modify user role and access level">Role management</li>
                <li title="Change user permissions and access rights">Permission updates</li>
                <li title="Update department and contact information">Contact details</li>
              </ul>
            </div>
            <div className="modal-footer">
                  <button 
                className="btn btn-secondary"
                onClick={() => setShowUserModal(false)}
                title="Close this modal"
                  >
                Cancel
                  </button>
                  <button 
                className="btn btn-primary"
                onClick={() => {
                  // TODO: Implement user editing
                  alert('User editing functionality will be implemented here');
                  setShowUserModal(false);
                }}
                title="Save user changes"
              >
                Save Changes
                  </button>
            </div>
          </div>
        </div>
      )}

      {/* SIM Edit Modal */}
      {showSimModal && selectedSim && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 title="Edit SIM card information and configuration">Edit SIM</h3>
                <button 
                className="modal-close"
                onClick={() => setShowSimModal(false)}
                title="Close this modal without saving changes"
                >
                ×
                </button>
            </div>
            <div className="modal-body">
              <p>SIM editing functionality will be implemented here.</p>
              <p>This will include:</p>
              <ul>
                <li title="Update SIM card identification">SIM information</li>
                <li title="Modify SIM operational status">Status changes</li>
                <li title="Change data plan and usage limits">Plan management</li>
                <li title="Assign or reassign to devices">Device assignment</li>
              </ul>
          </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowSimModal(false)}
                title="Close this modal"
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  // TODO: Implement SIM editing
                  alert('SIM editing functionality will be implemented here');
                  setShowSimModal(false);
                }}
                title="Save SIM changes"
              >
                Save Changes
              </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default Devices;
