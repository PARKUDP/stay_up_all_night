import React, { useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Classes, Assignments, LoginForm, RegisterForm, LogoutButton } from './components';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('isLoggedIn', 'false'); 
    window.location.href = '/login';
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true'); 
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/" element={
        isLoggedIn ? (
          <div>
            <LogoutButton onLogout={handleLogout} />
            <Classes />
          </div>
        ) : (
          <Navigate to="/login" />
        )
      } />
      <Route path="/assignments/:classId" element={
        isLoggedIn ? (
          <div>
            <LogoutButton onLogout={handleLogout} />
            <Assignments />
          </div>
        ) : (
          <Navigate to="/login" />
        )
      } />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;