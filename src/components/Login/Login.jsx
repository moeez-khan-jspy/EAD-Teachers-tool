import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import loginData from '../../assets/data/login_data.json';
import logoImage from '../../assets/images/logo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Check if the user is already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      navigate('/terms');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    // Simulate network request with a fixed timeout to prevent glitching
    setTimeout(() => {
      try {
        const user = loginData.users.find(
          (user) => user.username === username && user.password === password
        );

        if (user) {
          // Set login state before navigation to prevent UI glitches
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', username);
          
          // If user doesn't have an API key saved, set flag to show API key modal on terms page
          if (!localStorage.getItem('groqApiKey')) {
            localStorage.setItem('showApiKeyModal', 'true');
          }
          
          // Navigate to terms page after login
          navigate('/terms');
        } else {
          setError('Invalid username or password');
          setLoading(false);
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('An error occurred during login. Please try again.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <img src={logoImage} alt="EduAssess Logo" />
          </div>
          
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to continue to EduAssess</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input-field"
                  disabled={loading}
                />
                <i className="fas fa-user icon"></i>
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
                  className="input-field"
                  disabled={loading}
                />
                <i className="fas fa-lock icon"></i>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <span><i className="fas fa-spinner fa-spin"></i> Signing In</span>
              ) : (
                <span>Sign In <i className="fas fa-sign-in-alt"></i></span>
              )}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Educational Assessment Tool</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
