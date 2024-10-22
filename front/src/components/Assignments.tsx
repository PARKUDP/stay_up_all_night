import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './styles.css';

interface Assignment {
    id: number;
    title: string;
    completed: boolean;
    term: boolean;
    deadline: string;
}

const Assignments: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [className, setClassName] = useState<string>('');
    const [newTitle, setNewTitle] = useState<string>('');   
    const [newDeadline, setNewDeadline] = useState<string>(''); 
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token'); // JWTトークンを取得

        if (!token) {
            console.error('Token is missing');
            return;
        }

        axios.get(`http://localhost:5001/classes/${classId}/assignments`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((response: AxiosResponse<{ class_name: string; assignments: Assignment[] }>) => {
            setClassName(response.data.class_name); 
            setAssignments(response.data.assignments); 
        })
        .catch((error) => console.error('Error fetching assignments:', error));
    }, [classId]);

    const addAssignment = () => {
        if (!newTitle || !newDeadline) {
            console.error('タイトルと期限を入力してください。');
            return;
        }

        const token = localStorage.getItem('token'); // JWTトークンを取得

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
            setAssignments([...assignments, response.data]); 
            setNewTitle('');  
            setNewDeadline(''); 
        })
        .catch((error) => console.error('Error adding assignment:', error));
    };

    const deleteAssignment = (id: number) => {
        const token = localStorage.getItem('token'); // JWTトークンを取得

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
                    <li key={assignment.id}>
                        <h2>{assignment.title}</h2>
                        <p>完了済み: {assignment.completed ? 'はい' : 'いいえ'}</p>
                        <p>学期課題: {assignment.term ? 'はい' : 'いいえ'}</p>
                        <p>期限: {assignment.deadline}</p>
                        <button onClick={() => deleteAssignment(assignment.id)}>削除</button>
                    </li>
                ))}
            </ul>

            <button onClick={goBack}>戻る</button>
        </div>
    );
}

export default Assignments;
