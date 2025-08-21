import React, { useState, useEffect, useMemo } from 'react';
import './DeliveryAgency.css';

const DeliveryAgency = ({ currentUser }) => {
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [fleetDevices, setFleetDevices] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripPlayback, setShowTripPlayback] = useState(false);
  const [complianceData, setComplianceData] = useState([]);
  const [filterRegion, setFilterRegion] = useState('all');

  // Mock data constants
  const mockPackagesData = useMemo(() => [
    {
      id: 'PKG_001',
      trackingNumber: 'TRK123456789',
      description: 'Electronics Package',
      status: 'In Transit',
      assignedDevice: 'fleet_001',
      assignedDriver: 'Mike Driver',
      estimatedDelivery: new Date(Date.now() + 3600000),
      geofenceCompliance: true
    },
    {
      id: 'PKG_002',
      trackingNumber: 'TRK987654321',
      description: 'Furniture Package',
      status: 'In Transit',
      assignedDevice: 'fleet_002',
      assignedDriver: 'Sarah Dispatcher',
      estimatedDelivery: new Date(Date.now() + 7200000),
      geofenceCompliance: true
    }
  ], []);

  // Initialize mock data
  useEffect(() => {
    // Mock fleet devices
    const mockFleetDevices = [
      {
        id: 'fleet_001',
        deviceId: 'DEV_001',
        name: 'Fleet Truck Alpha',
        type: 'Delivery Vehicle',
        status: 'Active',
        location: { lat: 40.7128, lng: -74.0060, address: 'Manhattan, NY' },
        driver: 'Mike Driver',
        currentPackage: 'PKG_001',
        battery: 85,
        lastUpdate: new Date(),
        region: 'Northeast',
        geofenceStatus: 'Within Limits',
        complianceScore: 95
      },
      {
        id: 'fleet_002',
        deviceId: 'DEV_002',
        name: 'Fleet Van Beta',
        type: 'Delivery Van',
        status: 'Active',
        location: { lat: 40.7589, lng: -73.9851, address: 'Brooklyn, NY' },
        driver: 'Sarah Dispatcher',
        currentPackage: 'PKG_002',
        battery: 72,
        lastUpdate: new Date(Date.now() - 300000),
        region: 'Northeast',
        geofenceStatus: 'Within Limits',
        complianceScore: 88
      },
      {
        id: 'fleet_003',
        deviceId: 'DEV_003',
        name: 'Fleet Truck Gamma',
        type: 'Delivery Truck',
        status: 'Maintenance',
        location: { lat: 40.7505, lng: -73.9934, address: 'Queens, NY' },
        driver: 'John Fleet Manager',
        currentPackage: null,
        battery: 15,
        lastUpdate: new Date(Date.now() - 3600000),
        region: 'Northeast',
        geofenceStatus: 'Offline',
        complianceScore: 0
      }
    ];

    // Mock drivers
    const mockDrivers = [
      {
        id: 'driver_001',
        name: 'Mike Driver',
        license: 'DL123456789',
        status: 'Active',
        currentDevice: 'fleet_001',
        currentPackage: 'PKG_001',
        region: 'Northeast',
        complianceScore: 95,
        lastTrip: new Date(Date.now() - 86400000),
        permissions: ['device_operation', 'trip_updates', 'location_reporting']
      },
      {
        id: 'driver_002',
        name: 'Sarah Dispatcher',
        license: 'DL987654321',
        status: 'Active',
        currentDevice: 'fleet_002',
        currentPackage: 'PKG_002',
        region: 'Northeast',
        complianceScore: 88,
        lastTrip: new Date(Date.now() - 172800000),
        permissions: ['device_operation', 'trip_updates', 'location_reporting']
      }
    ];

    // Mock compliance data - Fixed to be more realistic
    const mockComplianceData = [
      {
        id: 'comp_001',
        deviceId: 'fleet_001',
        driver: 'Mike Driver',
        date: new Date(Date.now() - 86400000),
        geofenceAdherence: 98,
        speedCompliance: 95,
        routeDeviation: 2,
        overallScore: 95,
        violations: ['Minor speed deviation on Main St'],
        status: 'Compliant'
      },
      {
        id: 'comp_002',
        deviceId: 'fleet_002',
        driver: 'Sarah Dispatcher',
        date: new Date(Date.now() - 172800000),
        geofenceAdherence: 92,
        speedCompliance: 88,
        routeDeviation: 5,
        overallScore: 88,
        violations: ['Route deviation due to traffic', 'Minor geofence breach'],
        status: 'Warning'
      },
      {
        id: 'comp_003',
        deviceId: 'fleet_003',
        driver: 'John Fleet Manager',
        date: new Date(Date.now() - 259200000),
        geofenceAdherence: 45,
        speedCompliance: 60,
        routeDeviation: 25,
        overallScore: 43,
        violations: ['Major route deviation', 'Multiple geofence violations', 'Excessive speed violations'],
        status: 'Non-Compliant'
      }
    ];

    setFleetDevices(mockFleetDevices);
    setDrivers(mockDrivers);
    setComplianceData(mockComplianceData);
    setActiveDeliveries(mockPackagesData.filter(pkg => pkg.status === 'In Transit'));
  }, [mockPackagesData]);

  // Device-Package Binding
  const bindPackageToDevice = (packageId, deviceId) => {
    // Update fleet devices with package assignment
    setFleetDevices(prev => 
      prev.map(device => 
        device.id === deviceId 
          ? { ...device, currentPackage: packageId }
          : device
      )
    );
    
    // Update active deliveries
    setActiveDeliveries(prev => 
      prev.map(delivery => 
        delivery.id === packageId 
          ? { ...delivery, assignedDevice: deviceId, status: 'Assigned' }
          : delivery
      )
    );
  };

  // Fleet Monitoring
  const getFleetStatus = () => {
    const total = fleetDevices.length;
    const active = fleetDevices.filter(d => d.status === 'Active').length;
    const maintenance = fleetDevices.filter(d => d.status === 'Maintenance').length;
    const offline = fleetDevices.filter(d => d.status === 'Offline').length;
    
    return { total, active, maintenance, offline };
  };

  // Compliance Reports - Fixed logic
  const getComplianceSummary = () => {
    const total = complianceData.length;
    const compliant = complianceData.filter(c => c.status === 'Compliant').length;
    const warning = complianceData.filter(c => c.status === 'Warning').length;
    const nonCompliant = complianceData.filter(c => c.status === 'Non-Compliant').length;
    
    return { total, compliant, warning, nonCompliant };
  };

  // Get compliance data by status for proper organization
  const getComplianceByStatus = () => {
    const compliant = complianceData.filter(c => c.status === 'Compliant');
    const warning = complianceData.filter(c => c.status === 'Warning');
    const nonCompliant = complianceData.filter(c => c.status === 'Non-Compliant');
    
    return { compliant, warning, nonCompliant };
  };

  // Trip Playback
  const startTripPlayback = (tripId) => {
    // Mock trip data for playback
    const mockTripData = {
      id: tripId,
      deviceId: 'fleet_001',
      driver: 'Mike Driver',
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(),
      route: [
        { lat: 40.7128, lng: -74.0060, time: new Date(Date.now() - 3600000), event: 'Trip Started' },
        { lat: 40.7200, lng: -74.0100, time: new Date(Date.now() - 3000000), event: 'Package Pickup' },
        { lat: 40.7300, lng: -74.0200, time: new Date(Date.now() - 2400000), event: 'In Transit' },
        { lat: 40.7400, lng: -74.0300, time: new Date(Date.now() - 1800000), event: 'Geofence Entry' },
        { lat: 40.7500, lng: -74.0400, time: new Date(Date.now() - 1200000), event: 'Package Delivery' },
        { lat: 40.7600, lng: -74.0500, time: new Date(Date.now() - 600000), event: 'Return Trip' },
        { lat: 40.7700, lng: -74.0600, time: new Date(), event: 'Trip Completed' }
      ],
      metrics: {
        distance: '25.3 km',
        duration: '1 hour',
        stops: 3,
        complianceScore: 95
      }
    };
    
    setSelectedTrip(mockTripData);
    setShowTripPlayback(true);
  };

  // Role-Based Access Control
  const canManageFleet = ['admin', 'fleetmanager'].includes(currentUser.level);
  const canViewCompliance = ['admin', 'fleetmanager', 'dispatcher'].includes(currentUser.level);

  const complianceByStatus = getComplianceByStatus();

  return (
    <div className="delivery-agency">
      <div className="content-header">
        <h1 className="content-title">🚚 Delivery Agency Dashboard</h1>
        <p className="content-subtitle">
          Fleet management, package tracking, and compliance monitoring for logistics partners
        </p>
      </div>

      {/* Fleet Overview Stats */}
      <div className="agency-stats">
        {Object.entries(getFleetStatus()).map(([key, value]) => (
          <div key={key} className={`stat-card ${key === 'active' ? 'primary' : ''}`}>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
            </div>
        ))}
          </div>
          
      {/* Main Content Grid */}
      <div className="agency-content">
        {/* Left Panel - Fleet Management */}
        <div className="content-panel">
          {/* Device-Package Binding */}
          <div className="panel-section">
            <h3 className="section-title">📦 Device-Package Binding</h3>
            <div className="devices-grid">
              {fleetDevices.map(device => (
                  <div key={device.id} className={`device-card ${device.status.toLowerCase()}`}>
                    <div className="device-header">
                      <h4>{device.name}</h4>
                      <span className={`status-badge ${device.status.toLowerCase()}`}>
                        {device.status}
                      </span>
          </div>
                    <div className="device-details">
                      <p>📍 {device.location.address}</p>
                      <p>🔋 Battery: {device.battery}%</p>
                      <p>📊 Compliance: {device.complianceScore}%</p>
                                              {device.currentPackage && (
                          <p className="package-info">
                            📦 {mockPackagesData.find(p => p.id === device.currentPackage)?.trackingNumber}
                          </p>
                        )}
            </div>
                    {canManageFleet && (
                      <div className="device-actions">
                        {!device.currentPackage ? (
                          <select 
                            className="action-select"
                            onChange={(e) => bindPackageToDevice(e.target.value, device.id)}
                            defaultValue=""
                          >
                            <option value="" disabled>Assign Package</option>
                            {mockPackagesData.filter(p => !p.assignedDevice).map(pkg => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.trackingNumber} - {pkg.description}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <button 
                            className="action-btn secondary"
                            onClick={() => bindPackageToDevice(device.currentPackage, null)}
                          >
                            Unbind Package
                          </button>
                        )}
          </div>
                    )}
            </div>
                ))}
            </div>
          </div>
          
          {/* Fleet-Wide Monitoring */}
          <div className="panel-section">
            <h3 className="section-title">📡 Fleet-Wide Monitoring</h3>
          <div className="section-controls">
            <select
                className="control-select"
                onChange={(e) => setFilterRegion(e.target.value)}
                value={filterRegion}
              >
                <option value="all">All Regions</option>
                <option value="Northeast">Northeast</option>
                <option value="Southeast">Southeast</option>
                <option value="Midwest">Midwest</option>
                <option value="West">West</option>
            </select>
          </div>
            <div className="deliveries-grid">
              {activeDeliveries
                .filter(delivery => filterRegion === 'all' || 
                  fleetDevices.find(d => d.id === delivery.assignedDevice)?.region === filterRegion)
                .map(delivery => {
                  const device = fleetDevices.find(d => d.id === delivery.assignedDevice);
                  const driver = drivers.find(d => d.id === delivery.assignedDriver);
                    
                    return (
                    <div key={delivery.id} className="delivery-card">
                      <div className="delivery-header">
                        <h4>📦 {delivery.trackingNumber}</h4>
                        <span className={`status-badge ${delivery.status.toLowerCase().replace(' ', '-')}`}>
                          {delivery.status}
                        </span>
                      </div>
                      <div className="delivery-details">
                        <p><strong>Package:</strong> {delivery.description}</p>
                        <p><strong>Device:</strong> {device?.name || 'Unassigned'}</p>
                        <p><strong>Driver:</strong> {driver?.name || 'Unassigned'}</p>
                        <p><strong>ETA:</strong> {delivery.estimatedDelivery.toLocaleTimeString()}</p>
                        <p><strong>Geofence:</strong> 
                          <span className={`geofence-status ${delivery.geofenceCompliance ? 'compliant' : 'violation'}`}>
                            {delivery.geofenceCompliance ? '✅ Compliant' : '❌ Violation'}
                          </span>
                        </p>
                      </div>
                      {canViewCompliance && (
                        <div className="delivery-actions">
                          <button 
                            className="action-btn primary"
                            onClick={() => startTripPlayback(delivery.id)}
                          >
                            🎬 Trip Playback
                          </button>
                          </div>
                      )}
                          </div>
                    );
                  })}
          </div>
        </div>
      </div>

        {/* Right Panel - Compliance & Reports */}
        <div className="content-panel">
          {/* Compliance Reports */}
          <div className="panel-section">
            <h3 className="section-title">📊 Compliance Reports</h3>
            <div className="compliance-summary">
              {Object.entries(getComplianceSummary()).map(([key, value]) => (
                <div key={key} className={`compliance-stat ${key}`}>
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                </div>
              ))}
        </div>

            {/* Compliant Drivers */}
            {complianceByStatus.compliant.length > 0 && (
              <div className="compliance-section">
                <h4 className="compliance-section-title compliant">✅ Compliant Drivers</h4>
                <div className="compliance-list">
                  {complianceByStatus.compliant.map(compliance => (
                    <div key={compliance.id} className="compliance-item compliant">
                      <div className="compliance-header">
                        <h4>{compliance.driver}</h4>
                        <span className={`status-badge ${compliance.status.toLowerCase()}`}>
                          {compliance.status}
                  </span>
                </div>
                      <div className="compliance-metrics">
                        <div className="metric">
                          <span className="metric-label">Geofence:</span>
                          <span className="metric-value">{compliance.geofenceAdherence}%</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Speed:</span>
                          <span className="metric-value">{compliance.speedCompliance}%</span>
              </div>
                        <div className="metric">
                          <span className="metric-label">Route:</span>
                          <span className="metric-value">{compliance.routeDeviation}%</span>
                </div>
                        <div className="metric">
                          <span className="metric-label">Overall:</span>
                          <span className="metric-value overall-score">{compliance.overallScore}%</span>
                </div>
                      </div>
                      {compliance.violations.length > 0 && (
                        <div className="violations">
                          <strong>Minor Issues:</strong>
                          <ul>
                            {compliance.violations.map((violation, index) => (
                              <li key={index}>{violation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Drivers */}
            {complianceByStatus.warning.length > 0 && (
              <div className="compliance-section">
                <h4 className="compliance-section-title warning">⚠️ Warning Drivers</h4>
                <div className="compliance-list">
                  {complianceByStatus.warning.map(compliance => (
                    <div key={compliance.id} className="compliance-item warning">
                      <div className="compliance-header">
                        <h4>{compliance.driver}</h4>
                        <span className={`status-badge ${compliance.status.toLowerCase()}`}>
                          {compliance.status}
                  </span>
                </div>
                      <div className="compliance-metrics">
                        <div className="metric">
                          <span className="metric-label">Geofence:</span>
                          <span className="metric-value">{compliance.geofenceAdherence}%</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Speed:</span>
                          <span className="metric-value">{compliance.speedCompliance}%</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Route:</span>
                          <span className="metric-value">{compliance.routeDeviation}%</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Overall:</span>
                          <span className="metric-value overall-score">{compliance.overallScore}%</span>
                        </div>
                      </div>
                      {compliance.violations.length > 0 && (
                        <div className="violations">
                          <strong>Violations:</strong>
                          <ul>
                            {compliance.violations.map((violation, index) => (
                              <li key={index}>{violation}</li>
                            ))}
                          </ul>
              </div>
                      )}
            </div>
          ))}
        </div>
      </div>
            )}

            {/* Non-Compliant Drivers */}
            {complianceByStatus.nonCompliant.length > 0 && (
              <div className="compliance-section">
                <h4 className="compliance-section-title noncompliant">❌ Non-Compliant Drivers</h4>
                <div className="compliance-list">
                  {complianceByStatus.nonCompliant.map(compliance => (
                    <div key={compliance.id} className="compliance-item noncompliant">
                      <div className="compliance-header">
                        <h4>{compliance.driver}</h4>
                        <span className={`status-badge ${compliance.status.toLowerCase()}`}>
                          {compliance.status}
                  </span>
                </div>
                      <div className="compliance-metrics">
                        <div className="metric">
                          <span className="metric-label">Geofence:</span>
                          <span className="metric-value">{compliance.geofenceAdherence}%</span>
              </div>
                        <div className="metric">
                          <span className="metric-label">Speed:</span>
                          <span className="metric-value">{compliance.speedCompliance}%</span>
                  </div>
                        <div className="metric">
                          <span className="metric-label">Route:</span>
                          <span className="metric-value">{compliance.routeDeviation}%</span>
                  </div>
                        <div className="metric">
                          <span className="metric-label">Overall:</span>
                          <span className="metric-value overall-score">{compliance.overallScore}%</span>
                  </div>
                </div>
                      {compliance.violations.length > 0 && (
                        <div className="violations">
                          <strong>Critical Violations:</strong>
                          <ul>
                            {compliance.violations.map((violation, index) => (
                              <li key={index}>{violation}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                  </div>
                </div>
            )}
              </div>
              
          {/* Role-Based Access Management */}
          {canManageFleet && (
            <div className="panel-section">
              <h3 className="section-title">🔐 Role-Based Access</h3>
              <div className="drivers-list">
                {drivers.map(driver => (
                  <div key={driver.id} className="driver-item">
                    <div className="driver-info">
                      <h4>{driver.name}</h4>
                      <p>🚗 {driver.currentDevice ? fleetDevices.find(d => d.id === driver.currentDevice)?.name : 'No Device'}</p>
                      <p>📦 {driver.currentPackage || 'No Package'}</p>
                      <p>📊 Compliance: {driver.complianceScore}%</p>
                    </div>
                    <div className="driver-permissions">
                      <h5>Permissions:</h5>
                      <div className="permissions-list">
                        {driver.permissions.map(permission => (
                          <span key={permission} className="permission-badge">
                            {permission.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="driver-actions">
                      <button className="action-btn primary">
                        ✏️ Edit Permissions
                      </button>
                      <button className="action-btn secondary">
                        🚫 Revoke Access
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
          )}
            </div>
          </div>
          
      {/* Trip Playback Modal */}
      {showTripPlayback && selectedTrip && (
        <div className="trip-playback-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🎬 Trip Playback - {selectedTrip.id}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowTripPlayback(false)}
              >
                ✕
              </button>
            </div>
            <div className="trip-info">
              <div className="trip-details">
                <p><strong>Driver:</strong> {selectedTrip.driver}</p>
                <p><strong>Start Time:</strong> {selectedTrip.startTime.toLocaleString()}</p>
                <p><strong>End Time:</strong> {selectedTrip.endTime.toLocaleString()}</p>
                <p><strong>Distance:</strong> {selectedTrip.metrics.distance}</p>
                <p><strong>Duration:</strong> {selectedTrip.metrics.duration}</p>
                <p><strong>Compliance Score:</strong> {selectedTrip.metrics.complianceScore}%</p>
            </div>
          </div>
            <div className="trip-timeline">
              <h4>Trip Timeline</h4>
              <div className="timeline">
                {selectedTrip.route.map((point, index) => (
                  <div key={index} className="timeline-point">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-time">
                        {point.time.toLocaleTimeString()}
                      </div>
                      <div className="timeline-event">{point.event}</div>
                      <div className="timeline-location">
                        📍 {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                      </div>
            </div>
          </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default DeliveryAgency;
