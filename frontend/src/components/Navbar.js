import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="sidebar">
      <h2 className="logo">AI Resume Checker</h2>
      <ul>
        <li><Link to="/">🏠 Home</Link></li>
        <li><Link to="/resume-build">📄 Resume Build</Link></li>
        <li><Link to="/score-check">📊 Score Check</Link></li>
        <li><Link to="/results">📜 Results</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
