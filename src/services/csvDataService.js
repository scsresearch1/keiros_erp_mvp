import Papa from 'papaparse';

class CSVDataService {
  constructor() {
    this.data = null;
    this.csvUrl = '/SimData/data_sim_app.csv';
  }

  async loadCSVData() {
    if (this.data) return this.data;

    try {
      const response = await fetch(this.csvUrl);
      const csvText = await response.text();
      
      const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transform: (value, field) => {
          // Handle boolean values
          if (field === 'isOnline' || field === 'isMoving') {
            return value === 'true';
          }
          // Handle numeric values
          if (field === 'batteryLevel' || field === 'signalStrength' || 
              field === 'latitude' || field === 'longitude' || 
              field === 'geofenceViolations') {
            return parseFloat(value) || 0;
          }
          return value;
        }
      });

      this.data = this.organizeData(result.data);
      return this.data;
    } catch (error) {
      console.error('Error loading CSV data:', error);
      throw error;
    }
  }

  organizeData(rawData) {
    const organized = {
      users: [],
      devices: [],
      packages: [],
      trips: [],
      geofences: []
    };

    rawData.forEach(row => {
      if (row.type === 'user') {
        organized.users.push({
          id: row.id,
          username: row.username,
          password: row.password,
          fullName: row.fullName,
          email: row.email,
          level: row.level,
          role: row.role,
          department: row.department,
          location: row.location,
          avatar: row.avatar,
          status: row.status,
          permissions: row.permissions ? row.permissions.split(',') : ['read'],
          lastLogin: row.lastLogin
        });
      } else if (row.type === 'device') {
        organized.devices.push({
          id: row.id,
          deviceId: row.deviceId,
          deviceName: row.deviceName,
          deviceType: row.deviceType,
          status: row.status,
          isOnline: row.isOnline,
          isMoving: row.isMoving,
          batteryLevel: row.batteryLevel,
          signalStrength: row.signalStrength,
          latitude: row.latitude,
          longitude: row.longitude,
          location: row.location,
          geofence: row.geofence,
          assignedUser: row.assignedUser,
          firmwareVersion: row.firmwareVersion,
          lastSeen: row.lastSeen,
          lastCommand: row.lastCommand
        });
      } else if (row.type === 'package') {
        organized.packages.push({
          id: row.id,
          packageId: row.packageId,
          description: row.description,
          status: row.status,
          assignedDevice: row.assignedDevice,
          estimatedDelivery: row.estimatedDelivery,
          currentLocation: row.currentLocation,
          destination: row.destination
        });
      } else if (row.type === 'trip') {
        organized.trips.push({
          id: row.id,
          tripId: row.tripId,
          deviceId: row.deviceId,
          driverName: row.driverName,
          startTime: row.startTime,
          endTime: row.endTime,
          status: row.status,
          route: row.route,
          geofenceViolations: row.geofenceViolations,
          slaCompliance: row.slaCompliance
        });
      } else if (row.type === 'geofence') {
        organized.geofences.push({
          id: row.id,
          geofenceName: row.geofenceName,
          centerLat: parseFloat(row.centerLat),
          centerLng: parseFloat(row.centerLng),
          radius: parseFloat(row.radius),
          type: row.type,
          status: row.status,
          assignedDevices: row.assignedDevices ? row.assignedDevices.split(',') : []
        });
      }
    });

    return organized;
  }

  // User Management
  async getUsers() {
    await this.loadCSVData();
    return this.data.users;
  }

  async getUserById(id) {
    await this.loadCSVData();
    return this.data.users.find(u => u.id === id);
  }

  // Device Management
  async getDevices() {
    await this.loadCSVData();
    return this.data.devices;
  }

  async getDeviceById(id) {
    await this.loadCSVData();
    return this.data.devices.find(d => d.id === id);
  }

  async getDevicesByUser(userId) {
    await this.loadCSVData();
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return [];
    return this.data.devices.filter(d => d.assignedUser === user.fullName);
  }

  // Package Management
  async getPackages() {
    await this.loadCSVData();
    return this.data.packages;
  }

  async getPackageById(id) {
    await this.loadCSVData();
    return this.data.packages.find(p => p.id === id);
  }

  async getPackagesByDevice(deviceId) {
    await this.loadCSVData();
    return this.data.packages.filter(p => p.assignedDevice === deviceId);
  }

  // Trip Management
  async getTrips() {
    await this.loadCSVData();
    return this.data.trips;
  }

  async getTripById(id) {
    await this.loadCSVData();
    return this.data.trips.find(t => t.id === id);
  }

  async getActiveTrips() {
    await this.loadCSVData();
    return this.data.trips.filter(t => t.status === 'Active');
  }

  // Geofence Management
  async getGeofences() {
    await this.loadCSVData();
    return this.data.geofences;
  }

  async getGeofenceById(id) {
    await this.loadCSVData();
    return this.data.geofences.find(g => g.id === id);
  }

  // Dashboard Statistics
  async getDashboardStats() {
    await this.loadCSVData();
    
    const totalDevices = this.data.devices.length;
    const activeDevices = this.data.devices.filter(d => d.status === 'Active').length;
    const totalPackages = this.data.packages.length;
    const activeTrips = this.data.trips.filter(t => t.status === 'Active').length;
    const geofenceViolations = this.data.devices.reduce((sum, d) => sum + (d.geofenceViolations || 0), 0);
    const pendingApprovals = this.data.devices.filter(d => d.status === 'Pending Approval').length;

    return {
      totalDevices,
      activeDevices,
      totalPackages,
      activeTrips,
      geofenceViolations,
      pendingApprovals
    };
  }

  // Recent Activities
  async getRecentActivities() {
    await this.loadCSVData();
    
    const activities = [];
    
    // Device activities
    this.data.devices.forEach(device => {
      if (device.lastSeen) {
        activities.push({
          type: device.isOnline ? 'device_online' : 'device_offline',
          title: `${device.deviceName} ${device.isOnline ? 'came online' : 'went offline'}`,
          description: `Device ${device.deviceId} status changed`,
          timestamp: device.lastSeen,
          deviceId: device.deviceId
        });
      }
    });

    // Geofence violations
    this.data.devices.forEach(device => {
      if (device.geofenceViolations > 0) {
        activities.push({
          type: 'geofence_violation',
          title: `Geofence violation detected`,
          description: `Device ${device.deviceName} violated geofence ${device.geofence}`,
          timestamp: new Date().toISOString(),
          deviceId: device.deviceId
        });
      }
    });

    // Trip activities
    this.data.trips.forEach(trip => {
      if (trip.status === 'Active') {
        activities.push({
          type: 'trip_started',
          title: `Trip started`,
          description: `Trip ${trip.tripId} initiated by ${trip.driverName}`,
          timestamp: trip.startTime,
          deviceId: trip.deviceId
        });
      }
    });

    // Sort by timestamp (newest first)
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Pending Approvals
  async getPendingApprovals() {
    await this.loadCSVData();
    return this.data.devices.filter(d => d.status === 'Pending Approval');
  }

  // Notifications
  async getUnreadNotifications() {
    await this.loadCSVData();
    
    const notifications = [];
    
    // Low battery alerts
    this.data.devices.forEach(device => {
      if (device.batteryLevel < 20) {
        notifications.push({
          id: `battery-${device.id}`,
          type: 'warning',
          message: `Low battery on ${device.deviceName}`,
          deviceId: device.deviceId
        });
      }
    });

    // Geofence violations
    this.data.devices.forEach(device => {
      if (device.geofenceViolations > 0) {
        notifications.push({
          id: `geofence-${device.id}`,
          type: 'alert',
          message: `Geofence violation on ${device.deviceName}`,
          deviceId: device.deviceId
        });
      }
    });

    return notifications;
  }

  // Simulate Geofence Violations and Alerts
  async getGeofenceViolations() {
    await this.loadCSVData();
    const devices = this.data.devices;
    const geofences = this.data.geofences;

    const violations = [];

    devices.forEach(device => {
      if (device.geofenceViolations > 0) {
        const geofence = geofences.find(g => g.geofenceName === device.geofence);
        if (geofence) {
          violations.push({
            id: `violation-${device.id}`,
            deviceId: device.deviceId,
            deviceName: device.deviceName,
            geofenceName: device.geofence,
            violationType: 'Zone Exit',
            timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
            severity: device.geofenceViolations > 2 ? 'High' : 'Medium',
            location: device.location,
            coordinates: { lat: device.latitude, lng: device.longitude },
            description: `Device ${device.deviceName} violated geofence ${device.geofence}`,
            status: 'Active'
          });
        }
      }
    });

    return violations;
  }

  // Simulate Phone-Device Proximity
  async getDeviceProximity(userId) {
    await this.loadCSVData();
    const user = this.data.users.find(u => u.id === userId);
    const userDevices = this.data.devices.filter(d => d.assignedUser === user?.fullName);

    if (!user || userDevices.length === 0) return [];

    // Simulate user's current location (random within NYC area)
    const userLat = 40.7128 + (Math.random() - 0.5) * 0.1;
    const userLng = -74.0060 + (Math.random() - 0.5) * 0.1;

    return userDevices.map(device => {
      const deviceLat = parseFloat(device.latitude) || 40.7128;
      const deviceLng = parseFloat(device.longitude) || -74.0060;

      // Calculate distance in meters
      const distance = this.calculateDistance(userLat, userLng, deviceLat, deviceLng);

      return {
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        distance: Math.round(distance),
        proximity: distance < 100 ? 'Very Close' :
                  distance < 500 ? 'Close' :
                  distance < 1000 ? 'Nearby' : 'Far',
        userLocation: { lat: userLat, lng: userLng },
        deviceLocation: { lat: deviceLat, lng: deviceLng },
        lastUpdated: new Date().toISOString()
      };
    });
  }

  // Simulate Route-to-Device Navigation
  async getRouteToDevice(deviceId, userLocation = null) {
    await this.loadCSVData();
    const device = this.data.devices.find(d => d.deviceId === deviceId);

    if (!device) return null;

    // Use provided user location or generate random one
    const userLat = userLocation?.lat || (40.7128 + (Math.random() - 0.5) * 0.1);
    const userLng = userLocation?.lng || (-74.0060 + (Math.random() - 0.5) * 0.1);
    const deviceLat = parseFloat(device.latitude) || 40.7128;
    const deviceLng = parseFloat(device.longitude) || -74.0060;

    // Simulate route with waypoints
    const route = this.generateRoute(userLat, userLng, deviceLat, deviceLng);

    return {
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      startLocation: { lat: userLat, lng: userLng },
      endLocation: { lat: deviceLat, lng: deviceLng },
      route: route,
      totalDistance: Math.round(this.calculateDistance(userLat, userLng, deviceLat, deviceLng)),
      estimatedTime: Math.round(route.length * 2),
      waypoints: route.length,
      status: 'Active'
    };
  }

  // Simulate Trip Playback
  async getTripPlayback(tripId) {
    await this.loadCSVData();
    const trip = this.data.trips.find(t => t.tripId === tripId);

    if (!trip) return null;

    // Parse route data from CSV
    let routeData = [];
    try {
      if (trip.route && trip.route !== '') {
        routeData = JSON.parse(trip.route);
      }
    } catch (e) {
      // Generate simulated route if parsing fails
      routeData = this.generateSimulatedRoute(trip);
    }

    // Add playback timestamps
    const playbackData = routeData.map((point, index) => ({
      ...point,
      playbackTime: index * 30,
      timestamp: new Date(Date.now() - (routeData.length - index) * 30000).toISOString(),
      status: point.status || 'In Transit'
    }));

    return {
      tripId: trip.tripId,
      deviceId: trip.deviceId,
      driverName: trip.driverName,
      startTime: trip.startTime,
      endTime: trip.endTime,
      status: trip.status,
      route: playbackData,
      totalDuration: playbackData.length * 30,
      geofenceViolations: trip.geofenceViolations,
      slaCompliance: trip.slaCompliance
    };
  }

  // Simulate Automated Route Push
  async getOptimizedRoute(deviceId, packages) {
    await this.loadCSVData();
    const device = this.data.devices.find(d => d.deviceId === deviceId);

    if (!device) return null;

    // Simulate route optimization algorithm
    const optimizedRoute = this.optimizeDeliveryRoute(device, packages);

    return {
      deviceId: deviceId,
      routeId: `ROUTE-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      route: optimizedRoute,
      totalDistance: this.calculateRouteDistance(optimizedRoute),
      estimatedTime: Math.round(optimizedRoute.length * 3),
      stops: optimizedRoute.length,
      fuelEfficiency: 'High',
      trafficConditions: 'Optimal',
      status: 'Ready to Push'
    };
  }

  // Simulate Audit Logging
  async getAuditLogs(filters = {}) {
    await this.loadCSVData();

    // Generate simulated audit logs based on CSV data
    const auditLogs = [];

    // Device-related actions
    this.data.devices.forEach(device => {
      if (device.lastCommand && device.lastCommand !== 'None') {
        auditLogs.push({
          id: `audit-${device.id}-${Date.now()}`,
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          userId: 'admin',
          userName: 'System Administrator',
          action: device.lastCommand,
          resource: 'Device',
          resourceId: device.deviceId,
          resourceName: device.deviceName,
          details: `Command ${device.lastCommand} executed on device ${device.deviceName}`,
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          status: 'Success'
        });
      }
    });

    // User management actions
    this.data.users.forEach(user => {
      if (user.lastLogin) {
        auditLogs.push({
          id: `audit-login-${user.id}`,
          timestamp: user.lastLogin,
          userId: user.id,
          userName: user.fullName,
          action: 'User Login',
          resource: 'Authentication',
          resourceId: user.username,
          resourceName: user.email,
          details: `User ${user.fullName} logged in successfully`,
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          status: 'Success'
        });
      }
    });

    // Apply filters
    let filteredLogs = auditLogs;

    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action.includes(filters.action));
    }

    if (filters.resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
    }

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    // Sort by timestamp (newest first)
    return filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Helper methods for simulations
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  generateRoute(startLat, startLng, endLat, endLng) {
    // Simple route generation with waypoints
    const waypoints = [];
    const steps = 5;
    
    for (let i = 0; i <= steps; i++) {
      const lat = startLat + (endLat - startLat) * (i / steps);
      const lng = startLng + (endLng - startLng) * (i / steps);
      waypoints.push({
        lat: lat + (Math.random() - 0.5) * 0.001, // Add some randomness
        lng: lng + (Math.random() - 0.5) * 0.001,
        status: i === 0 ? 'Start' : i === steps ? 'End' : 'Waypoint'
      });
    }
    
    return waypoints;
  }

  generateSimulatedRoute(trip) {
    // Generate a simulated route for trip playback
    const route = [];
    const baseLat = 40.7128;
    const baseLng = -74.0060;
    
    for (let i = 0; i < 10; i++) {
      route.push({
        lat: baseLat + (Math.random() - 0.5) * 0.1,
        lng: baseLng + (Math.random() - 0.5) * 0.1,
        timestamp: new Date(Date.now() - (10 - i) * 300000).toISOString(),
        status: i === 0 ? 'Start' : i === 9 ? 'End' : 'In Transit'
      });
    }
    
    return route;
  }

  optimizeDeliveryRoute(device, packages) {
    // Simple route optimization simulation
    const route = [];
    
    if (packages && packages.length > 0) {
      packages.forEach((pkg, index) => {
        route.push({
          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
          lng: -74.0060 + (Math.random() - 0.5) * 0.1,
          type: 'Delivery',
          packageId: pkg.packageId,
          estimatedTime: index * 15
        });
      });
    }
    
    return route;
  }

  calculateRouteDistance(route) {
    let totalDistance = 0;
    
    for (let i = 1; i < route.length; i++) {
      totalDistance += this.calculateDistance(
        route[i-1].lat, route[i-1].lng,
        route[i].lat, route[i].lng
      );
    }
    
    return Math.round(totalDistance);
  }

  // Search functionality
  async searchData(query, categories = ['all']) {
    await this.loadCSVData();
    
    const results = [];
    const searchQuery = query.toLowerCase();
    
    if (categories.includes('all') || categories.includes('devices')) {
      const deviceResults = this.data.devices.filter(device =>
        device.deviceName.toLowerCase().includes(searchQuery) ||
        device.deviceId.toLowerCase().includes(searchQuery) ||
        device.location.toLowerCase().includes(searchQuery)
      );
      results.push(...deviceResults.map(d => ({ ...d, type: 'device' })));
    }
    
    if (categories.includes('all') || categories.includes('packages')) {
      const packageResults = this.data.packages.filter(pkg =>
        pkg.packageId.toLowerCase().includes(searchQuery) ||
        pkg.description.toLowerCase().includes(searchQuery)
      );
      results.push(...packageResults.map(p => ({ ...p, type: 'package' })));
    }
    
    if (categories.includes('all') || categories.includes('users')) {
      const userResults = this.data.users.filter(user =>
        user.fullName.toLowerCase().includes(searchQuery) ||
        user.email.toLowerCase().includes(searchQuery)
      );
      results.push(...userResults.map(u => ({ ...u, type: 'user' })));
    }
    
    return results;
  }
}

const csvDataService = new CSVDataService();
export default csvDataService;
