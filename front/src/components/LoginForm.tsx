import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LogoImage from '../img/logo.png';
import './LoginForm.css';

interface LoginFormProps {
  onLoginSuccess: () => void; // ログイン成功時のコールバック関数
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage('UsernameとPasswordを入力してください。');
      setIsError(true);
      return;
    }
    try {
      await axios.post('http://127.0.0.1:5000/login', { username, password });
      setMessage('ログイン成功！');
      setIsError(false);

      const response = await axios.post('http://127.0.0.1:5000/login', { username, password });

      // サーバーから返された `user_id` を保存
      localStorage.setItem('user_id', response.data.user_id);

      onLoginSuccess(); // ログイン成功時の処理
      navigate('/'); // ダッシュボード画面に移動
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // サーバーエラー時の処理
        setMessage(`エラー: ${error.response.data.error || 'ログインに失敗しました。'}`);
      } else {
        // ネットワークエラー時の処理
        setMessage('サーバーに接続できません。ネットワークを確認してください。');
      }
      setIsError(true);
    }
  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <img src={LogoImage} alt="Logo" />
      <h2>ログイン</h2>
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
      <button onClick={handleLogin}>ログイン</button>
      <button onClick={goToRegister}>会員登録</button>
      {message && <p style={{ color: isError ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
};

export default LoginForm;