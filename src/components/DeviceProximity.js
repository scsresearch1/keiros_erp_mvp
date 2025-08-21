import React, { useState, useEffect } from 'react';
import csvDataService from '../services/csvDataService';
import './DeviceProximity.css';

const DeviceProximity = ({ currentUser }) => {
  const [proximityData, setProximityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [filterProximity, setFilterProximity] = useState('all');
  const [showProximityDetails, setShowProximityDetails] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const loadProximityData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate user's current location (in real app, this would come from GPS/Bluetooth)
        const mockUserLocation = {
          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
          lng: -74.0060 + (Math.random() - 0.5) * 0.1
        };
        setUserLocation(mockUserLocation);
        
        // Get proximity data for current user
        const proximity = await csvDataService.getDeviceProximity(currentUser.id);
        setProximityData(proximity);
        
      } catch (error) {
        console.error('Failed to load proximity data:', error);
        setError('Failed to load proximity data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadProximityData();
    
    // Simulate real-time updates every 10 seconds
    const interval = setInterval(() => {
      loadProximityData();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser.id]);

  const canViewProximity = ['admin', 'operator', 'manager', 'supervisor', 'analyst'].includes(currentUser.level);

  if (!canViewProximity) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🚫</div>
        <div className="empty-state-title">Access Denied</div>
        <div className="empty-state-description">
          You don't have permission to view device proximity information.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <span className="loading-spinner"></span>
        Loading proximity data...
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

  const filteredProximity = proximityData.filter(item => {
    if (filterProximity === 'all') return true;
    return item.proximity === filterProximity;
  });

  const getProximityColor = (proximity) => {
    switch (proximity) {
      case 'Very Close': return '#00ff88';
      case 'Close': return '#00d4ff';
      case 'Nearby': return '#ffa500';
      case 'Far': return '#ff6b6b';
      default: return '#b0b0b0';
    }
  };

  const getProximityIcon = (proximity) => {
    switch (proximity) {
      case 'Very Close': return '📱';
      case 'Close': return '📶';
      case 'Nearby': return '📡';
      case 'Far': return '🌐';
      default: return '❓';
    }
  };

  const getDistanceColor = (distance) => {
    if (distance < 100) return '#00ff88';
    if (distance < 500) return '#00d4ff';
    if (distance < 1000) return '#ffa500';
    return '#ff6b6b';
  };

  const getProximityStats = () => {
    const totalDevices = proximityData.length;
    const veryClose = proximityData.filter(item => item.proximity === 'Very Close').length;
    const close = proximityData.filter(item => item.proximity === 'Close').length;
    const nearby = proximityData.filter(item => item.proximity === 'Nearby').length;
    const far = proximityData.filter(item => item.proximity === 'Far').length;

    return {
      totalDevices,
      veryClose,
      close,
      nearby,
      far
    };
  };

  const stats = getProximityStats();

  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
    setShowProximityDetails(true);
  };

  const handleNavigateToDevice = (device) => {
    // Simulate navigation to device
    console.log(`Navigating to device: ${device.deviceName}`);
    // In real app, this would open navigation app or show route
  };

  const handleRefreshLocation = () => {
    // Simulate refreshing user location
    const newLocation = {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1
    };
    setUserLocation(newLocation);
    
    // Recalculate proximity with new location
    const recalculatedProximity = proximityData.map(item => {
      const distance = csvDataService.calculateDistance(
        newLocation.lat, newLocation.lng,
        item.deviceLocation.lat, item.deviceLocation.lng
      );
      
      return {
        ...item,
        distance: Math.round(distance),
        proximity: distance < 100 ? 'Very Close' : 
                  distance < 500 ? 'Close' : 
                  distance < 1000 ? 'Nearby' : 'Far',
        userLocation: newLocation
      };
    });
    
    setProximityData(recalculatedProximity);
  };

  return (
    <div className="device-proximity">
      <div className="content-header">
        <h1 className="content-title">Device Proximity Monitor</h1>
        <p className="content-subtitle">
          Monitor your distance to assigned devices in real-time
        </p>
      </div>

      {/* User Location Display */}
      <div className="user-location-section">
        <div className="location-header">
          <h2>Your Current Location</h2>
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleRefreshLocation}
          >
            🔄 Refresh Location
          </button>
        </div>
        
        {userLocation && (
          <div className="location-display">
            <div className="location-coordinates">
              <span className="coordinate-label">Latitude:</span>
              <span className="coordinate-value">{userLocation.lat.toFixed(6)}</span>
              <span className="coordinate-label">Longitude:</span>
              <span className="coordinate-value">{userLocation.lng.toFixed(6)}</span>
            </div>
            <div className="location-status">
              <span className="status-indicator online">🟢</span>
              <span className="status-text">GPS Active</span>
            </div>
          </div>
        )}
      </div>

      {/* Proximity Statistics */}
      <div className="proximity-stats">
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">📱</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalDevices}</div>
              <div className="stat-label">Total Devices</div>
            </div>
          </div>
          
          <div className="stat-card very-close">
            <div className="stat-icon">📱</div>
            <div className="stat-content">
              <div className="stat-value">{stats.veryClose}</div>
              <div className="stat-label">Very Close</div>
            </div>
          </div>
          
          <div className="stat-card close">
            <div className="stat-icon">📶</div>
            <div className="stat-content">
              <div className="stat-value">{stats.close}</div>
              <div className="stat-label">Close</div>
            </div>
          </div>
          
          <div className="stat-card nearby">
            <div className="stat-icon">📡</div>
            <div className="stat-content">
              <div className="stat-value">{stats.nearby}</div>
              <div className="stat-label">Nearby</div>
            </div>
          </div>
          
          <div className="stat-card far">
            <div className="stat-icon">🌐</div>
            <div className="stat-content">
              <div className="stat-value">{stats.far}</div>
              <div className="stat-label">Far</div>
            </div>
          </div>
        </div>
      </div>

      {/* Proximity Controls */}
      <div className="proximity-controls">
        <div className="section-header">
          <h2>Device Proximity</h2>
          <div className="section-controls">
            <select
              className="form-input filter-select"
              value={filterProximity}
              onChange={(e) => setFilterProximity(e.target.value)}
            >
              <option value="all">All Proximities</option>
              <option value="Very Close">Very Close</option>
              <option value="Close">Close</option>
              <option value="Nearby">Nearby</option>
              <option value="Far">Far</option>
            </select>
            
            <button className="btn btn-secondary btn-sm">
              📍 Center on Map
            </button>
          </div>
        </div>
      </div>

      {/* Proximity List */}
      <div className="proximity-list">
        {filteredProximity.length === 0 ? (
          <div className="empty-proximity">
            <div className="empty-icon">📱</div>
            <div className="empty-title">No Devices Found</div>
            <div className="empty-description">
              No devices are currently assigned to your account.
            </div>
          </div>
        ) : (
          filteredProximity.map((item, index) => (
            <div key={item.deviceId} className={`proximity-card ${item.proximity.toLowerCase().replace(' ', '-')}`}>
              <div className="proximity-header">
                <div className="proximity-icon">
                  {getProximityIcon(item.proximity)}
                </div>
                <div className="proximity-info">
                  <div className="device-name">{item.deviceName}</div>
                  <div className="device-type">{item.deviceType}</div>
                </div>
                <div className="proximity-meta">
                  <span 
                    className={`proximity-badge ${item.proximity.toLowerCase().replace(' ', '-')}`}
                    style={{ color: getProximityColor(item.proximity) }}
                  >
                    {item.proximity}
                  </span>
                  <div className="distance-meter">
                    <span 
                      className="distance-value"
                      style={{ color: getDistanceColor(item.distance) }}
                    >
                      {item.distance}m
                    </span>
                    <span className="distance-unit">away</span>
                  </div>
                </div>
              </div>
              
              <div className="proximity-details">
                <div className="detail-row">
                  <span className="detail-label">Device ID:</span>
                  <span className="detail-value">{item.deviceId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">
                    {new Date(item.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Signal Strength:</span>
                  <span className="detail-value">
                    {item.distance < 100 ? 'Strong' : 
                     item.distance < 500 ? 'Good' : 
                     item.distance < 1000 ? 'Fair' : 'Weak'}
                  </span>
                </div>
              </div>
              
              <div className="proximity-actions">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDeviceSelect(item)}
                >
                  View Details
                </button>
                
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleNavigateToDevice(item)}
                >
                  🧭 Navigate
                </button>
                
                <button className="btn btn-info btn-sm">
                  📍 Track on Map
                </button>
              </div>
              
              {/* Proximity Indicator Bar */}
              <div className="proximity-indicator">
                <div className="indicator-bar">
                  <div 
                    className="indicator-fill"
                    style={{ 
                      width: `${Math.min((1000 - item.distance) / 10, 100)}%`,
                      backgroundColor: getProximityColor(item.proximity)
                    }}
                  ></div>
                </div>
                <div className="indicator-labels">
                  <span className="label-close">Very Close</span>
                  <span className="label-far">Far</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Proximity Details Modal */}
      {showProximityDetails && selectedDevice && (
        <div className="modal-overlay" onClick={() => setShowProximityDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Device Proximity Details</h3>
              <button 
                className="modal-close"
                onClick={() => setShowProximityDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="proximity-detail-grid">
                <div className="detail-group">
                  <label>Device Information</label>
                  <div className="detail-content">
                    <p><strong>Name:</strong> {selectedDevice.deviceName}</p>
                    <p><strong>ID:</strong> {selectedDevice.deviceId}</p>
                    <p><strong>Type:</strong> {selectedDevice.deviceType}</p>
                  </div>
                </div>
                
                <div className="detail-group">
                  <label>Proximity Details</label>
                  <div className="detail-content">
                    <p><strong>Distance:</strong> {selectedDevice.distance}m</p>
                    <p><strong>Proximity:</strong> {selectedDevice.proximity}</p>
                    <p><strong>Signal:</strong> {selectedDevice.distance < 100 ? 'Strong' : 
                     selectedDevice.distance < 500 ? 'Good' : 
                     selectedDevice.distance < 1000 ? 'Fair' : 'Weak'}</p>
                  </div>
                </div>
                
                <div className="detail-group">
                  <label>Your Location</label>
                  <div className="detail-content">
                    <p><strong>Latitude:</strong> {selectedDevice.userLocation.lat.toFixed(6)}</p>
                    <p><strong>Longitude:</strong> {selectedDevice.userLocation.lng.toFixed(6)}</p>
                    <p><strong>Accuracy:</strong> ±5m</p>
                  </div>
                </div>
                
                <div className="detail-group">
                  <label>Device Location</label>
                  <div className="detail-content">
                    <p><strong>Latitude:</strong> {selectedDevice.deviceLocation.lat.toFixed(6)}</p>
                    <p><strong>Longitude:</strong> {selectedDevice.deviceLocation.lng.toFixed(6)}</p>
                    <p><strong>Last Updated:</strong> {new Date(selectedDevice.lastUpdated).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Proximity Visualization */}
              <div className="proximity-visualization">
                <h4>Proximity Visualization</h4>
                <div className="visualization-container">
                  <div className="user-position">
                    <span className="position-icon">👤</span>
                    <span className="position-label">You</span>
                  </div>
                  
                  <div className="distance-line">
                    <div 
                      className="distance-fill"
                      style={{ 
                        width: `${Math.min((1000 - selectedDevice.distance) / 10, 100)}%`,
                        backgroundColor: getProximityColor(selectedDevice.proximity)
                      }}
                    ></div>
                  </div>
                  
                  <div className="device-position">
                    <span className="position-icon">📱</span>
                    <span className="position-label">{selectedDevice.deviceName}</span>
                  </div>
                </div>
                
                <div className="distance-info">
                  <span className="distance-text">
                    {selectedDevice.distance}m away
                  </span>
                  <span className="proximity-text">
                    ({selectedDevice.proximity})
                  </span>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowProximityDetails(false)}
              >
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleNavigateToDevice(selectedDevice)}
              >
                🧭 Navigate to Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceProximity;
