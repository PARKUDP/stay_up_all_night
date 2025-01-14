import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import FullScreenDetails from './FullScreenDetails';
import './Assignments.css';
import Sidebar from './bar/Sidebar';

interface Assignment {
    id: number;
    title: string;
    deadline: string;
    completionCount: number; // 完了人数
    status: string; // '未着手', '進行中', '完了'
    details?: string; // 課題の詳細
    advice?: string; // アドバイス
}

const Assignments: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();

    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [className, setClassName] = useState<string>('');
    const [newTitle, setNewTitle] = useState<string>('');
    const [newDeadline, setNewDeadline] = useState<string>('');
    const [filter, setFilter] = useState<string>('すべて');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [loadingStatus, setLoadingStatus] = useState<number | null>(null);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [details, setDetails] = useState<string>('');
    const [advice, setAdvice] = useState<string>('');

    const currentUserId = localStorage.getItem('user_id');

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchAssignments = useCallback(async () => {
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) return;

            const response = await axios.get(
                `http://localhost:5001/classes/${classId}/assignments`,
                { params: { user_id: userId } }
            );
            setAssignments(response.data.assignments);
            setClassName(response.data.class_name);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setMessage({ text: '課題の取得に失敗しました。', type: 'error' });
        }
    }, [classId]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

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
                setMessage({ text: '課題の追加に失敗しました。', type: 'error' });
            });
    };

    const updateStatus = async (assignmentId: number, newStatus: string) => {
        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) {
                setMessage({ text: 'ユーザーIDが見つかりません。', type: 'error' });
                return;
            }

            await axios.put(`http://localhost:5001/assignments/${assignmentId}/status`, {
                user_id: parseInt(userId),
                assignment_id: assignmentId,
                status: newStatus
            });

            // 課題一覧を再取得して最新のステータスを反映
            fetchAssignments();
            setMessage({ text: 'ステータスが更新れました。', type: 'success' });
        } catch (error) {
            console.error('Error updating status:', error);
            setMessage({ text: 'ステータスの更新に失敗しました。', type: 'error' });
        }
    };

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

    const saveDetails = () => {
        if (!selectedAssignment) return;

        axios
            .put(`http://localhost:5001/assignments/${selectedAssignment.id}/details`, {
                details,
                advice,
            })
            .then(() => {
                setMessage({ text: '詳細が更新されました！', type: 'success' });
                fetchAssignments();
                setSelectedAssignment(null);
            })
            .catch((err) => {
                console.error('Error saving details:', err);
                setMessage({ text: '詳細の更新に失敗しました。', type: 'error' });
            });
    };

    const filteredAssignments = assignments
        .filter((assignment) => {
            const today = new Date();
            const deadline = new Date(assignment.deadline);
            const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (filter === '未着手') return assignment.status === '未着手';
            if (filter === '進行中') return assignment.status === '進行中';
            if (filter === '完了') return assignment.status === '完了';
            if (filter === '1日以内') return diffDays <= 1;
            if (filter === '3日以内') return diffDays <= 3;
            if (filter === '7日以内') return diffDays <= 7;
            return true;
        })
        .sort((a, b) => {
            // 完了した課題を後ろに
            if (a.status === '完了' && b.status !== '完了') return 1;
            if (a.status !== '完了' && b.status === '完了') return -1;
            return 0;
        });

    return (
        <div className="app-container">
            <Sidebar />
            <div className="content">
                <h1>{className} - 課題一覧</h1>
                {message && <p className={`message ${message.type}`}>{message.text}</p>}

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

                <div className="filter-container">
                    {['すべて', '未着手', '進行中', '完了', '1日以内', '3日以内', '7日以内'].map((option) => (
                        <button
                            key={option}
                            className={`filter-button ${filter === option ? 'active' : ''}`}
                            onClick={() => setFilter(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <ul>
                    {filteredAssignments.map((assignment) => (
                        <li
                            key={assignment.id}
                            className="assignment-card"
                        >
                            <h2>{assignment.title}</h2>
                            <p>期限: {assignment.deadline}</p>
                            <p>ステータス:</p>
                            <select
                                className={`status-select status-${assignment.status}`}
                                value={assignment.status}
                                onChange={(e) => updateStatus(assignment.id, e.target.value)}
                                disabled={loadingStatus === assignment.id}
                            >
                                <option value="未着手">未着手</option>
                                <option value="進行中">進行中</option>
                                <option value="完了">完了</option>
                            </select>
                            <p>完了人数: {assignment.completionCount}人</p>
                            <button onClick={() => deleteAssignment(assignment.id)}>削除</button>
                            <button
                                onClick={() => {
                                    setSelectedAssignment(assignment);
                                    setDetails(assignment.details || '');
                                    setAdvice(assignment.advice || '');
                                }}
                            >
                                詳細を編集
                            </button>
                        </li>
                    ))}
                </ul>

                {selectedAssignment && (
                    <FullScreenDetails
                        assignment={selectedAssignment}
                        details={details}
                        advice={advice}
                        setDetails={setDetails}
                        setAdvice={setAdvice}
                        saveDetails={saveDetails}
                        onClose={() => setSelectedAssignment(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default Assignments;