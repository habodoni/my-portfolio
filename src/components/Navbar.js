import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/typing-test">Typing Test</NavLink>
            <NavLink to="/code-editor">Code Editor</NavLink>
            <NavLink to="/maze-game">Maze Game</NavLink>
            <NavLink to="/resume-timeline">Resume Timeline</NavLink>
            <NavLink to="/contact">Contact</NavLink>
        </nav>
    );
};

export default Navbar;
