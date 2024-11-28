import React, { useState } from 'react';
import styles from './Sidebar.module.css';
import ToggleButton from './ToggleButton';
import { menuItems } from '../../constants/menuItems';
import LogoImage from '../../img/logo.png';

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
            <ToggleButton onClick={toggleSidebar} isOpen={isOpen} />
            
            {isOpen && (
            <nav className={styles.content}>
                <img src={LogoImage} alt="Logo" className={styles.logo}/>
                <h2 className={styles.title}>今日も徹夜</h2>
                <ul className={styles.menu}>
                {menuItems.map((item) => (
                    <li key={item.href} className={styles.menuItem}>
                    <a href={item.href}>{item.label}</a>
                    </li>
                ))}
                </ul>
            </nav>
            )}
        </aside>
    );
};

export default Sidebar;

