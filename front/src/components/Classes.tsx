import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import LogoImage from '../img/logo.png';
import './Classes.css';

interface Class {
  id: number;
  name: string;
}

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 授業を取得する関数
  const fetchClasses = () => {
    axios
      .get('http://localhost:5001/classes') // トークン不要
      .then((response: AxiosResponse<Class[]>) => {
        setClasses(response.data);
        setError(null); // エラーリセット
      })
      .catch((err) => {
        console.error('Error:', err);
        setError('授業の取得に失敗しました。再試行してください。');
      });
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // 授業をクリックしたときの処理
  const handleClassClick = (classId: number) => {
    navigate(`/assignments/${classId}`);
  };

  // 授業を追加する関数
  const addClass = () => {
    const className = prompt('授業名を登録してください。');
    if (!className) return;

    axios
      .post('http://localhost:5001/classes', { name: className }) // トークン不要
      .then((response: AxiosResponse<Class>) => {
        setClasses([...classes, response.data]);
        setError(null); // エラーリセット
      })
      .catch((err) => {
        console.error('Error adding class:', err);
        setError('授業の追加に失敗しました。');
      });
  };

  // 授業を削除する関数
  const deleteClass = (classId: number) => {
    const confirmDelete = window.confirm('この授業を削除しますか？');
    if (!confirmDelete) return;

    axios
      .delete(`http://localhost:5001/classes/${classId}`) // トークン不要
      .then(() => {
        setClasses(classes.filter((c) => c.id !== classId));
        setError(null); // エラーリセット
      })
      .catch((err) => {
        console.error('Error deleting class:', err);
        setError('授業の削除に失敗しました。');
      });
  };

  return (
    <div className="container">
      <img src={LogoImage} alt="Logo" />
      <h2>授業を選択する</h2>
      {error && <p className="error-message">{error}</p>}
      <button onClick={addClass}>授業登録を追加する</button>
      {classes.length > 0 ? (
        classes.map((c) => (
          <div className="input-container" key={c.id}>
            <div
              className="input-box"
              onClick={() => handleClassClick(c.id)}
              style={{ cursor: 'pointer' }}
            >
              {c.name}
            </div>
            <button className="close-btn" onClick={() => deleteClass(c.id)}>
              ✕
            </button>
          </div>
        ))
      ) : (
        <p>登録されている授業がありません。授業を登録してください。</p>
      )}
    </div>
  );
};

export default Classes;