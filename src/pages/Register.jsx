import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useFirebase } from "../context/Firebase";
import bgImage from "../assets/register.png";
import LoginpgNavBar from "../components/loginpgnav";
import { doc, setDoc } from "firebase/firestore";

const RegisterPage = () => {
  const firebase = useFirebase();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer"); // Default: Customer
  const [restaurantName, setRestaurantName] = useState("");

  // ✅ Function to check if orders exist and redirect accordingly
  const checkOrdersAndRedirect = useCallback(() => {
    const orders = JSON.parse(sessionStorage.getItem("orders")) || [];
    if (orders.length > 0) {
      nav("/placeorder");
    } else {
      nav(role === "owner" ? "/owner-dashboard" : "/");
    }
  }, [nav, role]);

  useEffect(() => {
    if (firebase.user) {
      checkOrdersAndRedirect();
    }
  }, [firebase.user, checkOrdersAndRedirect]);

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Registering...");

    try {
      const user = await firebase.signup(email, password, role);
      const userId = user.uid;

      // ✅ Save user role in Firestore
      await setDoc(doc(firebase.db, "users", userId), {
        uid: userId,
        email: user.email,
        role: role,
      });

      // ✅ If user is an owner, save restaurant details
      if (role === "owner") {
        await setDoc(doc(firebase.db, "restaurants", userId), {
          ownerId: userId,
          name: restaurantName,
          menu: [],
        });
      }

      console.log("User registered successfully!");

      // ✅ Store userId and role in sessionStorage
      sessionStorage.setItem("userId", userId);
      sessionStorage.setItem("role", role);

      nav(role === "owner" ? "/owner-dashboard" : "/");
    } catch (error) {
      console.error("Registration failed:", error);
      alert("❌ Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* ✅ Navigation Bar with Higher Z-Index */}
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
        {/* ✅ Reduced z-index of overlay */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-black opacity-50"
          style={{ zIndex: 1 }}
        ></div>

        {/* ✅ Form Container */}
        <div
          className="position-relative bg-white rounded-3 shadow-lg p-4 w-100"
          style={{ maxWidth: "400px", zIndex: 5 }}
        >
          <h2 className="text-center text-dark fw-bold mb-4">📝 Register Yourself</h2>

          {/* ✅ Form */}
          <Form onSubmit={handleRegister}>
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

            {/* Role Selector */}
            <Form.Group controlId="formRole" className="mb-3">
              <Form.Label className="fw-semibold">Role</Form.Label>
              <Form.Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="customer">Customer</option>
                <option value="owner">Restaurant Owner</option>
              </Form.Select>
            </Form.Group>

            {/* Conditional Restaurant Name */}
            {role === "owner" && (
              <Form.Group controlId="formRestaurantName" className="mb-3">
                <Form.Label className="fw-semibold">Restaurant Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter restaurant name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  required
                />
              </Form.Group>
            )}

            {/* ✅ Buttons */}
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" className="fw-semibold">
                Register
              </Button>
            </div>
          </Form>

          {/* ✅ Sign-In Link */}
          <div className="mt-4 text-center">
            <p className="text-secondary">Already have an account?</p>
            <Button
              variant="warning"
              className="fw-semibold"
              onClick={() => nav("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;