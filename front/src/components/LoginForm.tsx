import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import './LoginForm.css';

interface LoginFormProps {
  onLoginSuccess: () => void; // ログイン成功時のコールバック関数
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage('UsernameとPasswordを入力してください。');
      setIsError(true);
      return;
    }
    try {
      await axios.post('http://localhost:5001/login', { username, password });
      setMessage('ログイン成功！');
      setIsError(false);

      const response = await axios.post('http://localhost:5001/login', { username, password });

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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="login-container">
      <img src='/images/logo.png' alt="Logo" />
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
      <span className="usage-link" onClick={openModal}>
        使い方を見る
      </span>
      {message && <p style={{ color: isError ? 'red' : 'green' }}>{message}</p>}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="仕様書"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h3>使い方</h3>
          <button onClick={closeModal} className="close-button">×</button>
        </div>
        <iframe
          src="/doc/Instructions.pdf" 
          title="仕様書"
          width="100%"
          height="600px"
        ></iframe>
      </Modal>
    </div>
  );
};

export default LoginForm;