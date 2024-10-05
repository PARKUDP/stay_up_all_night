import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useParams } from 'react-router-dom';
import './styles.css'; 

interface Assignment {
    id: number;
    title: string;
    completed: boolean;
    term: boolean;
}

function Assignments() {
    const { classId } = useParams<{ classId: string }>();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [className, setClassName] = useState<string>(''); // クラス名を保持

    // 課題とクラス名を取得する関数
    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/classes/${classId}/assignments`)
            .then((response: AxiosResponse<{ class_name: string; assignments: Assignment[] }>) => {
                setClassName(response.data.class_name); // クラス名を設定
                setAssignments(response.data.assignments); // 課題を設定
            })
            .catch((error: Error) => console.error('Error:', error));
    }, [classId]);

    // 課題を追加する関数
    const addAssignment = () => {
        const title = prompt('課題名を入力してください。');
        if (title) {
            axios.post('http://127.0.0.1:5000/assignments', { title, class_id: classId })
                .then((response: AxiosResponse<Assignment>) => {
                    setAssignments([...assignments, response.data]);
                })
                .catch((error: Error) => console.error('Error adding assignment:', error));
        }
        const term = prompt('課題の期限を入力してください。');
        if (term) {
            axios.post('http://127.0.0.1:5000/assignments', { term, class_id: classId })
                .then((response: AxiosResponse<Assignment>) => {
                    setAssignments([...assignments, response.data]);
                })
                .catch((error: Error) => console.error('Error adding assignment:', error));
        }
    };

    // 課題を削除する関数
    const deleteAssignment = (assignmentId: number) => {
        axios.delete(`http://127.0.0.1:5000/assignments/${assignmentId}`)
            .then(() => {
                setAssignments(assignments.filter(a => a.id !== assignmentId));
            })
            .catch((error: Error) => console.error('Error deleting assignment:', error));
    };

    return (
        <div className="container">
            <h3>{className}の課題リスト</h3>
            {assignments.length > 0 ? (
                assignments.map(a => (
                    <div className="input-container" key={a.id}>
                        <div className="input-box" style={{ cursor: 'pointer' }}>
                            {a.title}
                        </div>
                        <button className="close-btn" onClick={() => deleteAssignment(a.id)}>✕</button>
                    </div>
                ))
            ) : (
                <p>登録されている課題がありません。課題を登録してください。</p>
            )}
            <button onClick={addAssignment}>課題登録</button> 
            <p><button onClick={() => window.history.back()}>授業リストページに戻る</button></p>
        </div>
    );
}

export default Assignments;
