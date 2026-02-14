/**
 * Firebase Realtime Database Service
 * Handles all Firebase Realtime Database operations
 */

// Get Firebase credentials from environment variables
// For React apps, environment variables must start with REACT_APP_
const DATABASE_URL = process.env.REACT_APP_FIREBASE_DATABASE_URL || 'https://kerios-4cf38-default-rtdb.firebaseio.com/';
const DATABASE_SECRET = process.env.REACT_APP_FIREBASE_DATABASE_SECRET || '0MYjfEbMGcsuG96AmGxKMoN1T7mCKsoSpWBhO6RL';

/** Root-level keys that are not device IDs (MAC addresses) - exclude from device list */
const FIREBASE_ROOT_IGNORED_KEYS = ['devices', 'geofencealerts', 'geofence'];

class FirebaseService {
  constructor() {
    this.databaseUrl = DATABASE_URL.endsWith('/') ? DATABASE_URL : `${DATABASE_URL}/`;
    this.authToken = DATABASE_SECRET;
    
    // Warn if using default values (development only)
    if (!process.env.REACT_APP_FIREBASE_DATABASE_URL && process.env.NODE_ENV === 'production') {
      console.warn('[Firebase] Using default DATABASE_URL. Set REACT_APP_FIREBASE_DATABASE_URL environment variable.');
    }
  }

  /**
   * Build URL with authentication
   */
  buildUrl(path) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.databaseUrl}${cleanPath}.json?auth=${this.authToken}`;
  }

  /**
   * Fetch data from Firebase
   */
  async fetchData(path) {
    try {
      const url = this.buildUrl(path);
      console.log(`[Firebase] Fetching from: ${path}`);
      console.log(`[Firebase] Full URL: ${url.replace(this.authToken, '***')}`);
      
      const response = await fetch(url);
      
      console.log(`[Firebase] Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Firebase] Error response:`, errorText);
        throw new Error(`Firebase error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`[Firebase] Data received:`, data);
      
      // Handle null/empty responses
      if (data === null) {
        console.warn(`[Firebase] Path ${path} returned null - data doesn't exist yet`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`[Firebase] Error fetching from Firebase (${path}):`, error);
      console.error(`[Firebase] Error details:`, {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Test Firebase connection and explore database structure
   */
  async testConnection() {
    try {
      console.log('[Firebase] Testing connection...');
      const url = this.buildUrl('');
      console.log('[Firebase] Testing root URL:', url.replace(this.authToken, '***'));
      const response = await fetch(url);
      console.log('[Firebase] Connection test response:', response.status, response.statusText);
      
      if (response.ok) {
        const rootData = await response.json();
        console.log('[Firebase] Root database structure:', rootData);
        if (rootData) {
          console.log('[Firebase] Available paths:', Object.keys(rootData));
        }
      }
      
      return response.ok;
    } catch (error) {
      console.error('[Firebase] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get all devices from root level (MAC addresses)
   */
  async getDevices() {
    try {
      console.log('[Firebase] Getting devices from root level...');
      // Fetch from root to get MAC addresses
      const rootData = await this.fetchData('');
      
      // Handle null (path doesn't exist) or empty object
      if (rootData === null || (typeof rootData === 'object' && Object.keys(rootData).length === 0)) {
        console.warn('[Firebase] No devices found in database root');
        return [];
      }
      
      // Root data contains MAC addresses as keys; ignore known non-device paths
      if (rootData && typeof rootData === 'object' && !Array.isArray(rootData)) {
        const allKeys = Object.keys(rootData);
        const deviceIds = allKeys.filter(
          (key) => !FIREBASE_ROOT_IGNORED_KEYS.includes(String(key).toLowerCase())
        );
        console.log(`[Firebase] Found ${deviceIds.length} device(s) at root (ignored: devices, geofenceAlerts):`, deviceIds);
        
        // Process each device (MAC address)
        const devices = await Promise.all(
          deviceIds.map(async (macAddress) => {
            try {
              // Get the latest location data for this device
              const deviceData = await this.getDeviceLatestLocation(macAddress);
              return deviceData;
            } catch (err) {
              console.error(`[Firebase] Error processing device ${macAddress}:`, err);
              return null;
            }
          })
        );
        
        // Filter out null values
        const validDevices = devices.filter(d => d !== null);
        console.log(`[Firebase] Processed ${validDevices.length} valid device(s)`);
        return validDevices;
      }
      
      console.warn('[Firebase] Unexpected root data format:', typeof rootData);
      return [];
    } catch (error) {
      console.error('[Firebase] Error getting devices:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  /**
   * Get the latest location data for a device (MAC address)
   */
  async getDeviceLatestLocation(macAddress) {
    try {
      // Fetch all timestamped entries for this MAC address
      const devicePath = macAddress;
      const timestampData = await this.fetchData(devicePath);
      
      if (!timestampData || typeof timestampData !== 'object') {
        console.warn(`[Firebase] No data found for device ${macAddress}`);
        return null;
      }
      
      // Get all timestamps and sort them (newest first); use latest entry with valid date only
      const timestamps = Object.keys(timestampData).sort().reverse();
      
      if (timestamps.length === 0) {
        console.warn(`[Firebase] No timestamped entries for device ${macAddress}`);
        return null;
      }
      
      let latestTimestamp = null;
      let latestData = null;
      let timestampDate = null;
      for (const ts of timestamps) {
        const parsed = this.parseTimestamp(ts);
        if (parsed && !Number.isNaN(parsed.getTime())) {
          latestTimestamp = ts;
          latestData = timestampData[ts];
          timestampDate = parsed;
          break;
        }
      }
      if (!latestData) {
        console.warn(`[Firebase] No valid datetime entries for device ${macAddress}`);
        return null;
      }
      
      console.log(`[Firebase] Latest entry for ${macAddress}:`, latestTimestamp, latestData);
      
      // Extract location data
      const lat = latestData.latitude && latestData.latitude !== 'N/a' ? parseFloat(latestData.latitude) : null;
      const lng = latestData.longitude && latestData.longitude !== 'N/a' ? parseFloat(latestData.longitude) : null;
      const alt = latestData.altitude && latestData.altitude !== 'N/a' ? parseFloat(latestData.altitude) : null;
      
      // Determine device name from MAC address or use as-is
      const deviceName = this.formatDeviceName(macAddress);
      
      // Determine status based on data freshness (within last 5 minutes = Active)
      const isActive = timestampDate && (Date.now() - timestampDate.getTime()) < 5 * 60 * 1000;
      
      // Build device object
      const device = {
        id: macAddress,
        deviceId: macAddress,
        macAddress: macAddress,
        name: deviceName,
        type: 'Door Number Plate',
        location: {
          lat: lat || 17.5212, // Default to Hyderabad if no location
          lng: lng || 78.3964,
          altitude: alt || 0,
          address: lat && lng 
            ? `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}` 
            : 'Location not available',
          accuracy: 10 // Default accuracy
        },
        status: isActive ? 'Active' : 'Offline',
        signal: isActive ? 85 : 0, // Estimate signal based on status
        lastSeen: timestampDate,
        lastUpdate: timestampDate,
        latestTimestamp: latestTimestamp,
        entryCount: timestamps.length
      };
      
      return device;
    } catch (error) {
      console.error(`[Firebase] Error getting latest location for ${macAddress}:`, error);
      return null;
    }
  }

  /**
   * Parse timestamp string to Date object. Returns null if invalid (caller should use latest valid).
   */
  parseTimestamp(timestampStr) {
    try {
      if (!timestampStr || typeof timestampStr !== 'string') return null;
      // Format: 2025-11-01_14-37-30
      const parts = timestampStr.split('_');
      if (parts.length === 2) {
        const datePart = parts[0]; // 2025-11-01
        const timePart = parts[1].replace(/-/g, ':'); // 14:37:30
        const dateTimeStr = `${datePart}T${timePart}`;
        const d = new Date(dateTimeStr);
        if (Number.isNaN(d.getTime())) return null;
        return d;
      }
      return null;
    } catch (error) {
      console.error(`[Firebase] Error parsing timestamp ${timestampStr}:`, error);
      return null;
    }
  }

  /**
   * Format MAC address to device name
   */
  formatDeviceName(macAddress) {
    // Convert MAC address to a readable device name
    // e.g., "80:F3:DA:41:5E:C0" -> "Device 80:F3:DA:41:5E:C0"
    const shortMac = macAddress.replace(/:/g, '').substring(0, 6).toUpperCase();
    return `Device ${shortMac} (${macAddress})`;
  }

  /**
   * Get a specific device by ID
   */
  async getDevice(deviceId) {
    try {
      const data = await this.fetchData(`devices/${deviceId}`);
      return { id: deviceId, ...data };
    } catch (error) {
      console.error(`Error getting device ${deviceId}:`, error);
      return null;
    }
  }

  /**
   * Get device updates/location history
   */
  async getDeviceUpdates(deviceId) {
    try {
      const data = await this.fetchData(`devices/${deviceId}/updates`);
      
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error getting device updates for ${deviceId}:`, error);
      return [];
    }
  }

  /**
   * Get geofence alerts
   */
  async getGeofenceAlerts() {
    try {
      const data = await this.fetchData('alerts/geofence');
      
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting geofence alerts:', error);
      return [];
    }
  }

  /**
   * Set up real-time listener for devices (using polling for REST API)
   * Since REST API doesn't support WebSocket, we'll poll every few seconds
   */
  subscribeToDevices(callback, interval = 5000) {
    let isActive = true;
    
    const pollDevices = async () => {
      if (!isActive) return;
      
      try {
        const devices = await this.getDevices();
        callback(devices);
      } catch (error) {
        console.error('Error in device subscription:', error);
      }
    };

    // Initial fetch
    pollDevices();
    
    // Set up polling interval
    const intervalId = setInterval(pollDevices, interval);
    
    // Return unsubscribe function
    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }

  /**
   * Update device location
   */
  async updateDeviceLocation(deviceId, location) {
    try {
      const url = this.buildUrl(`devices/${deviceId}/location`);
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(location)
      });
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating device location for ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Normalize device data from Firebase to match component structure
   */
  normalizeDevice(deviceData) {
    if (!deviceData) return null;

    // Handle both array and object formats
    const device = typeof deviceData === 'object' && !Array.isArray(deviceData)
      ? { ...deviceData }
      : deviceData;

    // Normalize location
    const location = device.location || {
      lat: device.lat || device.latitude || 0,
      lng: device.lng || device.longitude || 0,
      address: device.address || device.location?.address || 'Unknown location',
      accuracy: device.accuracy || device.location?.accuracy || 10
    };

    // Normalize timestamps
    const lastSeen = device.lastSeen 
      ? (typeof device.lastSeen === 'string' ? new Date(device.lastSeen) : new Date(device.lastSeen))
      : new Date();
    
    const lastUpdate = device.lastUpdate 
      ? (typeof device.lastUpdate === 'string' ? new Date(device.lastUpdate) : new Date(device.lastUpdate))
      : lastSeen;

    // Normalize status
    const status = device.status || 
                   (device.online ? 'Active' : 'Offline') ||
                   'Offline';

    return {
      id: device.id || device.deviceId || `device_${Date.now()}`,
      name: device.name || device.deviceName || 'Unknown Device',
      type: device.type || device.deviceType || 'Door Number Plate',
      location: location,
      status: status,
      signal: device.signal || device.signalStrength || device.rssi || 0,
      lastSeen: lastSeen,
      lastUpdate: lastUpdate,
      ...device // Keep any additional properties
    };
  }

  /**
   * Normalize array of devices
   */
  normalizeDevices(devicesData) {
    if (!devicesData) return [];
    
    if (Array.isArray(devicesData)) {
      return devicesData.map(device => this.normalizeDevice(device));
    }
    
    if (typeof devicesData === 'object') {
      return Object.keys(devicesData).map(key => 
        this.normalizeDevice({ id: key, ...devicesData[key] })
      );
    }
    
    return [];
  }
}

// Export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;

