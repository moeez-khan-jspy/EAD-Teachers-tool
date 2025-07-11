import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import logoImage from '../../assets/images/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={logoImage} alt="EAD Logo" className="footer-logo-img" />
            </div>
            <p className="footer-description">
              Empowering educators with modern tools to create, manage, and deliver exceptional 
              learning experiences across Ontario's educational landscape.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-link" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
          
          <div className="footer-links">
            <div className="footer-links-column">
              <h3 className="footer-heading">Quick Links</h3>
              <ul className="footer-menu">
                <li><Link to="/terms">Terms</Link></li>
                <li><Link to="/lessonplan">Lesson Plan</Link></li>
                <li><Link to="/assessment">Assessment</Link></li>
                <li><Link to="/teacher-assistant">Teacher Assistant</Link></li>
                <li><Link to="/student-assistant">Student Assistant</Link></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h3 className="footer-heading">Resources</h3>
              <ul className="footer-menu">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Tutorials</a></li>
                <li><a href="#">FAQs</a></li>
                <li><a href="#">Support</a></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h3 className="footer-heading">Legal</h3>
              <ul className="footer-menu">
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
                <li><a href="#">GDPR Compliance</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">
            &copy; {currentYear} Early Age Development. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;