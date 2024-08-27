import React from 'react';
import './Overlay.css';

const Overlay = ({ message, onClick }) => {
    return (
        <div className="overlay" onClick={onClick}>
            <div className="overlay-content">
                {message.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
                <p>Click anywhere to continue.</p>
            </div>
        </div>
    );
};

export default Overlay;
