import React, { useEffect } from 'react';
import './Overlay.css';

const Overlay = ({ message, onClick }) => {

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

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
