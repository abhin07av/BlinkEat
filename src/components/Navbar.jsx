import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";

const MyNavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-icon">🍽️</span>
        <span className="navbar-brand-text">BlinkEat</span>
      </Link>

      <button
        className={`navbar-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {isOpen && (
        <div
          className={`navbar-overlay ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(false)}
        />
      )}

      <ul className={`navbar-links ${isOpen ? "open" : ""}`}>
        <li>
          <Link
            to="/home"
            className={`navbar-link ${isActive("/home") ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/register"
            className={`navbar-link ${isActive("/register") ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            Register
          </Link>
        </li>
        <li>
          <Link
            to="/login"
            className={`navbar-link ${isActive("/login") ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            Sign In
          </Link>
        </li>
        <div className="navbar-separator" />
        <li>
          <button className="navbar-link theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? "☀️" : "🌙"}
          </button>
        </li>
        <li>
          <Link
            to="/loginowner"
            className="navbar-link navbar-link-highlight"
            onClick={() => setIsOpen(false)}
          >
            🏪 Owner Login
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default MyNavBar;
