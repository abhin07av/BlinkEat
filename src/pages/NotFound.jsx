import React from "react";
import { Link } from "react-router-dom";
import "../pages/Main.css";

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-code gradient-text">404</div>
      <h1 className="not-found-title">Page Not Found</h1>
      <p className="not-found-text">
        The page you're looking for doesn't exist or has been moved. Let's get you back to discovering great food.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">
        ← Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
