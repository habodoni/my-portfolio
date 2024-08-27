import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './TypingTest.css';

const TypingTest = () => {
    const [text, setText] = useState('');
    const [input, setInput] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate(); // Use navigate hook

    const texts = [
        "Here's some text for you, let's see how fast you can type."
    ];

    useEffect(() => {
        setText(texts[Math.floor(Math.random() * texts.length)]);
        inputRef.current.focus();
    }, []);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                resetTest();
            }
        };
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    const startTest = () => {
        setStartTime(new Date());
        setIsComplete(false);
        setWpm(0);
    };

    const resetTest = () => {
        setInput('');
        setIsComplete(false);
        setWpm(0);
        setText(texts[Math.floor(Math.random() * texts.length)]);
        inputRef.current.focus();
        setStartTime(null);
    };

    const calculateWpm = () => {
        if (startTime) {
            const endTime = new Date();
            const timeTakenInMinutes = (endTime - startTime) / 1000 / 60;
            const wordsTyped = text.trim().split(/\s+/).length;
            const wpm = wordsTyped / timeTakenInMinutes;
            setWpm(Math.round(wpm));
        }
    };

    const handleChange = (e) => {
        const newText = e.target.value;
        if (!startTime) {
            startTest();
        }
        setInput(newText);

        if (newText === text) {
            setIsComplete(true);
            calculateWpm();
        }
    };

    useEffect(() => {
        if (isComplete) {
            const timer = setTimeout(() => {
                navigate('/code-editor'); // Navigate to the code editor page after completion
            }, 3000); // 3-second delay
            return () => clearTimeout(timer);
        }
    }, [isComplete, navigate]);

    const renderText = () => {
        return text.split('').map((char, index) => {
            let className = '';
            if (index < input.length) {
                className = char === input[index] ? 'correct' : 'incorrect';
            }
            return (
                <span key={index} className={className}>
                    {char}
                </span>
            );
        });
    };

    return (
        <div className="typing-test-container" onClick={() => inputRef.current.focus()}>
            <div className="text-display">
                {renderText()}
            </div>
            <textarea
                ref={inputRef}
                value={input}
                onChange={handleChange}
                className="hidden-textarea"
            />
            {isComplete && <p className="wpm-display">Your WPM is: {wpm}</p>}
            {isComplete && <p className="completion-message">Nice! Let's move on...</p>}
            <p className="instructions">Press "Ctrl + R" to reset the test.</p>
            <button className="reset-button" onClick={resetTest}>Reset</button>
        </div>
    );
};

export default TypingTest;
