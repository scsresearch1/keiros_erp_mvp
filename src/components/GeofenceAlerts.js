import React, { useState, useEffect } from 'react';
import csvDataService from '../services/csvDataService';
import './GeofenceAlerts.css';

const GeofenceAlerts = ({ currentUser }) => {
  const [violations, setViolations] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showViolationDetails, setShowViolationDetails] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load geofences from CSV
        const geofencesData = await csvDataService.getGeofences();
        setGeofences(geofencesData || []);
        
        // Simulate geofence violations based on device data
        const devicesData = await csvDataService.getDevices();
        const simulatedViolations = [];
        
        if (devicesData) {
          devicesData.forEach((device, index) => {
            if (device.geofenceViolations > 0 || Math.random() > 0.7) {
              const violationTypes = ['Zone Exit', 'Zone Entry', 'Speed Violation', 'Idle Time', 'Route Deviation'];
              const severities = ['High', 'Medium', 'Low'];
              const statuses = ['Active', 'Investigating', 'Resolved'];
              
              simulatedViolations.push({
                id: `violation-${device.id}-${index}`,
                deviceId: device.deviceId || 'Unknown',
                deviceName: device.deviceName || 'Unnamed Device',
                violationType: violationTypes[Math.floor(Math.random() * violationTypes.length)],
                severity: severities[Math.floor(Math.random() * severities.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                location: device.location || 'Unknown',
                geofence: device.geofence || 'Default Zone',
                description: `Device ${device.deviceName || device.deviceId} violated geofence boundaries`,
                coordinates: {
                  lat: device.latitude || 0,
                  lng: device.longitude || 0
                }
              });
            }
          });
        }
        
        setViolations(simulatedViolations);
        
      } catch (error) {
        console.error('Failed to load geofence data:', error);
        setError('Failed to load geofence violation data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const canViewGeofences = ['admin', 'operator', 'manager', 'supervisor'].includes(currentUser.level);

  if (!canViewGeofences) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🚫</div>
        <div className="empty-state-title">Access Denied</div>
        <div className="empty-state-description">
          You don't have permission to view geofence alerts.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <span className="loading-spinner"></span>
        Loading geofence alerts...
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
            title="Reload the page to try again"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const filteredViolations = violations.filter(violation => {
    if (!violation) return false;
    const matchesSeverity = filterSeverity === 'all' || (violation.severity || 'Unknown') === filterSeverity;
    const matchesStatus = filterStatus === 'all' || (violation.status || 'Unknown') === filterStatus;
    return matchesSeverity && matchesStatus;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return '#ff6b6b';
      case 'Medium': return '#ffa500';
      case 'Low': return '#00d4ff';
      default: return '#b0b0b0';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#ff6b6b';
      case 'Resolved': return '#00ff88';
      case 'Investigating': return '#ffa500';
      default: return '#b0b0b0';
    }
  };

  const getViolationIcon = (violationType) => {
    switch (violationType) {
      case 'Zone Exit': return '🚪';
      case 'Zone Entry': return '🚪';
      case 'Speed Violation': return '🚗';
      case 'Idle Time': return '⏰';
      case 'Route Deviation': return '🛣️';
      default: return '⚠️';
    }
  };

  const handleResolveViolation = (violationId) => {
    setViolations(prev => prev.map(v => 
      v.id === violationId ? { ...v, status: 'Resolved' } : v
    ));
  };

  const handleInvestigateViolation = (violationId) => {
    setViolations(prev => prev.map(v => 
      v.id === violationId ? { ...v, status: 'Investigating' } : v
    ));
  };

  const getViolationStats = () => {
    const totalViolations = violations.length;
    const activeViolations = violations.filter(v => v.status === 'Active').length;
    const highSeverity = violations.filter(v => v.severity === 'High').length;
    const resolvedViolations = violations.filter(v => v.status === 'Resolved').length;

    return {
      totalViolations,
      activeViolations,
      highSeverity,
      resolvedViolations
    };
  };

  const stats = getViolationStats();

  return (
    <div className="geofence-content">
      <div className="content-header">
        <h1 className="content-title" title="Monitor and manage geofence boundary violations in real-time">Geofence Alerts & Violations</h1>
        <p className="content-subtitle" title="Track device movements and respond to boundary violations">
          Monitor real-time geofence violations and manage alert responses
        </p>
      </div>

      {/* Alert Statistics */}
      <div className="alert-stats" title="Overview of current geofence violation statistics">
        <div className="stats-grid">
          <div className="stat-card critical" title="Total number of geofence violations detected">
            <div className="stat-icon">🚨</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalViolations}</div>
              <div className="stat-label">Total Violations</div>
            </div>
          </div>
          
          <div className="stat-card warning" title="Currently active violations requiring attention">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.activeViolations}</div>
              <div className="stat-label">Active Alerts</div>
            </div>
          </div>
          
          <div className="stat-card danger" title="High priority violations that need immediate action">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.highSeverity}</div>
              <div className="stat-label">High Severity</div>
            </div>
          </div>
          
          <div className="stat-card success" title="Violations that have been successfully resolved">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.resolvedViolations}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Geofence Overview */}
      <div className="geofence-overview" title="Current status of all geofence zones">
        <div className="section-header">
          <h2 title="Overview of all geofence zones and their current status">Geofence Zones Status</h2>
        </div>
        
        <div className="geofence-grid">
          {(geofences || []).map(geofence => (
            <div key={geofence.id} className="geofence-card" title={`Geofence zone: ${geofence.geofenceName || 'Unknown'}`}>
              <div className="geofence-header">
                <h3>{geofence.geofenceName || 'Unknown Zone'}</h3>
                <span className={`status-badge ${(geofence.status || 'Unknown').toLowerCase()}`}>
                  {geofence.status || 'Unknown'}
                </span>
              </div>
              <div className="geofence-details">
                <p><strong>Type:</strong> {geofence.type || 'Unknown'}</p>
                <p><strong>Radius:</strong> {geofence.radius || 0}m</p>
                <p><strong>Devices:</strong> {(geofence.assignedDevices || []).length}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Violations Table */}
      <div className="violations-section" title="Detailed list of all geofence violations with filtering options">
        <div className="section-header">
          <h2 title="Filter and view all geofence violations">Violations Management</h2>
          
          <div className="filter-controls" title="Filter violations by severity level and status">
            <select 
              value={filterSeverity} 
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="form-input"
              title="Filter violations by their severity level (High, Medium, Low)"
            >
              <option value="all">All Severities</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="Low">Low Severity</option>
            </select>
            
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input"
              title="Filter violations by their current status (Active, Investigating, Resolved)"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Investigating">Investigating</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="violations-table-container">
          <table className="violations-table">
            <thead>
              <tr>
                <th title="Type of geofence violation that occurred">Violation Type</th>
                <th title="Device that triggered the violation">Device</th>
                <th title="Severity level of the violation">Severity</th>
                <th title="Current status of the violation">Status</th>
                <th title="Location where violation occurred">Location</th>
                <th title="When the violation was detected">Timestamp</th>
                <th title="Available actions for this violation">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredViolations.map(violation => (
                <tr key={violation.id} className={`violation-row ${(violation.status || 'Unknown').toLowerCase()}`}>
                  <td title={`Violation type: ${violation.violationType || 'Unknown'}`}>
                    <span className="violation-type">
                      {getViolationIcon(violation.violationType)} {violation.violationType || 'Unknown'}
                    </span>
                  </td>
                  <td title={`Device: ${violation.deviceName || 'Unknown'} (${violation.deviceId || 'Unknown'})`}>
                    <div className="device-info">
                      <strong>{violation.deviceName || 'Unknown Device'}</strong>
                      <small>{violation.deviceId || 'Unknown ID'}</small>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="severity-badge" 
                      style={{ color: getSeverityColor(violation.severity) }}
                      title={`Severity: ${violation.severity || 'Unknown'} - ${(violation.severity || 'Unknown') === 'High' ? 'Immediate action required' : (violation.severity || 'Unknown') === 'Medium' ? 'Action needed soon' : 'Monitor situation'}`}
                    >
                      {violation.severity || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ color: getStatusColor(violation.status) }}
                      title={`Status: ${violation.status || 'Unknown'} - ${(violation.status || 'Unknown') === 'Active' ? 'Requires attention' : (violation.status || 'Unknown') === 'Investigating' ? 'Under review' : 'Issue resolved'}`}
                    >
                      {violation.status || 'Unknown'}
                    </span>
                  </td>
                  <td title={`Location: ${violation.location || 'Unknown'}`}>{violation.location || 'Unknown'}</td>
                  <td title={`Detected: ${violation.timestamp ? new Date(violation.timestamp).toLocaleString() : 'Unknown'}`}>
                    {violation.timestamp ? new Date(violation.timestamp).toLocaleString() : 'Unknown'}
                  </td>
                  <td className="action-buttons">
                    <button 
                      className="btn btn-info btn-xs"
                      onClick={() => {
                        setSelectedViolation(violation);
                        setShowViolationDetails(true);
                      }}
                      title="View detailed information about this violation"
                    >
                      👁️
                    </button>
                    
                    {(violation.status || 'Unknown') === 'Active' && (
                      <>
                        <button 
                          className="btn btn-warning btn-xs"
                          onClick={() => handleInvestigateViolation(violation.id)}
                          title="Mark this violation as under investigation"
                        >
                          🔍
                        </button>
                        
                        <button 
                          className="btn btn-success btn-xs"
                          onClick={() => handleResolveViolation(violation.id)}
                          title="Mark this violation as resolved"
                        >
                          ✅
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Violation Details Modal */}
      {showViolationDetails && selectedViolation && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 title={`Detailed information for violation: ${selectedViolation.violationType || 'Unknown'}`}>
                Violation Details: {selectedViolation.violationType || 'Unknown'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowViolationDetails(false)}
                title="Close this modal"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="violation-details">
                <p><strong>Device:</strong> {selectedViolation.deviceName || 'Unknown'} ({selectedViolation.deviceId || 'Unknown'})</p>
                <p><strong>Violation Type:</strong> {selectedViolation.violationType || 'Unknown'}</p>
                <p><strong>Severity:</strong> 
                  <span className="severity-badge" style={{ color: getSeverityColor(selectedViolation.severity) }}>
                    {selectedViolation.severity || 'Unknown'}
                  </span>
                </p>
                <p><strong>Status:</strong> 
                  <span className="status-badge" style={{ color: getStatusColor(selectedViolation.status) }}>
                    {selectedViolation.status || 'Unknown'}
                  </span>
                </p>
                <p><strong>Location:</strong> {selectedViolation.location || 'Unknown'}</p>
                <p><strong>Geofence:</strong> {selectedViolation.geofence || 'Unknown'}</p>
                <p><strong>Timestamp:</strong> {selectedViolation.timestamp ? new Date(selectedViolation.timestamp).toLocaleString() : 'Unknown'}</p>
                <p><strong>Description:</strong> {selectedViolation.description || 'No description available'}</p>
                
                {selectedViolation.coordinates && (
                  <p><strong>Coordinates:</strong> {selectedViolation.coordinates.lat || 0}, {selectedViolation.coordinates.lng || 0}</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {(selectedViolation.status || 'Unknown') === 'Active' && (
                <>
                  <button 
                    className="btn btn-warning"
                    onClick={() => {
                      handleInvestigateViolation(selectedViolation.id);
                      setShowViolationDetails(false);
                    }}
                    title="Mark this violation as under investigation"
                  >
                    🔍 Investigate
                  </button>
                  
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      handleResolveViolation(selectedViolation.id);
                      setShowViolationDetails(false);
                    }}
                    title="Mark this violation as resolved"
                  >
                    ✅ Resolve
                  </button>
                </>
              )}
              
              <button 
                className="btn btn-secondary"
                onClick={() => setShowViolationDetails(false)}
                title="Close this modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeofenceAlerts;
