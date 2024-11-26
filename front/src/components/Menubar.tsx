// MenuBar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoImage from '../img/logo.png';
import './Assignments.css';

const MenuBar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="menu-bar">
            <div className="logo-container">
                <img src={LogoImage} alt="Logo" />
            </div>
            <div className="menu-links">
                <a href="/">ホーム</a>
                <a href="/assignments">課題一覧</a>
                <a href="/profile">プロフィール</a>
            </div>
            <button onClick={handleLogout}>ログアウト</button>
        </div>
    );
};

export default MenuBar;
