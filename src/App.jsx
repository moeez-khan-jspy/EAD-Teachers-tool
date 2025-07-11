// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Introduction from './components/Introduction/Introduction';
import Lessonplan from './components/Lessonplan/Lessonplan';
import Footer from './components/Footer/Footer';
import Terms from './components/Terms/Terms';
import Assessment from './components/Assessment/Assessment';
import TeacherAssistant from './components/TeacherAssistant/TeacherAssistant';
import StudentAssistant from './components/StudentAssistant/StudentAssistant';

import './App.css';



const App = () => {
  

  useEffect(() => {
    // Check login status when the app loads
    const checkAuth = () => {
      
      
    };

    // Check on initial load
    checkAuth();

    // Set up event listener for storage changes
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  

  return (
    <Router>
      <div className="app">
          <Header />
          <main className="main-content full-height">
            <div className="container">
              <Routes>
  <Route path="/" element={<Terms />} />
  <Route path="/terms" element={<Terms />} />
  <Route path="/introduction" element={<Introduction />} />
  <Route path="/lessonplan" element={<Lessonplan />} />
  <Route path="/assessment" element={<Assessment />} />
  <Route path="/teacher-assistant" element={<TeacherAssistant />} />
  <Route path="/student-assistant" element={<StudentAssistant />} />
  <Route path="*" element={<Navigate to="/terms" replace />} />
</Routes>
            </div>
          </main>
          <Footer />
        </div>
      
    </Router>
  );
};

export default App;