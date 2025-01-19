import React, { useState, useEffect } from 'react';
import './FullScreenDetails.css';
import axios from 'axios';

interface FullScreenDetailsProps {
    assignment: {
        id: number;
        title: string;
    };
    details: string;
    advice: string;
    setDetails: (details: string) => void;
    setAdvice: (advice: string) => void;
    saveDetails: () => void;
    onClose: () => void;
}

interface HistoryItem {
    id: number;
    details: string;
    advice: string;
    created_at: string;
}

const FullScreenDetails: React.FC<FullScreenDetailsProps> = ({
    assignment,
    details,
    advice,
    setDetails,
    setAdvice,
    saveDetails,
    onClose
}) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const fetchHistory = () => {
        axios.get(`http://localhost:5001/assignments/${assignment.id}/history`)
            .then(response => {
                setHistory(response.data);
            })
            .catch(error => {
                console.error('履歴の取得に失敗しました:', error);
            });
    };

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = () => {
        saveDetails();
        fetchHistory();
    };

    return (
        <div className="full-screen-details">
            <div className="details-content">
                <h2>{assignment.title} の詳細</h2>
                <div className="current-details">
                    <div className="content-section">
                        <label>
                            内容:
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="課題の内容を記載してください。"
                            />
                        </label>
                    </div>
                    <div className="advice-section">
                        <label>
                            アドバイス:
                            <textarea
                                onChange={(e) => setAdvice(e.target.value)}
                                placeholder="アドバイスや注意点を記載してください。"
                            />
                        </label>
                    </div>
                </div>
                
                <div className="history-section">
                    <h3>アドバイス一覧</h3>
                    <div className="history-list">
                        {history.map(item => (
                            <div key={item.id} className="history-item">
                                <div className="history-timestamp">{item.created_at}</div>
                                <div className="history-content">
                                    <h4>内容:</h4>
                                    <p>{item.details}</p>
                                    <h4>アドバイス:</h4>
                                    <p>{item.advice}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="button-container">
                    <button onClick={handleSave}>変更を保存</button>
                    <button onClick={onClose}>閉じる</button>
                </div>
            </div>
        </div>
    );
};

export default FullScreenDetails;