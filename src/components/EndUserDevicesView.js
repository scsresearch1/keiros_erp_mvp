import React, { useState, useEffect, useMemo } from 'react';
import firebaseService from '../services/firebaseService';
import './EndUserDevicesView.css';

const EndUserDevicesView = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState(null); // { lat, lng } when enabled
  const [locationError, setLocationError] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null); // device for Locate/Navigate modal
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState(30); // 0 = off

  const loadDevices = async () => {
    try {
      setError(null);
      const raw = await firebaseService.getDevices();
      const normalized = firebaseService.normalizeDevices(raw);
      setDevices(normalized);
      if (normalized.length === 0) {
        setError('No devices found in Firebase.');
      }
    } catch (err) {
      console.error('[EndUserDevicesView] Error loading devices:', err);
      setError(err.message || 'Failed to load devices.');
      setDevices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadDevices();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (refreshIntervalSeconds <= 0) return () => {};
    const intervalMs = refreshIntervalSeconds * 1000;
    const unsubscribe = firebaseService.subscribeToDevices((raw) => {
      const normalized = firebaseService.normalizeDevices(raw);
      setDevices(normalized);
    }, intervalMs);
    return () => unsubscribe();
  }, [loading, refreshIntervalSeconds]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDevices();
  };

  const handleLocationToggle = () => {
    if (locationEnabled) {
      setLocationEnabled(false);
      setUserLocation(null);
      setLocationError(null);
      return;
    }
    if (!navigator.geolocation) {
      setLocationError('Location is not supported by this browser.');
      return;
    }
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationEnabled(true);
        setLocationError(null);
      },
      (err) => {
        setLocationEnabled(false);
        setUserLocation(null);
        if (err.code === 1) {
          setLocationError('Location access denied.');
        } else if (err.code === 2) {
          setLocationError('Location unavailable.');
        } else {
          setLocationError('Could not get location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const getDeviceCoords = (device) => {
    const loc = device?.location;
    if (!loc) return null;
    const lat = loc.lat != null && !Number.isNaN(Number(loc.lat)) ? Number(loc.lat) : null;
    const lng = loc.lng != null && !Number.isNaN(Number(loc.lng)) ? Number(loc.lng) : null;
    return lat != null && lng != null ? { lat, lng } : null;
  };

  const handleLocate = (device) => {
    const coords = getDeviceCoords(device);
    if (!coords) return;
    const url = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSelectedDevice(null);
  };

  const handleNavigate = (device) => {
    const coords = getDeviceCoords(device);
    if (!coords) return;
    let url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
    if (userLocation) {
      url += `&origin=${userLocation.lat},${userLocation.lng}`;
    } else {
      url += '&origin=current+location';
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    setSelectedDevice(null);
  };

  /** Devices sorted by last update time (most recent first). */
  const sortedDevices = useMemo(() => {
    return [...devices].sort((a, b) => {
      const dateA = a.lastUpdate || a.lastSeen;
      const dateB = b.lastUpdate || b.lastSeen;
      const timeA = dateA ? (dateA instanceof Date ? dateA : new Date(dateA)).getTime() : 0;
      const timeB = dateB ? (dateB instanceof Date ? dateB : new Date(dateB)).getTime() : 0;
      if (Number.isNaN(timeA)) return 1;
      if (Number.isNaN(timeB)) return -1;
      return timeB - timeA; // newest first
    });
  }, [devices]);

  /**
   * Three clear situations:
   * (A) Timestamp and coordinates are updating → Online
   * (B) Only timestamp is updating (no coords) → Satellite Lock in Delay
   * (C) Neither updating → Offline
   */
  const getDisplayStatus = (device) => {
    const hasCoords = getDeviceCoords(device) !== null;
    const status = device.status || 'Offline';
    const isActive = status === 'Active';
    if (isActive && hasCoords) return 'Online';
    if (isActive && !hasCoords) return 'Satellite Lock in Delay';
    return 'Offline';
  };

  const getDisplayStatusClass = (device) => {
    const s = getDisplayStatus(device);
    if (s === 'Online') return 'online';
    if (s === 'Satellite Lock in Delay') return 'delay';
    return 'offline';
  };

  const formatLastUpdate = (device) => {
    const date = device.lastUpdate || device.lastSeen;
    if (!date) return '—';
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return '—';
    const mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}, ${hh}:${min}`;
  };

  return (
    <div className="enduser-devices-view">
      <header className="enduser-devices-header">
        <h1 className="enduser-devices-title">My Devices</h1>
        <p className="enduser-devices-subtitle">Devices from Firebase</p>
        <div className="enduser-devices-header-actions">
          <button
            type="button"
            className={`enduser-devices-location-toggle ${locationEnabled ? 'on' : 'off'}`}
            onClick={handleLocationToggle}
            aria-label={locationEnabled ? 'Disable location' : 'Enable location'}
            title={locationEnabled ? 'Turn off browser location' : 'Use your current location for navigation'}
          >
            <span className="enduser-devices-location-icon" aria-hidden="true">
              {locationEnabled ? '📍' : '📌'}
            </span>
            {locationEnabled ? 'Location on' : 'Enable location'}
          </button>
          <button
            type="button"
            className="enduser-devices-refresh"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            aria-label="Refresh devices"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        {locationError && (
          <p className="enduser-devices-location-error" role="alert">
            {locationError}
          </p>
        )}
      </header>

      <div className="enduser-devices-auto-refresh">
        <span className="enduser-devices-auto-refresh-label">Auto-refresh</span>
        <div className="enduser-devices-auto-refresh-options" role="group" aria-label="Auto-refresh interval">
          {[15, 30, 60].map((sec) => (
            <button
              key={sec}
              type="button"
              className={`enduser-devices-auto-refresh-btn ${refreshIntervalSeconds === sec ? 'active' : ''}`}
              onClick={() => setRefreshIntervalSeconds(sec)}
              aria-pressed={refreshIntervalSeconds === sec}
              aria-label={`Refresh every ${sec} seconds`}
            >
              {sec}s
            </button>
          ))}
          <button
            type="button"
            className={`enduser-devices-auto-refresh-btn ${refreshIntervalSeconds === 0 ? 'active' : ''}`}
            onClick={() => setRefreshIntervalSeconds(0)}
            aria-pressed={refreshIntervalSeconds === 0}
            aria-label="Auto-refresh off"
          >
            Off
          </button>
        </div>
        <span className="enduser-devices-auto-refresh-hint">
          {refreshIntervalSeconds > 0 ? `Next refresh in ~${refreshIntervalSeconds}s` : 'Manual refresh only'}
        </span>
      </div>

      {loading && devices.length === 0 ? (
        <div className="enduser-devices-loading">
          <span className="enduser-devices-spinner" aria-hidden="true" />
          <span>Loading devices…</span>
        </div>
      ) : error && devices.length === 0 ? (
        <div className="enduser-devices-error">
          <span className="enduser-devices-error-icon" aria-hidden="true">⚠️</span>
          <p>{error}</p>
        </div>
      ) : devices.length === 0 ? (
        <div className="enduser-devices-empty">
          <p>No devices available.</p>
        </div>
      ) : (
        <div className="enduser-devices-grid">
          {sortedDevices.map((device) => (
            <article
              key={device.id || device.macAddress || device.deviceId}
              className="enduser-device-card enduser-device-card-clickable"
              onClick={() => setSelectedDevice(device)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedDevice(device);
                }
              }}
              aria-label={`${device.name || device.macAddress || 'Device'}, ${getDisplayStatus(device)}. Click for map options.`}
            >
              <div className="enduser-device-card-header">
                <span
                  className={`enduser-device-status-dot ${getDisplayStatusClass(device)}`}
                  aria-hidden="true"
                />
                <h2 className="enduser-device-name">
                  {device.name || device.macAddress || device.id || 'Device'}
                </h2>
              </div>
              <div className="enduser-device-card-body">
                <div className="enduser-device-row enduser-device-row-status">
                  <span className={`enduser-device-badge ${getDisplayStatusClass(device)}`}>
                    {getDisplayStatus(device)}
                  </span>
                </div>
                {/* Compact: Last access coordinates + time */}
                <div className="enduser-device-last-access">
                  <div className="enduser-device-last-access-coords" title="Last access coordinates">
                    <span className="enduser-device-last-access-icon" aria-hidden="true">📍</span>
                    <span className="enduser-device-last-access-value">
                      {device.location && (device.location.lat != null || device.location.lng != null)
                        ? [device.location.lat, device.location.lng]
                            .filter((n) => n != null && !Number.isNaN(n))
                            .map((n) => Number(n).toFixed(5))
                            .join(', ') || '—'
                        : '—'}
                    </span>
                  </div>
                  <div className="enduser-device-last-access-time" title="Last access time">
                    <span className="enduser-device-last-access-icon" aria-hidden="true">🕐</span>
                    <span className="enduser-device-last-access-value">{formatLastUpdate(device)}</span>
                  </div>
                </div>
                {(device.macAddress || device.id) && (
                  <div className="enduser-device-row enduser-device-row-mac">
                    <span className="enduser-device-value enduser-device-mac">
                      {device.macAddress || device.id}
                    </span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Device map options modal */}
      {selectedDevice && (
        <div
          className="enduser-device-modal-overlay"
          onClick={() => setSelectedDevice(null)}
          onKeyDown={(e) => e.key === 'Escape' && setSelectedDevice(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="enduser-device-modal-title"
        >
          <div
            className="enduser-device-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="enduser-device-modal-header">
              <h2 id="enduser-device-modal-title" className="enduser-device-modal-title">
                {selectedDevice.name || selectedDevice.macAddress || selectedDevice.id || 'Device'}
              </h2>
              <button
                type="button"
                className="enduser-device-modal-close"
                onClick={() => setSelectedDevice(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="enduser-device-modal-body">
              {getDeviceCoords(selectedDevice) ? (
                <div className="enduser-device-modal-actions">
                  <button
                    type="button"
                    className="enduser-device-modal-btn enduser-device-modal-btn-locate"
                    onClick={() => handleLocate(selectedDevice)}
                  >
                    <span className="enduser-device-modal-btn-icon" aria-hidden="true">📍</span>
                    Locate
                  </button>
                  <p className="enduser-device-modal-btn-desc">See the device on Google Maps</p>
                  <button
                    type="button"
                    className="enduser-device-modal-btn enduser-device-modal-btn-navigate"
                    onClick={() => handleNavigate(selectedDevice)}
                  >
                    <span className="enduser-device-modal-btn-icon" aria-hidden="true">🧭</span>
                    Navigate
                  </button>
                  <p className="enduser-device-modal-btn-desc">
                    {userLocation ? 'Directions from your location to the device on Google Maps' : 'Open Google Maps and set your starting point for directions to the device'}
                  </p>
                </div>
              ) : (
                <p className="enduser-device-modal-no-location">No location data for this device.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndUserDevicesView;
