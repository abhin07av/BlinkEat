import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useFirebase } from "../context/Firebase";

const SignedNavBar = () => {
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

  const handleBrandClick = () => {
    sessionStorage.removeItem("restaurantId");
    sessionStorage.removeItem("orders");
  };
  
  const userInitial = firebase.user?.email?.[0]?.toUpperCase() || "U";

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={handleBrandClick}>
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
            to="/"
            className={`navbar-link ${isActive("/") ? "active" : ""}`}
            onClick={() => { handleBrandClick(); setIsOpen(false); }}
          >
            🏠 Restaurants
          </Link>
        </li>
        <li>
          <Link
            to="/home"
            className={`navbar-link ${isActive("/home") ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            📋 Menu
          </Link>
        </li>
        <li>
          <Link
            to="/carts"
            className={`navbar-link ${isActive("/carts") ? "active" : ""}`}
            onClick={() => setIsOpen(false)}
          >
            🛒 Cart
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

export default SignedNavBar;
