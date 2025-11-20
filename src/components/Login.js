import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        // Login successful - navigate to dashboard
        navigate('/');
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

      {/* Center Login Panel */}
      <div className="login-panel" style={{ maxWidth: '500px', margin: '0 auto' }}>
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

                    <div className="demo-card data">
                      <div className="demo-header">
                        <div className="role-icon">📊</div>
                        <h4>Data Admin</h4>
                      </div>
                      <div className="demo-credentials">
                        <div className="credential">
                          <span>Username:</span>
                          <code>data_admin</code>
                        </div>
                        <div className="credential">
                          <span>Password:</span>
                          <code>data_admin</code>
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
    </div>
  );
};

export default Login;
