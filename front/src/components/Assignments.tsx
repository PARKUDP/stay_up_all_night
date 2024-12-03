import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Assignments.css';
import Sidebar from './bar/Sidebar';

interface Assignment {
    id: number;
    title: string;
    deadline: string;
    completionCount: number; // 完了人数
    status: string; // '未着手', '進行中', '完了'
}

const Assignments: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [className, setClassName] = useState<string>('');
    const [newTitle, setNewTitle] = useState<string>('');
    const [newDeadline, setNewDeadline] = useState<string>('');
    const [filter, setFilter] = useState<string>('すべて');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [loadingStatus, setLoadingStatus] = useState<number | null>(null);

    // ユーザーIDを取得
    const currentUserId = localStorage.getItem('user_id');

    // メッセージ表示タイマー
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // 課題データの取得
    const fetchAssignments = useCallback(() => {
        axios
            .get(`http://localhost:5001/classes/${classId}/assignments`)
            .then((response) => {
                setClassName(response.data.class_name);
                setAssignments(response.data.assignments);
            })
            .catch((error) => {
                console.error('Error fetching assignments:', error.response || error.message);
                setMessage({ text: '課題の取得に失敗しました。', type: 'error' });
            });
    }, [classId]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    // 新しい課題を追加
    const addAssignment = () => {
        if (!newTitle.trim() || !newDeadline) {
            setMessage({ text: 'タイトルと期限を入力してください。', type: 'error' });
            return;
        }
    
        axios
            .post('http://localhost:5001/assignments', {
                title: newTitle.trim(),
                deadline: newDeadline,
                class_id: classId,
            })
            .then((response) => {
                setAssignments((prev) => [...prev, response.data]);
                setNewTitle('');
                setNewDeadline('');
                setMessage({ text: '課題が追加されました！', type: 'success' });
            })
            .catch((error) => {
                console.error('Error adding assignment:', error.response || error.message);
                if (error.response && error.response.data.error) {
                    setMessage({ text: error.response.data.error, type: 'error' });
                } else {
                    setMessage({ text: '課題の追加に失敗しました。', type: 'error' });
                }
            });
    };
    

    // 課題のステータスを更新
    const updateStatus = (assignmentId: number, userId: string | null, newStatus: string)=> {
        if (!userId) {
            setMessage({ text: 'ユーザー情報が見つかりません。ログインし直してください。', type: 'error' });
            return;
        }

        setLoadingStatus(assignmentId);

        axios
            .put(`http://localhost:5001/assignments/${assignmentId}/status`, { user_id: currentUserId, status: newStatus })
            .then((response) => {
                setAssignments((prev) =>
                    prev.map((assignment) =>
                        assignment.id === assignmentId
                            ? { ...assignment, status: newStatus, completionCount: response.data.completionCount }
                            : assignment
                    )
                );
                setMessage({ text: 'ステータスが更新されました。', type: 'success' });
            })
            .catch((error) => {
                console.error('Error updating status:', error.response || error.message);
                setMessage({ text: 'ステータスの更新に失敗しました。', type: 'error' });
            })
            .finally(() => setLoadingStatus(null));
    };

    // 課題を削除
    const deleteAssignment = (id: number) => {
        if (!window.confirm('本当にこの課題を削除しますか？')) return;

        axios
            .delete(`http://localhost:5001/assignments/${id}`)
            .then(() => {
                setAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
                setMessage({ text: '課題が削除されました。', type: 'success' });
            })
            .catch((error) => {
                console.error('Error deleting assignment:', error.response || error.message);
                setMessage({ text: '課題の削除に失敗しました。', type: 'error' });
            });
    };

    // フィルタリング処理
    const filteredAssignments = assignments.filter((assignment) => {
        const today = new Date();
        const deadline = new Date(assignment.deadline);
        const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
        // ステータスでフィルタリング
        if (filter === '未着手') return assignment.status === '未着手';
        if (filter === '進行中') return assignment.status === '進行中';
        if (filter === '完了') return assignment.status === '完了';
    
        // 期限でフィルタリング
        if (filter === '1日以内') return diffDays <= 1;
        if (filter === '3日以内') return diffDays <= 3;
        if (filter === '7日以内') return diffDays <= 7;
    
        return true; // "すべて"の場合
    });

    // 戻るボタン
    const goBack = () => {
        navigate(-1);
    };

    const filterOptions = ['すべて', '未着手', '進行中', '完了', '1日以内', '3日以内', '7日以内'];
    return (
        <div className="app-container">
            {/* サイドバー */}
            <Sidebar />
    
            {/* メインコンテンツ */}
            <div className="content">
                <h1>{className} - 課題一覧</h1>
                {message && <p className={`message ${message.type}`}>{message.text}</p>}
    
                {/* フィルタリングボタン */}
                <div className="filter-container">
                    {filterOptions.map((option) => (
                        <button
                            key={option}
                            className={`filter-button ${filter === option ? 'active' : ''}`}
                            onClick={() => setFilter(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>
    
                {/* 課題追加フォーム */}
                <div className="form-container">
                    <h2>新しい課題を追加</h2>
                    <input
                        type="text"
                        placeholder="課題のタイトル"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                    <input
                        type="date"
                        value={newDeadline}
                        onChange={(e) => setNewDeadline(e.target.value)}
                    />
                    <button onClick={addAssignment}>課題を追加</button>
                </div>
    
                {/* 課題リスト */}
                <div>
                    <ul>
                        {filteredAssignments.map((assignment) => (
                            <li className="assignment-card" key={assignment.id}>
                                <h2>{assignment.title}</h2>
                                <p>期限: {assignment.deadline}</p>
                                <p>ステータス:</p>
                                <select
                                    className={`status-select status-${assignment.status}`}
                                    value={assignment.status}
                                    onChange={(e) => 
                                        updateStatus(assignment.id, currentUserId, e.target.value)
                                    }
                                    disabled={loadingStatus === assignment.id}
                                >
                                    <option value="未着手">未着手</option>
                                    <option value="進行中">進行中</option>
                                    <option value="完了">完了</option>
                                </select>
                                <p>完了人数: {assignment.completionCount}人</p>
                                <button onClick={() => deleteAssignment(assignment.id)}>削除</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Assignments;