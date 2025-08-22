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
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        // Login successful - AuthContext will handle the redirect
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Modern Background */}
      <div className="login-background">
        <div className="background-pattern"></div>
        <div className="background-overlay"></div>
      </div>

      {/* 3x1 Layout Container */}
      <div className="login-layout">
        {/* Left Image Panel */}
        <div className="image-panel left-panel">
          <div className="image-container">
            <img 
              src="/branding/holding.png" 
              alt="Keiros Holding" 
              className="panel-image"
              onError={(e) => {
                console.error('Left image failed to load');
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="image-fallback left-fallback">
              <div className="fallback-content">
                <div className="fallback-icon">🏢</div>
                <h3>Keiros Holding</h3>
                <p>Enterprise Solutions</p>
              </div>
            </div>
          </div>
          <div className="panel-overlay">
            <div className="brand-info">
              <h2>Enterprise Device Management</h2>
              <p>Next-generation IoT solutions for modern businesses</p>
            </div>
          </div>
        </div>

        {/* Center Login Panel */}
        <div className="login-panel">
          <div className="login-content">
            {/* Logo Section */}
            <div className="logo-section">
              <div className="logo-container">
                <img 
                  src="/branding/app_photo.png" 
                  alt="Keiros ERP" 
                  className="main-logo"
                  onError={(e) => {
                    console.error('Logo failed to load, showing fallback');
                    e.target.style.display = 'none';
                    document.querySelector('.logo-fallback').style.display = 'flex';
                  }}
                />
                <div className="logo-fallback">
                  <div className="logo-symbol">K</div>
                </div>
              </div>
              <h1 className="brand-title">Keiros ERP</h1>
              <p className="brand-subtitle">Sign in to your workspace</p>
            </div>

            {/* Login Form */}
            <div className="form-container">
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      required
                      disabled={loading}
                      className="form-input"
                    />
                    <div className="input-focus-border"></div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                      className="form-input"
                    />
                    <div className="input-focus-border"></div>
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    <div className="error-icon">⚠️</div>
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="login-button" disabled={loading}>
                  {loading ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <div className="button-arrow">→</div>
                    </>
                  )}
                </button>
              </form>

              {/* Demo Users Toggle */}
              <div className="demo-section">
                <button
                  type="button"
                  className="demo-toggle"
                  onClick={() => setShowDemoUsers(!showDemoUsers)}
                >
                  {showDemoUsers ? 'Hide Demo Users' : 'Show Demo Users'}
                </button>

                {/* Demo Users */}
                {showDemoUsers && (
                  <div className="demo-users">
                    <h3>Demo Access</h3>
                    <div className="demo-grid">
                      <div className="demo-card admin">
                        <div className="demo-header">
                          <div className="role-icon">👑</div>
                          <h4>Super Admin</h4>
                        </div>
                        <div className="demo-credentials">
                          <div className="credential">
                            <span>Username:</span>
                            <code>admin</code>
                          </div>
                          <div className="credential">
                            <span>Password:</span>
                            <code>admin123</code>
                          </div>
                        </div>
                      </div>

                      <div className="demo-card fleet">
                        <div className="demo-header">
                          <div className="role-icon">🚚</div>
                          <h4>Fleet Manager</h4>
                        </div>
                        <div className="demo-credentials">
                          <div className="credential">
                            <span>Username:</span>
                            <code>fleetmanager</code>
                          </div>
                          <div className="credential">
                            <span>Password:</span>
                            <code>fleet123</code>
                          </div>
                        </div>
                      </div>

                      <div className="demo-card user">
                        <div className="demo-header">
                          <div className="role-icon">🏠</div>
                          <h4>End User</h4>
                        </div>
                        <div className="demo-credentials">
                          <div className="credential">
                            <span>Username:</span>
                            <code>enduser</code>
                          </div>
                          <div className="credential">
                            <span>Password:</span>
                            <code>user123</code>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Image Panel */}
        <div className="image-panel right-panel">
          <div className="image-container">
            <img 
              src="/branding/app_photo.png" 
              alt="Keiros ERP" 
              className="panel-image"
              onError={(e) => {
                console.error('Right image failed to load');
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="image-fallback right-fallback">
              <div className="fallback-content">
                <div className="fallback-icon">📱</div>
                <h3>Device Management</h3>
                <p>Smart IoT Solutions</p>
              </div>
            </div>
          </div>
          <div className="panel-overlay">
            <div className="brand-info">
              <h2>Smart Device Intelligence</h2>
              <p>Real-time monitoring and advanced analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
