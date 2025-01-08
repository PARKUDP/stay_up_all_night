import React from 'react';
import './FullScreenDetails.css';
interface FullScreenDetailsProps {
    assignment: {
        title: string;
    };
    details: string;
    advice: string;
    setDetails: (details: string) => void;
    setAdvice: (advice: string) => void;
    saveDetails: () => void;
    onClose: () => void;
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
    return (
        <div className="full-screen-details">
            <div className="details-content">
                <h2>{assignment.title} の詳細</h2>
                <label>
                    内容:
                    <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="課題の内容を記載してください。"
                    />
                </label>
                <label>
                    アドバイス:
                    <textarea
                        value={advice}
                        onChange={(e) => setAdvice(e.target.value)}
                        placeholder="アドバイスや注意点を記載してください。"
                    />
                </label>
                <div className="button-container">
                    <button onClick={saveDetails}>保存</button>
                    <button onClick={onClose}>閉じる</button>
                </div>
            </div>
        </div>
    );
};

export default FullScreenDetails;