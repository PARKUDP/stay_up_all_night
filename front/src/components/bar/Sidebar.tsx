import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Sidebar.module.css";
import ToggleButton from "./ToggleButton";
import { useNavigate } from "react-router-dom";

interface Class {
    id: number;
    name: string;
}

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [assignmentsOpen, setAssignmentsOpen] = useState(false);
    const [classes, setClasses] = useState<Class[]>([]);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const toggleAssignments = () => {
        setAssignmentsOpen(!assignmentsOpen);
    };

    // Fetch classes data
    useEffect(() => {
        axios
            .get("http://localhost:5001/classes")
            .then((response) => setClasses(response.data))
            .catch((err) => console.error("Failed to fetch classes:", err));
    }, []);

    // Handle class click
    const handleClassClick = (classId: number) => {
        navigate(`/assignments/${classId}`);
    };

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
            <ToggleButton onClick={toggleSidebar} isOpen={isOpen} />
            {isOpen && (
                <nav className={styles.content}>
                    <div className={styles.logoContainer}>
                        <img src='/images/logo.png' alt="Logo" className={styles.logo} />
                        <h2 className={styles.title}>今日も徹夜</h2>
                    </div>
                    <ul className={styles.menu}>
                        <li className={styles.menuItem}>
                            <a href="/">ホーム</a>
                        </li>
                        <li className={styles.menuItem}>
                            <div className={styles.dropdownHeader} onClick={toggleAssignments}>
                                <span>授業一覧</span>
                                <span className={`${styles.dropdownButton} ${assignmentsOpen ? styles.open : ""}`}>
                                    &#x25BC;
                                </span>
                            </div>
                            {assignmentsOpen && (
                                <ul className={styles.subMenu}>
                                    {classes.length > 0 ? (
                                        classes.map((c) => (
                                            <li
                                                key={c.id}
                                                className={styles.subMenuItem}
                                                onClick={() => handleClassClick(c.id)}
                                            >
                                                {c.name}
                                            </li>
                                        ))
                                    ) : (
                                        <li className={styles.subMenuItem}>登録された授業がありません。</li>
                                    )}
                                </ul>
                            )}
                        </li>
                        <li className={styles.menuItem}>
                            <a href="/profile">ログアウト</a>
                        </li>
                    </ul>
                </nav>
            )}
        </aside>
    );
};

export default Sidebar;

