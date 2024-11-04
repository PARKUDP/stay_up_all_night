import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Assignments.css';

interface Assignment {
    id: number;
    title: string;
    completed: boolean;
    term: boolean;
    deadline: string;
    completionCount: number;
    status: '未着手' | '進行中' | '完了';  
}

const Assignments: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [className, setClassName] = useState<string>('');
    const [newTitle, setNewTitle] = useState<string>('');   
    const [newDeadline, setNewDeadline] = useState<string>(''); 
    const navigate = useNavigate();

    // 課題一覧と完了人数を取得
    const fetchAssignments = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Token is missing');
            return;
        }
    
        axios.get(`http://localhost:5001/classes/${classId}/assignments`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(async (response: AxiosResponse<{ class_name: string; assignments: Assignment[] }>) => {
            setClassName(response.data.class_name); 
            const assignmentsWithCount = await Promise.all(
                response.data.assignments.map(async (assignment) => {
                    const statusResponse = await axios.get(`http://localhost:5001/assignments/${assignment.id}/status`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const completionResponse = await axios.get(`http://localhost:5001/assignments/${assignment.id}/completion_count`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    return { 
                        ...assignment, 
                        completionCount: completionResponse.data.completion_count, 
                        status: statusResponse.data.status 
                    };
                })
            );
            setAssignments(assignmentsWithCount); 
        })
        .catch((error) => console.error('Error fetching assignments:', error));
    }, [classId]);
    
    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);
    
    const updateStatus = (assignmentId: number, newStatus: '未着手' | '進行中' | '完了') => {
        const token = localStorage.getItem('token');
        const assignment = assignments.find(a => a.id === assignmentId);

        if (!assignment) return;

        // ステータス変更前の状態を取得
        const prevStatus = assignment.status;

        axios.put(`http://localhost:5001/assignments/${assignmentId}/status`, 
            { status: newStatus }, 
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        )
        .then(() => {
            setAssignments((prevAssignments) =>
                prevAssignments.map((assignment) =>
                    assignment.id === assignmentId ? { ...assignment, status: newStatus } : assignment
                )
            );

            // 完了人数の更新
            if (newStatus === '完了' && prevStatus !== '完了') {
                incrementCompletionCount(assignmentId);
            } else if (prevStatus === '完了' && newStatus !== '完了') {
                decrementCompletionCount(assignmentId);
            }
        })
        .catch((error) => console.error('Error updating status:', error));
    };

    const addAssignment = () => {
        if (!newTitle || !newDeadline) {
            console.error('タイトルと期限を入力してください。');
            return;
        }

        const token = localStorage.getItem('token');
        axios.post(`http://localhost:5001/assignments`, {
            title: newTitle,
            deadline: newDeadline,
            class_id: classId,
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((response: AxiosResponse<Assignment>) => {
            setAssignments([...assignments, { ...response.data, completionCount: 0, status: '未着手' }]); 
            setNewTitle('');
            setNewDeadline(''); 
        })
        .catch((error) => console.error('Error adding assignment:', error));
    };

    const incrementCompletionCount = (assignmentId: number) => {
        setAssignments(prevAssignments =>
            prevAssignments.map(assignment =>
                assignment.id === assignmentId
                    ? { ...assignment, completionCount: assignment.completionCount + 1 }
                    : assignment
            )
        );
    };

    const decrementCompletionCount = (assignmentId: number) => {
        setAssignments(prevAssignments =>
            prevAssignments.map(assignment =>
                assignment.id === assignmentId
                    ? { ...assignment, completionCount: Math.max(assignment.completionCount - 1, 0) }
                    : assignment
            )
        );
    };

    const deleteAssignment = (id: number) => {
        const confirmDelete = window.confirm('本当にこの課題を削除しますか？');
        if (!confirmDelete) {
            return; 
        }
    
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:5001/assignments/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(() => {
            setAssignments(assignments.filter(assignment => assignment.id !== id)); 
        })
        .catch((error) => console.error('Error deleting assignment:', error));
    };

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div>
            <h1>{className} - 課題一覧</h1>

            <div>
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

            <ul>
                {assignments.map((assignment) => (
                    <li className="assignment-card" key={assignment.id}>
                        <h2>課題 {assignment.title}</h2>
                        <p>完了済み: {assignment.completed ? 'はい' : 'いいえ'}</p>
                        <p>学期課題: {assignment.term ? 'はい' : 'いいえ'}</p>
                        <p>期限: {assignment.deadline}</p>
                        <p>完了人数: {assignment.completionCount}人</p>
                        <div className="status-container">
                            <select
                                value={assignment.status}
                                onChange={(e) => updateStatus(assignment.id, e.target.value as '未着手' | '進行中' | '完了')}
                                className={`status-${assignment.status}`}
                            >
                                <option value="未着手">未着手</option>
                                <option value="進行中">進行中</option>
                                <option value="完了">完了</option>
                            </select>
                        </div>
                        <div className="assignment-buttons">
                            <button onClick={() => deleteAssignment(assignment.id)}>削除</button>
                        </div>
                    </li>
                ))}
            </ul>

            <button onClick={goBack}>戻る</button>
        </div>
    );
}

export default Assignments;
