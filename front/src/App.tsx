import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Classes from './components/Classes';
import Assignments from './components/Assignments';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import LogoutButton from './components/LogoutButton'; 
import axios from 'axios';

function App() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:5001/login', { username, password });
      const token = response.data.token;
      localStorage.setItem('token', token);
      window.location.href = '/';
    } catch (error) {
      setErrorMessage('ログインに失敗しました。ユーザー名またはパスワードが間違っています。');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm onSubmit={handleLogin} errorMessage={errorMessage} />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/" element={
          <PrivateRoute>
            <div>
              <LogoutButton onLogout={handleLogout} />
              <Classes />
            </div>
          </PrivateRoute>
        } />
        <Route path="/assignments/:classId" element={
          <PrivateRoute>
            <div>
              <LogoutButton onLogout={handleLogout} />
              <Assignments />
            </div>
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
