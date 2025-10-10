import React, { useState, useEffect } from 'react';
import './EndUserDashboard.css';

const EndUserDashboard = ({ currentUser }) => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [userDevices, setUserDevices] = useState([]);
  const [mapType, setMapType] = useState('openstreetmap');
  const [showProximity, setShowProximity] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [geofenceAlerts, setGeofenceAlerts] = useState([]);
  const [showCurrentLocation, setShowCurrentLocation] = useState(false);

  // Initialize user devices with real coordinates and data
  useEffect(() => {
    const mockDevices = [
      {
        id: 'dev_001',
        name: 'Main Office Door Plate',
        type: 'Door Number Plate',
        location: { 
          lat: userLocation?.lat || 17.5212, 
          lng: userLocation?.lng || 78.3964, 
          address: userLocation ? `Current Location (${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)})` : 'Main Office Building, Hyderabad, Telangana 500001',
          accuracy: userLocation?.accuracy || 5
        },
        status: 'Active',
        signal: 85,
        lastSeen: new Date(), // Current time (0 minutes ago)
        lastUpdate: new Date() // Current time (0 minutes ago)
      },
      {
        id: 'dev_002',
        name: 'Branch Office Door Plate',
        type: 'Door Number Plate',
        location: { 
          lat: 18.1203, 
          lng: 78.8906, 
          address: 'Branch Office Complex, Narsapur, Medak District, Telangana 502313',
          accuracy: 3
        },
        status: 'Offline',
        signal: 0,
        lastSeen: new Date(Date.now() - 86400000), // 24 hours ago
        lastUpdate: new Date(Date.now() - 86400000) // 24 hours ago
      },
      {
        id: 'dev_003',
        name: 'Warehouse Door Plate',
        type: 'Door Number Plate',
        location: { 
          lat: 18.1203, 
          lng: 78.8906, 
          address: 'Warehouse Facility, Narsapur, Medak District, Telangana 502313',
          accuracy: 8
        },
        status: 'Offline',
        signal: 0,
        lastSeen: new Date(Date.now() - 86400000), // 24 hours ago
        lastUpdate: new Date(Date.now() - 86400000) // 24 hours ago
      }
    ];
    setUserDevices(mockDevices);
    setSelectedDevice(mockDevices[0]);
  }, [userLocation]);

  // Get user's real location using GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setUserLocation({ 
            lat: latitude, 
            lng: longitude, 
            accuracy: accuracy 
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Hyderabad location instead of New York
          setUserLocation({ lat: 17.5212, lng: 78.3964, accuracy: 12758 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      // Fallback for browsers without geolocation
      setUserLocation({ lat: 17.5212, lng: 78.3964, accuracy: 12758 });
    }
  }, []);

  // Update active device location to match user's current location
  useEffect(() => {
    if (userLocation) {
      setUserDevices(prev => 
        prev.map(device => 
          device.status === 'Active' 
            ? {
                ...device,
                location: {
                  lat: userLocation.lat,
                  lng: userLocation.lng,
                  address: `Current Location (${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)})`,
                  accuracy: userLocation.accuracy
                }
              }
            : device
        )
      );
    }
  }, [userLocation]);

  // Simulate real-time device updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUserDevices(prev => 
        prev.map(device => {
          if (device.status === 'Active') {
            // Only update active device
            return {
              ...device,
              lastSeen: new Date(),
              lastUpdate: new Date(),
              signal: Math.max(0, device.signal - Math.random() * 0.1)
            };
          } else {
            // Don't update offline devices - keep their original timestamps
            return device;
          }
        })
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Check geofence violations in real-time
  useEffect(() => {
    if (!userLocation || !userDevices.length) return;

    const checkGeofences = () => {
      const newAlerts = [];
      
      userDevices.forEach(device => {
        // Skip geofence check for active device since it's at user location
        if (device.status === 'Active') {
          // Active device is at user location, so distance is 0
          const distance = 0;
          
          if (distance <= 100) { // Always true for active device
            const existingAlert = geofenceAlerts.find(
              alert => alert.deviceId === device.id
            );
            
            if (!existingAlert) {
              newAlerts.push({
                id: `alert_${Date.now()}_${device.id}`,
                deviceId: device.id,
                deviceName: device.name,
                type: 'At Location',
                timestamp: new Date(),
                severity: 'info',
                distance: 0
              });
            }
          }
        } else {
          // Check offline devices
          const distance = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            device.location.lat, 
            device.location.lng
          );
          
          if (distance <= 100) { // 100m radius
            const existingAlert = geofenceAlerts.find(
              alert => alert.deviceId === device.id
            );
            
            if (!existingAlert) {
              newAlerts.push({
                id: `alert_${Date.now()}_${device.id}`,
                deviceId: device.id,
                deviceName: device.name,
                type: 'Entered Zone',
                timestamp: new Date(),
                severity: 'info',
                distance: Math.round(distance)
              });
            }
          }
        }
      });

      if (newAlerts.length > 0) {
        setGeofenceAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]); // Keep last 10 alerts
      }
    };

    const interval = setInterval(checkGeofences, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [userLocation, userDevices, geofenceAlerts]);

  const toggleMapType = () => {
    const mapTypes = ['openstreetmap', 'google', 'mapbox'];
    const currentIndex = mapTypes.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % mapTypes.length;
    setMapType(mapTypes[nextIndex]);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const locationInfo = {
            lat: latitude,
            lng: longitude,
            accuracy: accuracy
          };
          setUserLocation(locationInfo);
          setShowCurrentLocation(true);
          
          console.log('Your current location:', latitude, longitude);
          console.log('Accuracy:', accuracy, 'meters');
          
          alert(`Your current location:\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}\nAccuracy: ${Math.round(accuracy)} meters`);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please enable location services.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Calculate real distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Convert to meters
  };

  const getProximityDistance = (deviceLocation) => {
    if (!userLocation || !deviceLocation) return 'Unknown';
    
    // If device is active, it's at user location, so distance is 0
    const activeDevice = userDevices.find(device => device.status === 'Active');
    if (activeDevice && deviceLocation.lat === activeDevice.location.lat && deviceLocation.lng === activeDevice.location.lng) {
      return '0m';
    }
    
    const distance = calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      deviceLocation.lat, 
      deviceLocation.lng
    );
    
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const startNavigation = (device) => {
    // Check if device is active (at current location)
    if (device.status === 'Active') {
      alert('You are already at this device location!');
      return;
    }

    // Show loading message
    alert('Getting your current location for navigation...');

    // Get current location and navigate
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try multiple URL formats to ensure proper starting location
          const url1 = `https://www.google.com/maps/dir/${latitude},${longitude}/${device.location.lat},${device.location.lng}`;
          const url2 = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${device.location.lat},${device.location.lng}&travelmode=driving`;
          const url3 = `https://www.google.com/maps/dir/My+Location/${device.location.lat},${device.location.lng}`;
          
          console.log('=== NAVIGATION DEBUG ===');
          console.log('Your current GPS location:', latitude, longitude);
          console.log('Device destination:', device.location.lat, device.location.lng);
          console.log('Device name:', device.name);
          console.log('Device address:', device.location.address);
          console.log('URL Format 1:', url1);
          console.log('URL Format 2:', url2);
          console.log('URL Format 3:', url3);
          console.log('========================');
          
          // Show confirmation with coordinates and URL options
          const shouldNavigate = window.confirm(
            `Navigate to ${device.name}?\n\n` +
            `From: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n` +
            `To: ${device.location.lat}, ${device.location.lng}\n\n` +
            `Click OK to open Google Maps\n\n` +
            `Note: If starting location is wrong, try clicking "My Location" in Google Maps`
          );
          
          if (shouldNavigate) {
            // Try the "My Location" approach first
            window.open(url3, '_blank');
          }
        },
        (error) => {
          console.error('GPS Error for navigation:', error);
          alert(`Unable to get your current location.\n\nError: ${error.message}\n\nPlease enable location services and try again.`);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0 // Force fresh location
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const refreshDeviceLocations = () => {
    // Simulate refreshing device locations
    setUserDevices(prev => 
      prev.map(device => {
        if (device.status === 'Active') {
          // For active device, update to current user location
          return {
            ...device,
            location: {
              lat: userLocation?.lat || device.location.lat,
              lng: userLocation?.lng || device.location.lng,
              address: userLocation ? `Current Location (${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)})` : device.location.address,
              accuracy: userLocation?.accuracy || device.location.accuracy
            },
            lastUpdate: new Date(),
            signal: Math.max(0, device.signal + (Math.random() - 0.5) * 2)
          };
        } else {
          // For offline devices, don't update timestamps - keep them as 24 hours ago
          return {
            ...device,
            signal: Math.max(0, device.signal + (Math.random() - 0.5) * 2)
          };
        }
      })
    );
  };

  return (
    <div className="end-user-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">Device Tracking Dashboard</h1>
          </div>
          <div className="header-right">
            <div className="notification-bell">
              🔔 <span className="notification-badge">3</span>
            </div>
            <div className="user-profile">
              <span className="user-name">John Smith</span>
              <span className="dropdown-arrow">▼</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Title Section */}
      <div className="main-title-section">
        <h2 className="main-title">My Door Plates Dashboard</h2>
        <p className="main-subtitle">Monitor and track your Keiros door number plate devices in real-time</p>
        <div className="title-controls">
          <button className="map-btn">
            🗺️ OpenStreetMap
          </button>
          <button className={`proximity-btn ${showProximity ? 'active' : ''}`} onClick={() => setShowProximity(!showProximity)}>
            📍 Proximity {showProximity ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-main">
        {/* Left Panel - My Devices */}
        <div className="left-panel">
          <div className="devices-section">
            <div className="section-header">
              <h3 className="section-title">My Devices ({userDevices.length})</h3>
              <button className="refresh-btn" onClick={refreshDeviceLocations}>
                🔄 Refresh
              </button>
            </div>
            <p className="section-description">Track your Keiros door number plate devices in real-time</p>
            
            <div className="devices-list">
              {userDevices.map((device) => (
                <div 
                  key={device.id} 
                  className={`device-card ${selectedDevice?.id === device.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDevice(device)}
                >
                  <div className="device-icon">
                    {device.name.includes('Home') ? '🏠' : device.name.includes('Office') ? '🏢' : '🏭'}
                  </div>
                  <div className="device-info">
                    <h4 className="device-name">{device.name}</h4>
                    <p className="device-address">📍 {device.location.address}</p>
                    <div className="device-stats">
                      <div className="stat-item">
                        <span className="stat-label">Signal:</span>
                        <div className="stat-bar signal-bar">
                          <div 
                            className={`stat-fill ${device.signal > 50 ? 'high' : device.signal > 20 ? 'medium' : 'low'}`}
                            style={{ width: `${device.signal}%` }}
                          ></div>
                        </div>
                        <span className="stat-value">{Math.round(device.signal)}%</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Last Update:</span>
                        <span className="stat-value">
                          {device.lastUpdate instanceof Date ? 
                            Math.round((Date.now() - device.lastUpdate.getTime()) / 60000) + ' min ago' : 
                            'Unknown'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="device-actions">
                      <button className="track-btn" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDevice(device);
                      }}>
                        📍 Track
                      </button>
                      <button className="navigate-btn" onClick={(e) => {
                        e.stopPropagation();
                        startNavigation(device);
                      }}>
                        🧭 Navigate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedDevice && (
              <div className="selected-device-info">
                <span className="selected-label">Selected for tracking</span>
              </div>
            )}
          </div>

          {/* Geofence Management */}
          <div className="geofence-section">
            <h3 className="section-title">Recent Alerts</h3>
            <div className="alerts-list">
              {geofenceAlerts.length > 0 ? (
                geofenceAlerts.map(alert => (
                  <div key={alert.id} className={`alert-item ${alert.severity}`}>
                    <div className="alert-icon">
                      {alert.type === 'Entered Zone' ? '✅' : '⚠️'}
                    </div>
                    <div className="alert-content">
                      <div className="alert-title">{alert.deviceName}</div>
                      <div className="alert-message">
                        {alert.type} 
                        {alert.distance && ` (${alert.distance}m away)`}
                      </div>
                      <div className="alert-time">
                        {alert.timestamp instanceof Date ? 
                          alert.timestamp.toLocaleTimeString() : 
                          alert.timestamp}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-alerts">
                  <div className="no-alerts-icon">🔔</div>
                  <p>No recent alerts</p>
                  <small>Geofence notifications will appear here</small>
                </div>
              )}
            </div>
          </div>

          {/* Geofence Zones */}
          <div className="geofence-section">
            <h3 className="section-title">Geofence Zones</h3>
            <div className="geofence-list">
              {userDevices.map(device => (
                <div key={device.id} className="geofence-item">
                  <div className="geofence-info">
                    <span className="geofence-name">{device.name} Zone</span>
                    <span className="geofence-radius">100m radius</span>
                    <span className="geofence-device">{device.name}</span>
                  </div>
                  <label className="geofence-toggle">
                    <input 
                      type="checkbox" 
                      defaultChecked={device.status === 'Active'}
                      onChange={() => {
                        // Toggle geofence status
                      }}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Live Tracking */}
        <div className="right-panel">
          {/* Device Details Section */}
          <div className="device-details-section">
            <div className="section-header">
              <h3 className="section-title">Device Details</h3>
              <button className="refresh-btn" onClick={refreshDeviceLocations}>
                🔄 Refresh
              </button>
            </div>
            
            {selectedDevice ? (
              <div className="selected-device-card">
                <div className="device-header">
                  <div className="device-icon-large">
                    {selectedDevice.name.includes('Home') ? '🏠' : selectedDevice.name.includes('Office') ? '🏢' : '🏭'}
                  </div>
                  <div className="device-info-large">
                    <h4 className="device-name-large">{selectedDevice.name}</h4>
                    <p className="device-address-large">📍 {selectedDevice.location.address}</p>
                    <div className="device-status-large">
                      <span className={`status-badge-large ${selectedDevice.status.toLowerCase()}`}>
                        {selectedDevice.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="device-stats-large">
                  
                  <div className="stat-item-large">
                    <span className="stat-label-large">Signal Strength</span>
                    <div className="stat-bar-large signal-bar-large">
                      <div 
                        className={`stat-fill-large ${selectedDevice.signal > 50 ? 'high' : selectedDevice.signal > 20 ? 'medium' : 'low'}`}
                        style={{ width: `${selectedDevice.signal}%` }}
                      ></div>
                    </div>
                    <span className="stat-value-large">{Math.round(selectedDevice.signal)}%</span>
                  </div>
                  
                  <div className="stat-item-large">
                    <span className="stat-label-large">Last Update</span>
                    <span className="stat-value-large">
                      {selectedDevice.lastUpdate instanceof Date ? 
                        Math.round((Date.now() - selectedDevice.lastUpdate.getTime()) / 60000) + ' min ago' : 
                        'Unknown'
                      }
                    </span>
                  </div>
                  
                  <div className="stat-item-large">
                    <span className="stat-label-large">GPS Accuracy</span>
                    <span className="stat-value-large">±{selectedDevice.location.accuracy}m</span>
                  </div>
                </div>
                
                <div className="device-actions-large">
                  <button className="track-btn-large" onClick={() => setSelectedDevice(selectedDevice)}>
                    📍 Track Device
                  </button>
                  <button className="navigate-btn-large" onClick={() => startNavigation(selectedDevice)}>
                    🧭 Start Navigation
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-device-selected">
                <div className="no-device-icon">📱</div>
                <h4>No Device Selected</h4>
                <p>Select a device from the left panel to view detailed information</p>
              </div>
            )}
          </div>

          {/* Live Tracking Section */}
          <div className="tracking-section">
            <div className="section-header">
              <h3 className="section-title">Live Door Plate Tracking</h3>
            </div>
            
            <div className="tracking-features">
              <h4>Tracking Features</h4>
              <ul>
                <li>• Your current GPS location</li>
                <li>• Geofence boundaries around door plate zones</li>
                <li>• Route to selected door plate device</li>
                <li>• Traffic conditions and ETA</li>
              </ul>
            </div>

            <div className="tracking-details">
              <h4>System Information</h4>
              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <span className="detail-label">GPS Accuracy:</span>
                <span className="detail-value">{userLocation?.accuracy ? `${Math.round(userLocation.accuracy)}m` : 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🔄</span>
                <span className="detail-label">Live Updates:</span>
                <span className="detail-value">Every 30 seconds</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🏠</span>
                <span className="detail-label">Device Type:</span>
                <span className="detail-value">Keiros Door Number Plates</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🗺️</span>
                <span className="detail-label">Map Type:</span>
                <span className="detail-value">{mapType === 'openstreetmap' ? 'OpenStreetMap (Free)' : mapType === 'google' ? 'Google Maps (Premium)' : 'Mapbox (Premium)'}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="quick-actions-section">
            <div className="section-header">
              <h3 className="section-title">Quick Actions</h3>
            </div>
            
            <div className="action-buttons">
              <button className="action-btn-large" onClick={toggleMapType}>
                🗺️ Switch Map Type
              </button>
              <button className="action-btn-large" onClick={() => setShowProximity(!showProximity)}>
                📍 {showProximity ? 'Hide' : 'Show'} Proximity
              </button>
              <button className="action-btn-large" onClick={getCurrentLocation}>
                📍 Get My Location
              </button>
              <button className="action-btn-large" onClick={refreshDeviceLocations}>
                🔄 Refresh All Devices
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Proximity Indicator (Floating) */}
      {showProximity && selectedDevice && (
        <div className="proximity-indicator">
          <div className="proximity-header">
            <span className="proximity-title">Distance to {selectedDevice.name}</span>
          </div>
          <div className="proximity-value">
            {getProximityDistance(selectedDevice.location)}
          </div>
        </div>
      )}
    </div>
  );
};

export default EndUserDashboard;
