import React, { useState, useEffect } from 'react';
import csvDataService from '../services/csvDataService';
import './Users.css';

const Users = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usersData = await csvDataService.getUsers();
      setUsers(usersData || []);
      
    } catch (error) {
      console.error('Failed to load users:', error);
      setError('Failed to load user data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const canManageUsers = ['admin', 'operator'].includes(currentUser.level);
  const canViewUsers = ['admin', 'operator', 'manager', 'supervisor'].includes(currentUser.level);

  if (!canViewUsers) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🚫</div>
        <div className="empty-state-title">Access Denied</div>
        <div className="empty-state-description">
          You don't have permission to view user management.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <span className="loading-spinner"></span>
        Loading user management...
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
            title="Reload the page to try again"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.level === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, level: newRole } : u
      );
      setUsers(updatedUsers);
      
      // Log audit action
      console.log('AUDIT LOG: User role updated', {
        userId,
        newRole,
        updatedBy: currentUser.username,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find(u => u.id === userId);
    if (window.confirm(`Are you sure you want to delete user "${userToDelete?.fullName}"? This action cannot be undone.`)) {
      try {
        const updatedUsers = users.filter(u => u.id !== userId);
        setUsers(updatedUsers);
        
        // Log audit action
        console.log('AUDIT LOG: User deleted', {
          userId,
          username: userToDelete?.username,
          deletedBy: currentUser.username,
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const getRoleColor = (level) => {
    switch (level) {
      case 'admin': return '#ff6b6b';
      case 'operator': return '#00ff88';
      case 'manager': return '#ffa500';
      case 'supervisor': return '#00d4ff';
      case 'analyst': return '#9c27b0';
      case 'viewer': return '#b0b0b0';
      default: return '#b0b0b0';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#00ff88';
      case 'Inactive': return '#ff6b6b';
      case 'Suspended': return '#ffa500';
      default: return '#b0b0b0';
    }
  };

  const getUserStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'Active').length;
    const adminUsers = users.filter(u => u.level === 'admin').length;
    const operatorUsers = users.filter(u => u.level === 'operator').length;

    return { totalUsers, activeUsers, adminUsers, operatorUsers };
  };

  const stats = getUserStats();

  return (
    <div className="users-content">
      <div className="content-header">
        <h1 className="content-title" title="Manage system users and their device tracking permissions">User Management</h1>
        <p className="content-subtitle" title="Create, edit, and manage user accounts with role-based access control">
          Manage system users and their device tracking permissions
        </p>
      </div>

      {/* User Statistics */}
      <div className="user-stats" title="Overview of user account statistics and system usage">
        <div className="stats-grid">
          <div className="stat-card" title="Total number of user accounts in the system">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          
          <div className="stat-card" title="Currently active user accounts">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.activeUsers}</div>
              <div className="stat-label">Active Users</div>
            </div>
          </div>
          
          <div className="stat-card" title="Administrator level users with full system access">
            <div className="stat-icon">👑</div>
            <div className="stat-content">
              <div className="stat-value">{stats.adminUsers}</div>
              <div className="stat-label">Administrators</div>
            </div>
          </div>
          
          <div className="stat-card" title="Operator level users with device management access">
            <div className="stat-icon">⚙️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.operatorUsers}</div>
              <div className="stat-label">Operators</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Controls */}
      <div className="user-controls" title="Search, filter, and add new users to the system">
        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Search users by name, email, or username..."
            className="form-input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            title="Search through users by their name, email address, or username"
          />
          
          <select
            className="form-input filter-select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            title="Filter users by their access level and permissions"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="operator">Operators</option>
            <option value="manager">Managers</option>
            <option value="supervisor">Supervisors</option>
            <option value="analyst">Analysts</option>
            <option value="viewer">Viewers</option>
          </select>
        </div>

        {canManageUsers && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowUserModal(true)}
            title="Create a new user account with specified role and permissions"
          >
            + Add User
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="users-table-container" title="Data table showing all users with their details and available actions">
        <div className="table-header">
          <h2 title="List of all system users with their current status and permissions">Users ({filteredUsers.length})</h2>
        </div>
        
        <table className="users-table">
          <thead>
            <tr>
              <th title="User's profile information including avatar, name, and username">User</th>
              <th title="User's access level and system permissions">Role</th>
              <th title="User's department or organizational unit">Department</th>
              <th title="User's email address for communication">Email</th>
              <th title="Current account status (Active, Inactive, Suspended)">Status</th>
              <th title="User's primary location or office">Location</th>
              <th title="Available actions for this user account">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="user-row">
                <td title={`User: ${user.fullName} (${user.username})`}>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.avatar || '👤'}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user.fullName}</div>
                      <div className="user-username">@{user.username}</div>
                    </div>
                  </div>
                </td>
                
                <td>
                  <span 
                    className="role-badge" 
                    style={{ color: getRoleColor(user.level) }}
                    title={`Role: ${user.level} - ${user.level === 'admin' ? 'Full system access' : user.level === 'operator' ? 'Device management access' : user.level === 'manager' ? 'Team management access' : user.level === 'supervisor' ? 'Supervision access' : user.level === 'analyst' ? 'Data analysis access' : 'Read-only access'}`}
                  >
                    {user.level.toUpperCase()}
                  </span>
                </td>
                
                <td title={`Department: ${user.department || 'Not assigned'}`}>
                  {user.department || 'N/A'}
                </td>
                
                <td title={`Email: ${user.email}`}>
                  {user.email}
                </td>
                
                <td>
                  <span 
                    className="status-badge" 
                    style={{ color: getStatusColor(user.status) }}
                    title={`Status: ${user.status} - ${user.status === 'Active' ? 'Account is active and can access system' : user.status === 'Inactive' ? 'Account is disabled and cannot access system' : 'Account is temporarily suspended'}`}
                  >
                    {user.status || 'Active'}
                  </span>
                </td>
                
                <td title={`Location: ${user.location || 'Not specified'}`}>
                  {user.location || 'N/A'}
                </td>
                
                <td className="action-buttons">
                  {canManageUsers && (
                    <>
                      <button 
                        className="btn btn-secondary btn-xs"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        title="Edit user information, role, permissions, and department"
                      >
                        ✏️ Edit
                      </button>
                      
                      <button 
                        className="btn btn-danger btn-xs"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Permanently remove this user account from the system (cannot be undone)"
                      >
                        🗑️ Delete
                      </button>
                    </>
                  )}
                  
                  {!canManageUsers && (
                    <button 
                      className="btn btn-info btn-xs"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      title="View user information and details (read-only)"
                    >
                      👁️ View
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 title={selectedUser ? `Edit user: ${selectedUser.fullName}` : 'Create new user account'}>
                {selectedUser ? `Edit User: ${selectedUser.fullName}` : 'Add New User'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                title="Close this modal without saving changes"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {selectedUser ? (
                <div className="user-details">
                  <p><strong>Username:</strong> {selectedUser.username}</p>
                  <p><strong>Full Name:</strong> {selectedUser.fullName}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Current Role:</strong> 
                    <span className="role-badge" style={{ color: getRoleColor(selectedUser.level) }}>
                      {selectedUser.level.toUpperCase()}
                    </span>
                  </p>
                  <p><strong>Department:</strong> {selectedUser.department || 'Not assigned'}</p>
                  <p><strong>Status:</strong> 
                    <span className="status-badge" style={{ color: getStatusColor(selectedUser.status) }}>
                      {selectedUser.status || 'Active'}
                    </span>
                  </p>
                  <p><strong>Location:</strong> {selectedUser.location || 'Not specified'}</p>
                  
                  {canManageUsers && (
                    <div className="role-update-section">
                      <h4 title="Change user's access level and permissions">Update User Role</h4>
                      <div className="role-options">
                        {['admin', 'operator', 'manager', 'supervisor', 'analyst', 'viewer'].map(role => (
                          <button
                            key={role}
                            className={`btn ${selectedUser.level === role ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleUpdateUserRole(selectedUser.id, role)}
                            title={`Set user role to ${role} - ${role === 'admin' ? 'Full system access' : role === 'operator' ? 'Device management access' : role === 'manager' ? 'Team management access' : role === 'supervisor' ? 'Supervision access' : role === 'analyst' ? 'Data analysis access' : 'Read-only access'}`}
                          >
                            {role.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="new-user-form">
                  <p title="Form to create a new user account with specified details">New user creation functionality will be implemented here.</p>
                  <p>This will include:</p>
                  <ul>
                    <li title="Basic user information and contact details">User registration form</li>
                    <li title="Assign appropriate access level and permissions">Role assignment</li>
                    <li title="Set user's organizational department">Department assignment</li>
                    <li title="Configure user's location and office">Location setup</li>
                    <li title="Set initial account status and permissions">Account configuration</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                title="Close this modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
