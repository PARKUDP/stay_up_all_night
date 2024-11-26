import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Classes, Assignments, LoginForm, RegisterForm, LogoutButton } from './components';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ログイン状態を管理

  const handleLogout = () => {
    setIsLoggedIn(false); // ログイン状態をリセット
    window.location.href = '/login'; // ログイン画面にリダイレクト
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true); // ログイン状態を更新
  };

  return (
    <Router>
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
    </Router>
  );
}

export default App;
