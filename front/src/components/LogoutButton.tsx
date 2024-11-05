import React from 'react';

interface LogoutButtonProps {
  onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  return (
    <button onClick={onLogout} style={{ position: 'absolute', top: 10, right: 10 }}>
      ログアウト
    </button>
  );
};

export default LogoutButton;
