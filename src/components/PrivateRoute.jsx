import React from "react";
import { Navigate } from "react-router-dom";
import { useFirebase } from "../context/Firebase";

// Requires authentication — redirects to /login
export const PrivateRoute = ({ children }) => {
  const { isLoggedIn, loading } = useFirebase();

  if (loading) {
    return (
      <div className="page-loader">
        <span className="spinner" />
        <p className="text-secondary mt-md">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Requires owner role — redirects to /loginowner
export const OwnerRoute = ({ children }) => {
  const { isLoggedIn, role, loading } = useFirebase();

  if (loading) {
    return (
      <div className="page-loader">
        <span className="spinner" />
        <p className="text-secondary mt-md">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/loginowner" replace />;
  }

  if (role !== "owner") {
    return <Navigate to="/" replace />;
  }

  return children;
};
