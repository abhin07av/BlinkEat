import React from "react";
import { Link } from "react-router-dom";

const LoginpgNavBar = () => {
  return (
    <nav className="navbar" style={{ background: 'rgba(13, 17, 23, 0.6)' }}>
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-icon">🍽️</span>
        <span className="navbar-brand-text">BlinkEat</span>
      </Link>

      <ul className="navbar-links">
        <li>
          <Link to="/" className="navbar-link">
            ← Back to Home
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default LoginpgNavBar;
