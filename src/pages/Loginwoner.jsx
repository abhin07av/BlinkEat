import React, { useState, useEffect, useCallback } from "react";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { useFirebase } from "../context/Firebase";
import { doc, getDoc } from "firebase/firestore";
import bgImage from "../assets/Chef_Hat.png";
import LoginpgNavBar from "../components/loginpgnav";

const Loginowner = () => {
  const firebase = useFirebase();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const checkUserRole = useCallback(async (userId) => {
    try {
      const userDoc = await getDoc(doc(firebase.db, "users", userId));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("role", role);
        if (role === "owner") {
          nav("/owner-dashboard");
        } else {
          alert("❌ Please sign in as a Customer or Register as an Owner.");
          nav("/");
        }
      } else {
        nav("/register");
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  }, [firebase.db, nav]);

  useEffect(() => {
    if (firebase.user) {
      checkUserRole(firebase.user.uid);
    }
  }, [firebase.user, checkUserRole]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await firebase.signin(email, password);
      checkUserRole(result.user.uid);
    } catch (error) {
      console.error("Login failed:", error);
      alert("❌ Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await firebase.signinWithGoogle();
      checkUserRole(result.user.uid);
    } catch (error) {
      console.error("Google sign-in failed:", error);
      alert("❌ Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* ✅ Increased z-index to make navbar clickable */}
      <div style={{ zIndex: 10 }}>
        <LoginpgNavBar />
      </div>
      
      {/* ✅ Background with consistent styling */}
      <div 
        className="flex-grow-1 d-flex justify-content-center align-items-center position-relative"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* ✅ Reduced overlay z-index so it doesn't block the navbar */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-50" style={{ zIndex: 1 }}></div>

        {/* ✅ Form Container */}
        <div className="position-relative bg-white rounded-3 shadow-lg p-4 w-100" style={{ maxWidth: "400px", zIndex: 5 }}>
          <h2 className="text-center text-dark fw-bold mb-4">
            🔑 Identify Yourself
          </h2>

          {/* ✅ Form */}
          <Form onSubmit={handleLogin}>
            {/* Email Field */}
            <Form.Group controlId="formBasicEmail" className="mb-3">
              <Form.Label className="fw-semibold">Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            {/* Password Field */}
            <Form.Group controlId="formBasicPassword" className="mb-3">
              <Form.Label className="fw-semibold">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            {/* ✅ Buttons */}
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" className="fw-semibold">
                Sign In
              </Button>
              <Button variant="danger" onClick={handleGoogleLogin} className="fw-semibold">
                Sign in with Google
              </Button>
            </div>
          </Form>

          {/* ✅ Register Link */}
          <div className="mt-4 text-center">
            <p className="text-secondary">Don't have an account?</p>
            <Button 
              variant="warning" 
              className="fw-semibold" 
              onClick={() => nav("/register")}
            >
              Register
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loginowner;
