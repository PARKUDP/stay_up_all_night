import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LogoImage from '../img/logo.png';
import './RegisterForm.css';

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password) {
      setMessage('UsernameとPasswordを入力してください。');
      setIsError(true);
      return;
    }
    try {
      await axios.post('http://127.0.0.1:5000/register', { username, password });
      setMessage('登録が完了しました！ログイン画面に移動します！');
      setIsError(false);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage('登録に失敗しました。ユーザー名が既に存在する可能性があります。');
      setIsError(true);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="register-container">
      <img src={LogoImage} alt="Logo" />
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
      <button onClick={handleRegister} className="register-button">
        登録
      </button>
      <button onClick={handleBackToLogin} className="back-button">
        ログインに戻る
      </button>
      {message && <p style={{ color: isError ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
};

export default RegisterForm;