import React, { useState, useEffect } from 'react';
import firebaseService from '../services/firebaseService';
import './Login.css';

const DevicesLanding = () => {
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceData, setDeviceData] = useState(null);
  const [loadingDeviceData, setLoadingDeviceData] = useState(false);

  // Fetch devices from Firebase on component mount - RAW DATA ONLY
  useEffect(() => {
    const loadDevices = async () => {
      try {
        setDevicesLoading(true);
        // Fetch raw root data from Firebase
        const rootData = await firebaseService.fetchData('');
        
        if (!rootData || typeof rootData !== 'object') {
          setDevices([]);
          return;
        }
        
        // Get MAC addresses (device IDs) from root
        const macAddresses = Object.keys(rootData);
        
        // For each MAC address, get basic info without normalization
        const devicesList = macAddresses.map(macAddress => {
          const deviceData = rootData[macAddress];
          const timestamps = Object.keys(deviceData || {}).sort().reverse();
          const latestTimestamp = timestamps[0];
          const latestData = latestTimestamp ? deviceData[latestTimestamp] : null;
          
          return {
            id: macAddress,
            macAddress: macAddress,
            name: `Device ${macAddress}`,
            status: latestData ? 'Active' : 'Offline',
            latestTimestamp: latestTimestamp,
            latestData: latestData,
            entryCount: timestamps.length,
            lastUpdate: latestTimestamp ? firebaseService.parseTimestamp(latestTimestamp) : null,
            location: latestData ? {
              lat: latestData.latitude && latestData.latitude !== 'N/a' ? parseFloat(latestData.latitude) : null,
              lng: latestData.longitude && latestData.longitude !== 'N/a' ? parseFloat(latestData.longitude) : null,
              altitude: latestData.altitude && latestData.altitude !== 'N/a' ? parseFloat(latestData.altitude) : null
            } : null
          };
        });
        
        setDevices(devicesList);
      } catch (err) {
        console.error('[DevicesLanding] Error loading devices:', err);
        setDevices([]);
      } finally {
        setDevicesLoading(false);
      }
    };

    loadDevices();
    
    // Refresh devices every 30 seconds
    const interval = setInterval(loadDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch full Firebase data for a device when clicked
  const handleDeviceClick = async (device) => {
    try {
      setLoadingDeviceData(true);
      setSelectedDevice(device);
      
      // Fetch all timestamped entries for this device from Firebase
      const macAddress = device.id || device.macAddress || device.deviceId;
      const rawData = await firebaseService.fetchData(macAddress);
      
      // Get all timestamps
      const timestamps = rawData ? Object.keys(rawData).sort().reverse() : [];
      
      // Build complete device data object
      const completeDeviceData = {
        macAddress: macAddress,
        deviceInfo: device,
        timestamps: timestamps.map(ts => ({
          timestamp: ts,
          data: rawData[ts],
          parsedDate: firebaseService.parseTimestamp(ts)
        })),
        totalEntries: timestamps.length,
        latestEntry: timestamps.length > 0 ? {
          timestamp: timestamps[0],
          data: rawData[timestamps[0]],
          parsedDate: firebaseService.parseTimestamp(timestamps[0])
        } : null
      };
      
      setDeviceData(completeDeviceData);
    } catch (err) {
      console.error('[DevicesLanding] Error loading device data:', err);
      setDeviceData({ error: 'Failed to load device data' });
    } finally {
      setLoadingDeviceData(false);
    }
  };

  const closeDeviceModal = () => {
    setSelectedDevice(null);
    setDeviceData(null);
  };

  return (
    <div className="landing-container">
      {/* Background */}
      <div className="landing-background">
        <div className="background-pattern"></div>
        <div className="background-overlay"></div>
      </div>

      {/* Main Content - Only Devices */}
      <div className="landing-content">
        <div className="landing-header">
          <h1 className="landing-title">Keiros Device Tracking</h1>
          <p className="landing-subtitle">Real-time device monitoring from Firebase</p>
        </div>

        {devicesLoading ? (
          <div className="devices-loading-full">
            <div className="spinner-large"></div>
            <span>Loading devices from Firebase...</span>
          </div>
        ) : devices.length > 0 ? (
          <div className="devices-grid-landing">
            {devices.map((device) => (
              <div 
                key={device.id || device.macAddress || device.deviceId} 
                className="device-card-landing-clickable"
                onClick={() => handleDeviceClick(device)}
              >
                <div className="device-card-header">
                  <div className="device-icon-large-landing">
                    {device.status === 'Active' ? '🟢' : '🔴'}
                  </div>
                  <div className="device-name-large-landing">
                    {device.name || device.macAddress || device.id}
                  </div>
                </div>
                <div className="device-card-body">
                  <div className="device-status-landing">
                    <span className={`status-badge-landing ${(device.status || 'Offline').toLowerCase()}`}>
                      {device.status || 'Offline'}
                    </span>
                  </div>
                  {device.location && device.location.lat !== null && device.location.lng !== null && (
                    <div className="device-location-full">
                      <span className="location-label">Location:</span>
                      <span className="location-value">
                        {device.location.lat.toFixed(6)}, {device.location.lng.toFixed(6)}
                      </span>
                    </div>
                  )}
                  {device.lastUpdate && (
                    <div className="device-time-full">
                      <span className="time-label">Last Update:</span>
                      <span className="time-value">
                        {device.lastUpdate instanceof Date 
                          ? Math.round((Date.now() - device.lastUpdate.getTime()) / 60000) + ' min ago'
                          : device.lastUpdate}
                      </span>
                    </div>
                  )}
                  {device.macAddress && (
                    <div className="device-mac">
                      <span className="mac-label">MAC:</span>
                      <span className="mac-value">{device.macAddress}</span>
                    </div>
                  )}
                </div>
                <div className="device-card-footer">
                  <span className="click-hint">Click to view Firebase data →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="devices-empty-full">
            <div className="empty-icon-large">📭</div>
            <h2>No Devices Found</h2>
            <p>No devices are currently available in Firebase database.</p>
            <small>Devices will appear here when data is available.</small>
          </div>
        )}
      </div>

      {/* Device Data Modal */}
      {selectedDevice && (
        <div className="device-modal-overlay" onClick={closeDeviceModal}>
          <div className="device-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="device-modal-header">
              <h2>Firebase Data: {selectedDevice.name || selectedDevice.macAddress || selectedDevice.id}</h2>
              <button className="modal-close-btn" onClick={closeDeviceModal}>×</button>
            </div>
            
            <div className="device-modal-body">
              {loadingDeviceData ? (
                <div className="modal-loading">
                  <div className="spinner"></div>
                  <span>Loading Firebase data...</span>
                </div>
              ) : deviceData?.error ? (
                <div className="modal-error">
                  <div className="error-icon">⚠️</div>
                  <p>{deviceData.error}</p>
                </div>
              ) : deviceData ? (
                <div className="firebase-data-display">
                  <div className="data-section">
                    <h3>Device Information</h3>
                    <div className="data-grid">
                      <div className="data-item">
                        <span className="data-label">MAC Address:</span>
                        <span className="data-value">{deviceData.macAddress}</span>
                      </div>
                      <div className="data-item">
                        <span className="data-label">Total Entries:</span>
                        <span className="data-value">{deviceData.totalEntries}</span>
                      </div>
                      {deviceData.latestEntry && (
                        <>
                          <div className="data-item">
                            <span className="data-label">Latest Timestamp:</span>
                            <span className="data-value">{deviceData.latestEntry.timestamp}</span>
                          </div>
                          <div className="data-item">
                            <span className="data-label">Latest Date:</span>
                            <span className="data-value">
                              {deviceData.latestEntry.parsedDate.toLocaleString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {deviceData.latestEntry && (
                    <div className="data-section">
                      <h3>Latest Entry Data</h3>
                      <div className="data-json">
                        <pre>{JSON.stringify(deviceData.latestEntry.data, null, 2)}</pre>
                      </div>
                    </div>
                  )}

                  <div className="data-section">
                    <h3>All Timestamped Entries ({deviceData.timestamps.length})</h3>
                    <div className="timestamps-list">
                      {deviceData.timestamps.map((entry, index) => (
                        <div key={index} className="timestamp-entry">
                          <div className="timestamp-header">
                            <span className="timestamp-value">{entry.timestamp}</span>
                            <span className="timestamp-date">
                              {entry.parsedDate.toLocaleString()}
                            </span>
                          </div>
                          <div className="timestamp-data">
                            <pre>{JSON.stringify(entry.data, null, 2)}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="data-section">
                    <h3>Raw Firebase Data</h3>
                    <div className="data-json">
                      <pre>{JSON.stringify(deviceData.deviceInfo, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesLanding;

