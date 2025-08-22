import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const [activePanel, setActivePanel] = useState('login');
  const [particleCount, setParticleCount] = useState(0);
  const { login } = useAuth();

  // Particle animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setParticleCount(prev => (prev + 1) % 20);
    }, 100);
    return () => clearInterval(interval);
  }, []);

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
      {/* Animated Background Particles */}
      <div className="particle-layer">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`particle particle-${i % 4}`}
            style={{
              '--delay': `${i * 0.1}s`,
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
              '--size': `${Math.random() * 4 + 2}px`,
              '--duration': `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      {/* Floating Branding Elements */}
      <div className="branding-elements">
        <div className="floating-logo floating-logo-1">
          <img src="/branding/app_photo.png" alt="Keiros App" />
        </div>
        <div className="floating-logo floating-logo-2">
          <img src="/branding/holding.png" alt="Keiros Holding" />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="login-content-wrapper">
        {/* Left Panel - Branding & Info */}
        <div className="login-left-panel">
          <div className="branding-section">
            <div className="main-logo-container">
              <div className="logo-glow">
                <img src="/branding/app_photo.png" alt="Keiros ERP" className="main-logo" />
              </div>
            </div>
            <h1 className="brand-title">
              <span className="title-line-1">Keiros</span>
              <span className="title-line-2">ERP</span>
            </h1>
            <p className="brand-subtitle">Next-Generation Device Intelligence</p>
            
            <div className="feature-highlights">
              <div className="feature-item">
                <div className="feature-icon">🚀</div>
                <span>Real-time Tracking</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <span>Secure Management</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <span>Advanced Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="login-right-panel">
          <div className="login-form-container">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Access your digital workspace</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <div className="input-wrapper">
                  <div className="input-icon">👤</div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    disabled={loading}
                    className="form-input"
                  />
                  <div className="input-focus-border"></div>
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <div className="input-icon">🔐</div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
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

              <button type="submit" className="login-btn" disabled={loading}>
                <span className="btn-text">{loading ? 'Authenticating...' : 'Sign In'}</span>
                <div className="btn-glow"></div>
                <div className="btn-particles">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="btn-particle" style={{ '--delay': `${i * 0.1}s` }} />
                  ))}
                </div>
              </button>
            </form>

            {/* Demo Users Toggle */}
            <div className="demo-toggle-section">
              <button
                type="button"
                className="demo-toggle-btn"
                onClick={() => setShowDemoUsers(!showDemoUsers)}
              >
                <span className="toggle-icon">{showDemoUsers ? '🔒' : '🧪'}</span>
                <span className="toggle-text">
                  {showDemoUsers ? 'Hide Demo Users' : 'Show Demo Users'}
                </span>
              </button>
            </div>

            {/* Demo Users Panel */}
            {showDemoUsers && (
              <div className="demo-users-panel">
                <div className="demo-header">
                  <h3>🧪 Demo Access</h3>
                  <p>Test different user roles and features</p>
                </div>
                
                <div className="demo-role-cards">
                  <div className="demo-role-card admin">
                    <div className="role-header">
                      <div className="role-icon">👑</div>
                      <h4>Super Admin</h4>
                    </div>
                    <div className="role-credentials">
                      <div className="credential-item">
                        <span className="credential-label">Username:</span>
                        <span className="credential-value">admin</span>
                      </div>
                      <div className="credential-item">
                        <span className="credential-label">Password:</span>
                        <span className="credential-value">admin123</span>
                      </div>
                    </div>
                    <div className="role-description">
                      Full system access and management capabilities
                    </div>
                  </div>

                  <div className="demo-role-card fleet">
                    <div className="role-header">
                      <div className="role-icon">🚚</div>
                      <h4>Fleet Manager</h4>
                    </div>
                    <div className="role-credentials">
                      <div className="credential-item">
                        <span className="credential-label">Username:</span>
                        <span className="credential-value">fleetmanager</span>
                      </div>
                      <div className="credential-item">
                        <span className="credential-label">Password:</span>
                        <span className="credential-value">fleet123</span>
                      </div>
                    </div>
                    <div className="role-description">
                      Fleet management and delivery operations
                    </div>
                  </div>

                  <div className="demo-role-card user">
                    <div className="role-header">
                      <div className="role-icon">🏠</div>
                      <h4>End User</h4>
                    </div>
                    <div className="role-credentials">
                      <div className="credential-item">
                        <span className="credential-label">Username:</span>
                        <span className="credential-value">enduser</span>
                      </div>
                      <div className="credential-item">
                        <span className="credential-label">Password:</span>
                        <span className="credential-value">user123</span>
                      </div>
                    </div>
                    <div className="role-description">
                      Device monitoring and personal alerts
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Wave Effect */}
      <div className="wave-container">
        <div className="wave wave-1"></div>
        <div className="wave wave-2"></div>
        <div className="wave wave-3"></div>
      </div>
    </div>
  );
};

export default Login;
