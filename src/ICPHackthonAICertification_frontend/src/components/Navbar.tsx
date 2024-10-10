import React from 'react';
import "./navbar.css";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("")}>
        <span className="logo-black">FAI</span><span className="logo-red">3</span>
      </div>
      <div className="nav-links">
        <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
      </div>
    </nav>
  );
}