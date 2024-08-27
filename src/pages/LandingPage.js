import React, { useState } from 'react';
import './LandingPage.css';

const LandingPage = ({ onStart }) => {
    const [showInitialOverlay, setShowInitialOverlay] = useState(true);
    const [showStoryOverlay, setShowStoryOverlay] = useState(false);

    const handleInitialClick = () => {
        setShowInitialOverlay(false);
        setShowStoryOverlay(true);
    };

    const handleStoryClick = () => {
        setShowStoryOverlay(false);
        onStart();
    };

    return (
        <div className="landing-page-container">
            {showInitialOverlay && (
                <div className="overlay" onClick={handleInitialClick}>
                    <div className="overlay-content">
                        <p>Hi, my name is Hazem Abo-Donia. Welcome to my portfolio! I hope that by the end of this journey, you will have gotten to know me a little better.</p>
                        <p>Click anywhere to get started.</p>
                    </div>
                </div>
            )}
            {showStoryOverlay && (
                <div className="overlay" onClick={handleStoryClick}>
                    <div className="overlay-content">
                        <p>My fascination with computers began with my Grandfather's mechanical keyboard from the 90's.</p>
                        <p>Let's take a trip back in time to a game that middle school me couldn't get enough of. TypeRacer.</p>
                        <p>Click anywhere to start the typing test.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
