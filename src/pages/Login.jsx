import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useFirebase } from "../context/Firebase";
import bgImage from "../assets/login.png";
import LoginpgNavBar from "../components/loginpgnav";
import { doc, getDoc } from "firebase/firestore";
import "./Main.css";

const LoginPage = () => {
  const firebase = useFirebase();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Use useCallback to memoize the function
  const checkOrdersAndRedirect = useCallback(() => {
    const orders = JSON.parse(sessionStorage.getItem("orders")) || [];
    if (orders.length > 0) {
      nav("/placeorder");
    } else {
      nav("/");
    }
  }, [nav]);

  useEffect(() => {
    if (firebase.user) {
      checkOrdersAndRedirect();
    }
  }, [firebase.user, checkOrdersAndRedirect]);

  const Loginacc = async (e) => {
    e.preventDefault();
    console.log("Logging you in...");
    try {
      const result = await firebase.signin(email, password);
      const userId = result.user.uid;

      // ✅ Fetch user role from Firestore
      const userDoc = await getDoc(doc(firebase.db, "users", userId));
      if (userDoc.exists()) {
        const role = userDoc.data().role;

        // ✅ Store userId and role in sessionStorage
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("role", role);

        console.log("User role:", role);
        if (role === "owner") {
          nav("/owner-dashboard");
        } else {
          nav("/");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("❌ Login failed. Please check your credentials.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await firebase.signinWithGoogle();
      checkOrdersAndRedirect();
    } catch (error) {
      console.error("Google sign-in failed:", error);
      alert("❌ Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* ✅ Set higher z-index to make navbar clickable */}
      <div style={{ zIndex: 10 }}>
        <LoginpgNavBar />
      </div>

      {/* ✅ Background with opacity */}
      <div 
        className="flex-grow-1 d-flex justify-content-center align-items-center position-relative"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* ✅ Reduced overlay z-index so it doesn't block navbar clicks */}
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-50" 
          style={{ zIndex: 1 }}
        ></div>

        {/* ✅ Form Container */}
        <div 
          className="position-relative bg-white rounded-3 shadow-lg p-4 w-100" 
          style={{ maxWidth: "400px", zIndex: 5 }}
        >
          <h2 className="text-center text-dark fw-bold mb-4">
            🔑 Identify Yourself
          </h2>

          {/* ✅ Form */}
          <Form onSubmit={Loginacc}>
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
              <Button 
                variant="danger" 
                onClick={handleGoogleSignIn}
                className="fw-semibold"
              >
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

export default LoginPage;
