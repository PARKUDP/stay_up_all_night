import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/register', {
        username,
        password,
      });
      setMessage('登録完了しました!');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setMessage('登録失敗しました.');
    }
  };

  return (
    <div>
      <h2>会員登録</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>登録</button>
      <p>{message}</p>
    </div>
  );
};

export default RegisterForm;
