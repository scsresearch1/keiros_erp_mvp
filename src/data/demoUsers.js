// Demo users for testing different access levels
export const demoUsers = [
  // Admin Users
  {
    username: 'admin',
    password: 'admin123',
    fullName: 'Super Administrator',
    level: 'admin',
    email: 'admin@keiros.com'
  },
  
  // Delivery Agency User
  {
    username: 'fleetmanager',
    password: 'fleet123',
    fullName: 'Fleet Manager',
    level: 'fleetmanager',
    email: 'fleet@delivery.com'
  },
  
  // End User
  {
    username: 'enduser',
    password: 'user123',
    fullName: 'End User',
    level: 'enduser',
    email: 'user@keiros.com'
  }
];

// Helper function to get user level information
export const getUserLevel = (level) => {
  const levels = {
    admin: { name: 'Super Administrator', access: 'Full System Access' },
    fleetmanager: { name: 'Fleet Manager', access: 'Fleet & Logistics Management' },
    enduser: { name: 'End User', access: 'Device Monitoring Only' }
  };
  return levels[level] || { name: 'Unknown', access: 'No Access' };
};
