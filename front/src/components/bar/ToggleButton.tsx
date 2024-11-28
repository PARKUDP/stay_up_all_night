import React from 'react';
import styles from './ToggleButton.module.css';

interface ToggleButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ onClick, isOpen }) => (
    <button
    onClick={onClick}
    className={styles.toggle}
    aria-label={isOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
    aria-expanded={isOpen}
    >
        <span className={styles.hamburger}></span>
    </button>
);

export default ToggleButton;