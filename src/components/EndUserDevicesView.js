import React, { useState, useEffect } from 'react';
import firebaseService from '../services/firebaseService';
import './EndUserDevicesView.css';

const EndUserDevicesView = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
    const unsubscribe = firebaseService.subscribeToDevices((raw) => {
      const normalized = firebaseService.normalizeDevices(raw);
      setDevices(normalized);
    }, 30000);
    return () => unsubscribe();
  }, [loading]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDevices();
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
        <button
          type="button"
          className="enduser-devices-refresh"
          onClick={handleRefresh}
          disabled={loading || refreshing}
          aria-label="Refresh devices"
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

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
          {devices.map((device) => (
            <article
              key={device.id || device.macAddress || device.deviceId}
              className="enduser-device-card"
            >
              <div className="enduser-device-card-header">
                <span
                  className={`enduser-device-status-dot ${(device.status || 'offline').toLowerCase()}`}
                  aria-hidden="true"
                />
                <h2 className="enduser-device-name">
                  {device.name || device.macAddress || device.id || 'Device'}
                </h2>
              </div>
              <div className="enduser-device-card-body">
                <div className="enduser-device-row enduser-device-row-status">
                  <span className={`enduser-device-badge ${(device.status || 'offline').toLowerCase()}`}>
                    {device.status || 'Offline'}
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
    </div>
  );
};

export default EndUserDevicesView;
