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
    const navigate = useNavigate();

    const texts = [
        "Here try it out, how fast can you type?"
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
    
        // Normalize both straight and curly apostrophes
        const normalizeApostrophes = (str) => {
            return str.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'").replace(/[\u0027]/g, "'");
        };
    
        const normalizedInput = normalizeApostrophes(newText);
        const normalizedText = normalizeApostrophes(text);
    
        setInput(newText);
    
        console.log("User input:", normalizedInput);
        console.log("Target text:", normalizedText);
    
        if (normalizedInput === normalizedText) {
            console.log("Match found!");
            setIsComplete(true);
            calculateWpm();
        } else {
            console.log("No match yet.");
        }
    };
    
    useEffect(() => {
        if (isComplete) {
            const timer = setTimeout(() => {
                navigate('/code-editor');
            }, 3000);
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
            <p className="instructions">Press "Tab + Enter" to reset the test.</p>
            <button className="reset-button" onClick={resetTest}>Reset</button>
        </div>
    );
};

export default TypingTest;
