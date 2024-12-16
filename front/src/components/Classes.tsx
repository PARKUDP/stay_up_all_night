import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  useEffect(() => {
    axios
      .get('http://localhost:5001/classes')
      .then((response) => {
        setClasses(response.data);
        setError(null);
      })
      .catch(() => {
        setError('授業の取得に失敗しました。再試行してください。');
      });
  }, []);

  const handleClassClick = (classId: number) => {
    navigate(`/assignments/${classId}`);
  };

  const addClass = () => {
    const className = prompt('授業名を登録してください。');
    if (!className) return;

    axios
      .post('http://localhost:5001/classes', { name: className })
      .then((response) => {
        setClasses([...classes, response.data]);
        setError(null);
      })
      .catch(() => {
        setError('授業の追加に失敗しました。');
      });
  };

  const deleteClass = (classId: number) => {
    if (!window.confirm('この授業を削除しますか？')) return;

    axios
      .delete(`http://localhost:5001/classes/${classId}`)
      .then(() => {
        setClasses(classes.filter((c) => c.id !== classId));
        setError(null);
      })
      .catch(() => {
        setError('授業の削除に失敗しました。');
      });
  };

  return (
    <div className="container">
      <img src={LogoImage} alt="Logo" className="logo" />
      <h2>授業一覧</h2>
      {error && <p className="error-message">{error}</p>}
      <button onClick={addClass}>授業を追加する</button>
      <div className="classes-list">
        {classes.length > 0 ? (
          classes.map((c) => (
            <div className="class-item" key={c.id}>
              <span onClick={() => handleClassClick(c.id)} className="class-name">
                {c.name}
              </span>
              <button onClick={() => deleteClass(c.id)} className="delete-btn">
                ✕
              </button>
            </div>
          ))
        ) : (
          <p>登録されている授業がありません。授業を登録してください。</p>
        )}
      </div>
    </div>
  );
};

export default Classes;
