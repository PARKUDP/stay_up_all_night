// Sidebar.tsx with fixed navigation to classes list

import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Sidebar.module.css";
import ToggleButton from "./ToggleButton";
import { useNavigate, useParams } from "react-router-dom";
import LogoImage from "../../img/logo.png";

interface Class {
    id: number;
    name: string;
}

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [assignmentsOpen, setAssignmentsOpen] = useState(false);
    const [classes, setClasses] = useState<Class[]>([]);
    const [className, setClassName] = useState<string>("");

    const navigate = useNavigate();
    const { classId } = useParams<{ classId: string }>();

    useEffect(() => {
        // 授業リストを取得
        axios
            .get("http://127.0.0.1:5000/classes")
            .then((response) => setClasses(response.data))
            .catch((err) => console.error("Failed to fetch classes:", err));

        // 課題データから授業名を取得
        if (classId) {
            axios
                .get(`http://127.0.0.1:5000/classes/${classId}/assignments`)
                .then((response) => {
                    console.log("授業データ:", response.data); // デバッグ用
                    if (response.data && response.data.class_name) {
                        setClassName(response.data.class_name);
                    } else {
                        setClassName("授業名が見つかりませんでした");
                    }
                })
                .catch((err) => {
                    console.error("授業名の取得に失敗しました:", err);
                    setClassName("授業名を取得できませんでした");
                });
        } else {
            setClassName("クラスが選択されていません");
        }
    }, [classId]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleNavigateToClasses = () => {
        navigate('-1');
    };

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
            <ToggleButton onClick={toggleSidebar} isOpen={isOpen} />
            {isOpen && (
                <nav className={styles.content}>
                    <div className={styles.logoContainer}>
                        <img src={LogoImage} alt="Logo" className={styles.logo} />
                        <h2 className={styles.title}>{className}</h2>
                    </div>
                    <ul className={styles.menu}>
                        <li className={styles.menuItem}>
                            <div
                                className={styles.dropdownHeader}
                                onClick={() => setAssignmentsOpen(!assignmentsOpen)}
                            >
                                <span>授業一覧</span>
                                <span
                                    className={`${styles.dropdownButton} ${assignmentsOpen ? styles.open : ""}`}
                                >
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
                                                onClick={() => navigate(`/assignments/${c.id}`)}
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
                            <a
                                className={styles.navigateButton}
                                onClick={handleNavigateToClasses}
                            >
                                戻る
                            </a>
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
