import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImage from '../../assets/images/logo.png';
import './Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('groqApiKey') || '');
  const [showVideo, setShowVideo] = useState(false);
  
  const location = useLocation();
  // Check if we need to show the API key modal on load
  useEffect(() => {
    // Always show settings modal after login
    setSettingsOpen(true);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Navigation items
  const navItems = [
    { name: 'Terms', path: '/terms', icon: 'fa-book-open' },
    { name: 'Lesson Plan', path: '/lessonplan', icon: 'fa-chalkboard-teacher' },
    { name: 'Assessment', path: '/assessment', icon: 'fa-tasks' },
    { name: 'Teacher Assistant', path: '/teacher-assistant', icon: 'fa-user-tie' },
    { name: 'Student Assistant', path: '/student-assistant', icon: 'fa-user-graduate' }
  ];

  const handleApiKeySave = () => {
    localStorage.setItem('groqApiKey', apiKey);
    setSettingsOpen(false);
  };

  const toggleTutorialVideo = () => {
    setShowVideo(!showVideo);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/terms" className="logo">
            <img src={logoImage} alt="EduAssess Logo" className="logo-image" />
          </Link>
        </div>

        <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="nav-list">
            {navItems.map((item, index) => (
              <li key={index} className="nav-item">
                <Link 
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => {
                    // Check if API key is set when navigating to a service
                    if ((item.name === 'Teacher Assistant' || item.name === 'Student Assistant') && 
                        (!apiKey || apiKey.trim() === '')) {
                      setSettingsOpen(true);
                      return;
                    }
                  }}
                >
                  <i className={`fas ${item.icon}`}></i>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          
          <button 
            className="action-btn settings-btn"
            onClick={() => setSettingsOpen(!settingsOpen)}
            aria-label="Settings"
          >
            <i className="fas fa-cog"></i>
          </button>
          
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-list">
          {navItems.map((item, index) => (
            <li key={index} className="mobile-nav-item">
              <Link 
                to={item.path} 
                className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => {
                  setMobileMenuOpen(false);
                  // Check if API key is set when navigating to a service
                  if ((item.name === 'Teacher Assistant' || item.name === 'Student Assistant') && 
                      (!apiKey || apiKey.trim() === '')) {
                    setSettingsOpen(true);
                    return;
                  }
                }}
              >
                <i className={`fas ${item.icon}`}></i>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="settings-modal">
          <div className="settings-content">
            <div className="settings-header">
              <h3>Settings</h3>
              <button 
                className="close-settings"
                onClick={() => {
                  // Only allow closing if API key is set
                  if (apiKey && apiKey.trim() !== '') {
                    setSettingsOpen(false);
                    setShowVideo(false);
                  }
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="settings-body">
              {!showVideo ? (
                <div className="form-group">
                  <label htmlFor="apiKey" className="form-label">GROQ API Key</label>
                  <input
                    type="password"
                    id="apiKey"
                    className="form-control"
                    placeholder="Enter your GROQ API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="api-key-help">
                    <button className="video-link" onClick={toggleTutorialVideo}>
                      Get your API key <i className="fas fa-play-circle"></i>
                    </button>
                  </p>
                  <div className="api-key-info">
                    <i className="fas fa-info-circle"></i>
                    <span>Your API key is required to use the assistant services</span>
                  </div>
                  <button 
                    className="btn btn-primary save-settings-btn"
                    onClick={handleApiKeySave}
                    disabled={!apiKey || apiKey.trim() === ''}
                  >
                    Save Settings
                  </button>
                </div>
              ) : (
                <div className="video-container">
                  <h4>How to get your GROQ API Key</h4>
                  <div className="video-wrapper">
                    <video 
                      controls 
                      autoPlay 
                      width="100%" 
                      src="/assets/videos/GROQ_API_TUTORIAL.mp4"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="video-instructions">
                    <ol>
                      <li>Go to <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer">GROQ Console</a></li>
                      <li>Sign up for an account if you don't have one</li>
                      <li>Navigate to API Keys in your account settings</li>
                      <li>Create a new API key and copy it</li>
                      <li>Paste it in the field above</li>
                    </ol>
                  </div>
                  <button 
                    className="btn btn-secondary back-btn"
                    onClick={toggleTutorialVideo}
                  >
                    <i className="fas fa-arrow-left"></i> Back to Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;