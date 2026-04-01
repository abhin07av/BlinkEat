import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useFirebase } from "../context/Firebase";

const OwnerNavBar = () => {
  const firebase = useFirebase();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    sessionStorage.removeItem("restaurantId");
    sessionStorage.removeItem("orders");
    firebase.signOut(firebase.firebaseAuth);
    setIsOpen(false);
  };

  const userInitial = firebase.user?.email?.[0]?.toUpperCase() || "O";

  return (
    <nav className="navbar">
      <Link to="/owner-dashboard" className="navbar-brand">
        <span className="navbar-brand-icon">🍽️</span>
        <span className="navbar-brand-text">BlinkEat</span>
        <span className="badge badge-accent" style={{ marginLeft: '8px', fontSize: '10px' }}>Owner</span>
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
            to="/owner-dashboard"
            className={`navbar-link ${isActive("/owner-dashboard") ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            📊 Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/orders"
            className={`navbar-link ${isActive("/orders") ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            📦 Orders
          </Link>
        </li>
        <li>
          <Link
            to="/OrderHistory"
            className={`navbar-link ${isActive("/OrderHistory") ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            📜 History
          </Link>
        </li>
        <li>
          <Link
            to="/"
            className={`navbar-link ${isActive("/") ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            🏠 Restaurants
          </Link>
        </li>
        <div className="navbar-separator" />
        <li>
          <div className="navbar-avatar">{userInitial}</div>
        </li>
        <li>
          <button className="navbar-link" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default OwnerNavBar;
