import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CodeEditor.css';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import Overlay from '../components/Overlay'; // Ensure the correct path

const CodeEditor = () => {
    const [code, setCode] = useState('// Write your name in below \nconsole.log("Hello, world my name is !");');
    const [output, setOutput] = useState('');
    const [showOverlay, setShowOverlay] = useState(true);
    const navigate = useNavigate();

    const runCode = () => {
        try {
            const consoleLog = console.log;
            const logs = [];
            console.log = (message) => logs.push(message);

            eval(code);

            console.log = consoleLog;

            setOutput(logs.join('\n'));
        } catch (error) {
            setOutput(error.message);
        }

        setTimeout(() => {
            navigate('/maze-game');
        }, 3000); // Redirect after 3 seconds
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
                            mode: 'javascript',
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
