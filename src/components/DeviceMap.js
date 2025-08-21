import React, { useState, useEffect, useRef } from 'react';
import csvDataService from '../services/csvDataService';
import './DeviceMap.css';

const DeviceMap = ({ devices, selectedDevice, onDeviceSelect, showGeofences = true }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        setLoading(true);
        
        // Check if Leaflet is available, load dynamically if not
        if (typeof L === 'undefined') {
          await loadLeaflet();
        }

        const mapInstance = L.map(mapRef.current).setView([40.7128, -74.0060], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(mapInstance);

        setMap(mapInstance);
        
        // Load geofences from CSV service
        try {
          const geofencesData = await csvDataService.getGeofences();
          setGeofences(geofencesData);
        } catch (error) {
          console.warn('Failed to load geofences, using fallback:', error);
          // Fallback to basic geofences if CSV loading fails
          setGeofences([
            {
              id: 1,
              geofenceName: 'Warehouse Zone A',
              centerLatitude: 40.7128,
              centerLongitude: -74.0060,
              radius: 500,
              zoneType: 'Industrial',
              status: 'Active'
            },
            {
              id: 2,
              geofenceName: 'Office Zone',
              centerLatitude: 40.7589,
              centerLongitude: -73.9851,
              radius: 300,
              zoneType: 'Commercial',
              status: 'Active'
            },
            {
              id: 3,
              geofenceName: 'Delivery Zone North',
              centerLatitude: 40.7505,
              centerLongitude: -73.9934,
              radius: 1000,
              zoneType: 'Logistics',
              status: 'Active'
            }
          ]);
        }
        
      } catch (error) {
        console.error('Failed to initialize map:', error);
        setError('Failed to load map. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (map && devices) {
      updateMarkers();
    }
  }, [map, devices]);

  useEffect(() => {
    if (map && geofences.length > 0) {
      drawGeofences();
    }
  }, [map, geofences]);

  const loadLeaflet = async () => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    
    return new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const updateMarkers = () => {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    const newMarkers = [];

    devices.forEach(device => {
      // Use device coordinates from CSV data
      const lat = parseFloat(device.latitude) || 40.7128;
      const lng = parseFloat(device.longitude) || -74.0060;
      
      if (lat && lng) {
        const marker = L.marker([lat, lng], {
          icon: createDeviceIcon(device)
        }).addTo(map);

        // Add popup with device information
        marker.bindPopup(createDevicePopup(device));
        
        // Add click event
        marker.on('click', () => {
          if (onDeviceSelect) {
            onDeviceSelect(device);
          }
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);
  };

  const createDeviceIcon = (device) => {
    const iconHtml = `
      <div class="custom-device-marker ${device.isOnline ? 'online' : 'offline'} ${device.status === 'Pending Approval' ? 'pending' : ''}">
        <div class="marker-icon">${getDeviceIcon(device.deviceType)}</div>
        <div class="marker-status">${device.status}</div>
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'device-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'GPS Tracker': return '🚚';
      case 'IoT Sensor': return '📡';
      case 'Access Control': return '🔐';
      case 'Security Camera': return '📹';
      default: return '📱';
    }
  };

  const createDevicePopup = (device) => {
    return `
      <div class="device-popup">
        <h3>${device.deviceName}</h3>
        <p><strong>ID:</strong> ${device.deviceId}</p>
        <p><strong>Type:</strong> ${device.deviceType}</p>
        <p><strong>Status:</strong> <span style="color: ${device.status === 'Active' ? 'green' : device.status === 'Pending Approval' ? 'orange' : 'red'}">${device.status}</span></p>
        <p><strong>Location:</strong> ${device.location}</p>
        <p><strong>Battery:</strong> ${device.batteryLevel}%</p>
        <p><strong>Signal:</strong> ${device.signalStrength}</p>
        <p><strong>Last Seen:</strong> ${new Date(device.lastSeen).toLocaleString()}</p>
        <div class="popup-actions">
          <button onclick="console.log('Track device: ${device.deviceId}')" class="btn btn-primary btn-sm">Track</button>
          <button onclick="console.log('View details: ${device.deviceId}')" class="btn btn-secondary btn-sm">Details</button>
        </div>
      </div>
    `;
  };

  const drawGeofences = () => {
    geofences.forEach(geofence => {
      if (geofence.status === 'Active') {
        const center = [geofence.centerLatitude, geofence.centerLongitude];
        const radius = geofence.radius || 500;
        
        // Create circle for geofence
        const circle = L.circle(center, {
          radius: radius,
          color: getGeofenceColor(geofence.zoneType),
          fillColor: getGeofenceColor(geofence.zoneType),
          fillOpacity: 0.1,
          weight: 2
        }).addTo(map);

        // Add label for geofence
        const label = L.marker(center, {
          icon: L.divIcon({
            html: `<div class="geofence-label">${geofence.geofenceName}</div>`,
            className: 'geofence-label-marker',
            iconSize: [120, 30],
            iconAnchor: [60, 15]
          })
        }).addTo(map);

        // Add to markers array for cleanup
        setMarkers(prev => [...prev, circle, label]);
      }
    });
  };

  const getGeofenceColor = (zoneType) => {
    switch (zoneType) {
      case 'Industrial': return '#3498db';
      case 'Commercial': return '#e74c3c';
      case 'Logistics': return '#2ecc71';
      case 'Residential': return '#f39c12';
      default: return '#9b59b6';
    }
  };

  const centerOnDevice = (deviceId) => {
    const device = devices.find(d => d.deviceId === deviceId);
    if (device && map) {
      const lat = parseFloat(device.latitude) || 40.7128;
      const lng = parseFloat(device.longitude) || -74.0060;
      map.setView([lat, lng], 15);
    }
  };

  const toggleGeofences = () => {
    // Implementation for toggling geofence visibility
    console.log('Toggle geofences');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <span className="loading-spinner"></span>
        Loading map...
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
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="device-map-container">
      <div className="map-controls">
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => map.setView([40.7128, -74.0060], 13)}
        >
          Reset View
        </button>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={toggleGeofences}
        >
          {showGeofences ? 'Hide' : 'Show'} Geofences
        </button>
        {selectedDevice && (
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => centerOnDevice(selectedDevice.deviceId)}
          >
            Center on Selected
          </button>
        )}
      </div>

      <div className="device-map" ref={mapRef}></div>

      <div className="map-legend">
        <h4>Legend</h4>
        <div className="legend-item">
          <span className="legend-icon online">📱</span>
          <span>Online Device</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon offline">📱</span>
          <span>Offline Device</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon pending">📱</span>
          <span>Pending Approval</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#3498db' }}></span>
          <span>Industrial Zone</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#e74c3c' }}></span>
          <span>Commercial Zone</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#2ecc71' }}></span>
          <span>Logistics Zone</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceMap;
