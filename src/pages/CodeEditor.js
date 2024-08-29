import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CodeEditor.css';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/python/python';
import Overlay from '../components/Overlay';

const CodeEditor = () => {
    const [code, setCode] = useState('# Write your name in below\nprint("Hello, world! I\'m ")');
    const [output, setOutput] = useState('');
    const [showOverlay, setShowOverlay] = useState(true);
    const navigate = useNavigate();

    const runCode = () => {
        try {
            const name = code.match(/I'm (.+)"/) ? code.match(/I'm (.+)"/)[1] : "";
            setOutput(`Hello, world! I'm ${name}`);
        } catch (error) {
            setOutput(error.message);
        }

        setTimeout(() => {
            navigate('/maze-game');
        }, 3000); 
    };

    const handleOverlayClick = () => {
        setShowOverlay(false);
    };

    return (
        <div className="code-editor-container">
            {showOverlay && (
                <Overlay
                    message={`My love for coding began when I wrote my first "Hello, world!" program.`}
                    onClick={handleOverlayClick}
                />
            )}
            {!showOverlay && (
                <>
                    <p className="intro-text">This is a feeling of euphoria we all wish we could re-experience.</p>
                    <CodeMirror
                        value={code}
                        options={{
                            mode: 'python',
                            theme: 'material',
                            lineNumbers: true,
                        }}
                        onBeforeChange={(editor, data, value) => {
                            setCode(value);
                        }}
                    />
                    <button className="run-button" onClick={runCode}>Run Code</button>
                    <pre className="output">{output}</pre>
                </>
            )}
        </div>
    );
};

export default CodeEditor;