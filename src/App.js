import React from 'react';
import { HashRouter as Router, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom'; // Switch to HashRouter
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import LandingPage from './pages/LandingPage';
import CodeEditor from './pages/CodeEditor';
import MazeGame from './pages/MazeGame';
import ResumeTimeline from './pages/ResumeTimeline';
import ContactPage from './pages/ContactPage';
import TypingTest from './pages/TypingTest';
import './App.css';
import './PageTransitions.css';

const Navigation = () => {
  const location = useLocation();
  const paths = ['/', '/typing-test', '/code-editor', '/maze-game', '/resume-timeline', '/contact'];
  const currentIndex = paths.indexOf(location.pathname);

  return (
    <div className="navigation-container">
      <div className="progress-bar">
        {paths.map((path, index) => (
          <div key={index} className={`progress-segment ${index <= currentIndex ? 'active' : ''}`}></div>
        ))}
      </div>
      <div className="navigation-text">
        {paths.map((path, index) => (
          <Link key={index} to={path} className="navigation-link">
            {path === '/' ? 'Home' : path.replace('/', '').replace('-', ' ')}
          </Link>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <Navigation />
      <div className="content-container">
        <TransitionGroup>
          <CSSTransition key={location.key} classNames="fade" timeout={500}>
            <Routes location={location}>
              <Route path="/" element={<LandingPage onStart={() => navigate('/typing-test')} />} />
              <Route path="/typing-test" element={<TypingTest />} />
              <Route path="/code-editor" element={<CodeEditor />} />
              <Route path="/maze-game" element={<MazeGame />} />
              <Route path="/resume-timeline" element={<ResumeTimeline />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </CSSTransition>
        </TransitionGroup>
      </div>
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
