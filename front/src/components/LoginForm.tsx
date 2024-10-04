import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSubmit: (username: string, password: string) => void;
  errorMessage: string | null;  
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, errorMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (username && password) {
      onSubmit(username, password);
    } else {
      console.error('Usernameとpasswordを入力してください。');
    }
  };

  const goToRegister = () => {
    navigate('/register'); 
  };

  return (
    <div>
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
      <button onClick={handleLoginClick}>ログイン</button> 

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      
      <p>まだアカウントをお持ちではありませんか？</p>
      <button onClick={goToRegister}>会員登録</button>
    </div>
  );
};

export default LoginForm;
