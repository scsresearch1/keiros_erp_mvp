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

  // Helper function to parse numeric value
  const parseNumeric = (value) => {
    if (value === null || value === undefined || value === 'N/a' || value === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  // Helper function to calculate delta between two values
  const calculateDelta = (current, previous) => {
    if (current === null || previous === null) return null;
    return current - previous;
  };

  // Helper function to format delta with sign and color indicator
  const formatDelta = (delta) => {
    if (delta === null) return { text: 'N/A', color: '#64748b', sign: '' };
    const sign = delta >= 0 ? '+' : '';
    const color = delta > 0 ? '#10b981' : delta < 0 ? '#ef4444' : '#64748b';
    return { 
      text: `${sign}${delta.toFixed(6)}`, 
      color: color,
      sign: delta > 0 ? '↑' : delta < 0 ? '↓' : '→'
    };
  };

  // Fetch full Firebase data for a device when clicked
  const handleDeviceClick = async (device) => {
    try {
      setLoadingDeviceData(true);
      setSelectedDevice(device);
      
      // Fetch all timestamped entries for this device from Firebase
      const macAddress = device.id || device.macAddress || device.deviceId;
      const rawData = await firebaseService.fetchData(macAddress);
      
      // Get all timestamps (sorted chronologically - oldest first)
      const timestamps = rawData ? Object.keys(rawData).sort() : [];
      
      // Process entries with location data (oldest to newest), filter out N/A values
      const processedEntries = timestamps
        .map((ts, index) => {
          const entryData = rawData[ts];
          const lat = parseNumeric(entryData.latitude);
          const lng = parseNumeric(entryData.longitude);
          const alt = parseNumeric(entryData.altitude);
          
          // Only include entries with valid location data (at least lat and lng)
          if (lat === null || lng === null) {
            return null;
          }
          
          return {
            timestamp: ts,
            data: entryData,
            parsedDate: firebaseService.parseTimestamp(ts),
            location: {
              latitude: lat,
              longitude: lng,
              altitude: alt
            },
            originalIndex: index
          };
        })
        .filter(entry => entry !== null); // Remove entries with N/A values
      
      // Reverse to show newest first, then calculate deltas
      const reversedEntries = processedEntries.reverse().map((entry, displayIndex) => {
        // Find the previous chronological entry (next in reversed array)
        const previousChronologicalIndex = displayIndex + 1;
        const previousEntry = previousChronologicalIndex < processedEntries.length 
          ? processedEntries[previousChronologicalIndex] 
          : null;
        
        // Calculate deltas: current entry compared to previous chronological entry
        let deltaLat = null;
        let deltaLng = null;
        let deltaAlt = null;
        
        if (previousEntry) {
          deltaLat = calculateDelta(entry.location.latitude, previousEntry.location.latitude);
          deltaLng = calculateDelta(entry.location.longitude, previousEntry.location.longitude);
          // Only calculate altitude delta if both values are valid
          if (entry.location.altitude !== null && previousEntry.location.altitude !== null) {
            deltaAlt = calculateDelta(entry.location.altitude, previousEntry.location.altitude);
          }
        }
        
        return {
          ...entry,
          deltas: {
            latitude: deltaLat,
            longitude: deltaLng,
            altitude: deltaAlt
          },
          isFirst: displayIndex === processedEntries.length - 1 // Last in reversed = first chronologically
        };
      });
      
      // Build complete device data object
      const completeDeviceData = {
        macAddress: macAddress,
        deviceInfo: device,
        timestamps: reversedEntries,
        totalEntries: timestamps.length,
        latestEntry: reversedEntries.length > 0 ? reversedEntries[0] : null
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

  // Auto-refresh device data when modal is open
  useEffect(() => {
    if (!selectedDevice) return;

    const refreshDeviceData = async () => {
      // Helper functions for data processing
      const parseNumeric = (value) => {
        if (value === null || value === undefined || value === 'N/a' || value === '') return null;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      };

      const calculateDelta = (current, previous) => {
        if (current === null || previous === null) return null;
        return current - previous;
      };

      try {
        const macAddress = selectedDevice.id || selectedDevice.macAddress || selectedDevice.deviceId;
        const rawData = await firebaseService.fetchData(macAddress);
        
        // Get all timestamps (sorted chronologically - oldest first)
        const timestamps = rawData ? Object.keys(rawData).sort() : [];
        
        // Process entries with location data (oldest to newest), filter out N/A values
        const processedEntries = timestamps
          .map((ts, index) => {
            const entryData = rawData[ts];
            const lat = parseNumeric(entryData.latitude);
            const lng = parseNumeric(entryData.longitude);
            const alt = parseNumeric(entryData.altitude);
            
            // Only include entries with valid location data (at least lat and lng)
            if (lat === null || lng === null) {
              return null;
            }
            
            return {
              timestamp: ts,
              data: entryData,
              parsedDate: firebaseService.parseTimestamp(ts),
              location: {
                latitude: lat,
                longitude: lng,
                altitude: alt
              },
              originalIndex: index
            };
          })
          .filter(entry => entry !== null); // Remove entries with N/A values
        
        // Reverse to show newest first, then calculate deltas
        const reversedEntries = processedEntries.reverse().map((entry, displayIndex) => {
          // Find the previous chronological entry (next in reversed array)
          const previousChronologicalIndex = displayIndex + 1;
          const previousEntry = previousChronologicalIndex < processedEntries.length 
            ? processedEntries[previousChronologicalIndex] 
            : null;
          
          // Calculate deltas: current entry compared to previous chronological entry
          let deltaLat = null;
          let deltaLng = null;
          let deltaAlt = null;
          
          if (previousEntry) {
            deltaLat = calculateDelta(entry.location.latitude, previousEntry.location.latitude);
            deltaLng = calculateDelta(entry.location.longitude, previousEntry.location.longitude);
            // Only calculate altitude delta if both values are valid
            if (entry.location.altitude !== null && previousEntry.location.altitude !== null) {
              deltaAlt = calculateDelta(entry.location.altitude, previousEntry.location.altitude);
            }
          }
          
          return {
            ...entry,
            deltas: {
              latitude: deltaLat,
              longitude: deltaLng,
              altitude: deltaAlt
            },
            isFirst: displayIndex === processedEntries.length - 1 // Last in reversed = first chronologically
          };
        });
        
        // Build complete device data object
        const completeDeviceData = {
          macAddress: macAddress,
          deviceInfo: selectedDevice,
          timestamps: reversedEntries,
          totalEntries: timestamps.length,
          latestEntry: reversedEntries.length > 0 ? reversedEntries[0] : null
        };
        
        setDeviceData(completeDeviceData);
      } catch (err) {
        console.error('[DevicesLanding] Error refreshing device data:', err);
        // Don't set error state on refresh, just log it
      }
    };

    // Initial load
    refreshDeviceData();

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(refreshDeviceData, 30000);

    // Cleanup interval on unmount or when modal closes
    return () => clearInterval(refreshInterval);
  }, [selectedDevice]);

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
              <div>
                <h2>Firebase Data: {selectedDevice.name || selectedDevice.macAddress || selectedDevice.id}</h2>
                <div className="auto-refresh-indicator">
                  <span className="refresh-dot"></span>
                  Auto-refreshing every 30s
                </div>
              </div>
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

                  <div className="data-section">
                    <h3>Location Data Analysis - Point-to-Point Differences</h3>
                    <div className="scientific-table-container">
                      <table className="scientific-data-table">
                        <thead>
                          <tr>
                            <th>Timestamp</th>
                            <th>Date/Time</th>
                            <th>Latitude</th>
                            <th>Δ Latitude</th>
                            <th>Longitude</th>
                            <th>Δ Longitude</th>
                            <th>Altitude (m)</th>
                            <th>Δ Altitude (m)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deviceData.timestamps.map((entry, index) => {
                            const latDelta = formatDelta(entry.deltas.latitude);
                            const lngDelta = formatDelta(entry.deltas.longitude);
                            const altDelta = formatDelta(entry.deltas.altitude);
                            
                            return (
                              <tr key={index} className={entry.isFirst ? 'first-entry-row' : ''}>
                                <td className="timestamp-cell">{entry.timestamp}</td>
                                <td className="datetime-cell">{entry.parsedDate.toLocaleString()}</td>
                                <td className="value-cell latitude-cell">
                                  {entry.location.latitude.toFixed(6)}
                                </td>
                                <td className={`delta-cell ${entry.isFirst ? 'no-delta' : ''}`}>
                                  {entry.isFirst ? (
                                    <span className="delta-na">—</span>
                                  ) : (
                                    <span className="delta-value" style={{ color: latDelta.color }}>
                                      {latDelta.sign} {Math.abs(entry.deltas.latitude).toFixed(6)}
                                    </span>
                                  )}
                                </td>
                                <td className="value-cell longitude-cell">
                                  {entry.location.longitude.toFixed(6)}
                                </td>
                                <td className={`delta-cell ${entry.isFirst ? 'no-delta' : ''}`}>
                                  {entry.isFirst ? (
                                    <span className="delta-na">—</span>
                                  ) : (
                                    <span className="delta-value" style={{ color: lngDelta.color }}>
                                      {lngDelta.sign} {Math.abs(entry.deltas.longitude).toFixed(6)}
                                    </span>
                                  )}
                                </td>
                                <td className="value-cell altitude-cell">
                                  {entry.location.altitude !== null 
                                    ? entry.location.altitude.toFixed(2)
                                    : <span className="na-value">—</span>}
                                </td>
                                <td className={`delta-cell ${entry.isFirst || entry.deltas.altitude === null ? 'no-delta' : ''}`}>
                                  {entry.isFirst || entry.deltas.altitude === null ? (
                                    <span className="delta-na">—</span>
                                  ) : (
                                    <span className="delta-value" style={{ color: altDelta.color }}>
                                      {altDelta.sign} {Math.abs(entry.deltas.altitude).toFixed(2)}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="table-footer">
                      <div className="table-stats">
                        <span>Total Valid Entries: {deviceData.timestamps.length}</span>
                        <span className="stat-separator">|</span>
                        <span>Entries with N/A values filtered out</span>
                      </div>
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

