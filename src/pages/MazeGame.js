import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Overlay from '../components/Overlay';
import './MazeGame.css';

const MazeGame = () => {
    const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
    const [isComplete, setIsComplete] = useState(false);
    const [showOverlay, setShowOverlay] = useState(true);
    const navigate = useNavigate();

    const maze = [
        ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
        ['#', 'P', ' ', ' ', '#', ' ', '#', ' ', ' ', ' ', '#', ' ', '#', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
        ['#', ' ', ' ', ' ', '#', ' ', '#', ' ', '#', ' ', '#', ' ', '#', ' ', '#', '#', '#', '#', ' ', '#'],
        ['#', ' ', '#', ' ', ' ', ' ', '#', ' ', '#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#', ' ', '#'],
        ['#', ' ', '#', '#', '#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', '#', '#', ' ', '#', ' ', '#'],
        ['#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#', ' ', ' ', ' ', '#'],
        ['#', '#', '#', '#', '#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', ' ', '#', '#', '#', '#', '#'],
        ['#', ' ', ' ', ' ', ' ', ' ', '#', ' ', ' ', ' ', ' ', ' ', ' ', '#', ' ', ' ', ' ', ' ', ' ', '#'],
        ['#', ' ', '#', '#', '#', ' ', '#', ' ', '#', '#', '#', '#', ' ', '#', '#', '#', '#', '#', ' ', '#'],
        ['#', ' ', '#', ' ', ' ', ' ', '#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
        ['#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', ' ', '#'],
        ['#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
        ['#', ' ', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', ' ', '#'],
        ['#', ' ', '#', ' ', ' ', ' ', '#', ' ', ' ', ' ', '#', ' ', ' ', ' ', ' ', ' ', ' ', '#', ' ', '#'],
        ['#', ' ', '#', ' ', '#', ' ', '#', '#', '#', ' ', '#', '#', '#', '#', '#', '#', ' ', '#', ' ', '#'],
        ['#', ' ', ' ', ' ', '#', ' ', ' ', ' ', '#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#', ' ', ' ', '#'],
        ['#', ' ', '#', '#', ' ', '#', '#', ' ', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
        ['#', '#', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'E', '#'],
        ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
    ];


    const movePlayer = (x, y) => {
        const newX = playerPosition.x + x;
        const newY = playerPosition.y + y;

        if (maze[newY][newX] === ' ' || maze[newY][newX] === 'E') {
            setPlayerPosition({ x: newX, y: newY });
        }

        if (maze[newY][newX] === 'E') {
            setIsComplete(true);
            setTimeout(() => {
                navigate('/resume-timeline');
            }, 3000);
        }
    };

    const handleKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                movePlayer(0, -1);
                break;
            case 'ArrowDown':
            case 's':
                movePlayer(0, 1);
                break;
            case 'ArrowLeft':
            case 'a':
                movePlayer(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
                movePlayer(1, 0);
                break;
            default:
                break;
        }
    };

    const handleOverlayClick = () => {
        setShowOverlay(false);
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [playerPosition]);

    return (
        <div className="maze-game-container">
            {showOverlay && (
                <Overlay
                    message="Last but not least, my love for engineering and problem solving stems from the mazes and puzzles I used to solve as a child."
                    onClick={handleOverlayClick}
                />
            )}
            {!showOverlay && (
                <>
                    <h1>Take a crack at it.</h1>
                    <div className="maze">
                        {maze.map((row, rowIndex) => (
                            <div key={rowIndex} className="maze-row">
                                {row.map((cell, cellIndex) => {
                                    let className = 'maze-cell';
                                    if (cell === '#') className += ' wall';
                                    if (cell === ' ') className += ' path';
                                    if (rowIndex === playerPosition.y && cellIndex === playerPosition.x) className += ' player';
                                    if (cell === 'P') className += ' start';
                                    if (cell === 'E') className += ' end';
                                    return <div key={cellIndex} className={className} />;
                                })}
                            </div>
                        ))}
                    </div>
                    {isComplete && <p className="completion-message">Nice work! Now let's look at my experience...</p>}
                </>
            )}
        </div>
    );
};

export default MazeGame;
