import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('Login: Attempting login with:', { username, password });
    
    try {
      const result = await login(username, password);
      console.log('Login: Result:', result);
      
      if (result.success) {
        console.log('Login: Successful login for user:', result.user);
        // Login successful - AuthContext will handle the redirect
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login: Error during login:', err);
      setError('An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🚀 Keiros ERP</h1>
          <p>Device Tracking & Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Users Toggle Button */}
        <div className="demo-toggle-section">
          <button
            type="button"
            className="demo-toggle-btn"
            onClick={() => setShowDemoUsers(!showDemoUsers)}
          >
            {showDemoUsers ? '🔒 Hide Demo Users' : '🧪 Show Demo Users'}
          </button>
        </div>

        {/* Demo Users Section - Only visible when toggled */}
        {showDemoUsers && (
          <div className="demo-users">
            <h3>🧪 Demo Users</h3>
            
            <div className="user-categories">
              {/* Admin Access */}
              <div className="user-category">
                <h4>🔐 Admin Access</h4>
                <div className="user-credential">
                  <strong>Username:</strong> admin | <strong>Password:</strong> admin123
                  <span className="role-badge admin">Super Administrator</span>
                </div>
              </div>

              {/* Delivery Agency Access */}
              <div className="user-category">
                <h4>🚚 Delivery Agency Portal</h4>
                <div className="user-credential">
                  <strong>Username:</strong> fleetmanager | <strong>Password:</strong> fleet123
                  <span className="role-badge fleet">Fleet Manager</span>
                </div>
              </div>

              {/* End User Access */}
              <div className="user-category">
                <h4>🏠 End User Dashboard</h4>
                <div className="user-credential">
                  <strong>Username:</strong> enduser | <strong>Password:</strong> user123
                  <span className="role-badge user">End User</span>
                </div>
              </div>
            </div>

            <div className="demo-info">
              <p><strong>💡 Tip:</strong> Each role provides different access levels and features.</p>
              <p><strong>🚚 Delivery Agency:</strong> Fleet management, package tracking, compliance monitoring</p>
              <p><strong>🔐 Admin:</strong> Full system access and management</p>
              <p><strong>🏠 End User:</strong> Device monitoring and alerts</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
