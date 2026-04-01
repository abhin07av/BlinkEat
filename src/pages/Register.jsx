import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../context/Firebase";
import { useToast } from "../components/Toast";
import LoginpgNavBar from "../components/loginpgnav";
import { doc, setDoc } from "firebase/firestore";

const RegisterPage = () => {
  const firebase = useFirebase();
  const nav = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("customer");
  const [restaurantName, setRestaurantName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = () => {
    if (password.length === 0) return { level: 0, label: "", color: "" };
    if (password.length < 6) return { level: 1, label: "Too short", color: "var(--color-error)" };
    if (password.length < 8) return { level: 2, label: "Weak", color: "var(--color-warning)" };
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score >= 2) return { level: 4, label: "Strong", color: "var(--color-success)" };
    return { level: 3, label: "Fair", color: "var(--color-warning)" };
  };

  const strength = getPasswordStrength();

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
    setIsLoading(true);

    try {
      const user = await firebase.signup(email, password, role);
      const userId = user.uid;

      await setDoc(doc(firebase.db, "users", userId), {
        uid: userId,
        email: user.email,
        role: role,
      });

      if (role === "owner") {
        await setDoc(doc(firebase.db, "restaurants", userId), {
          ownerId: userId,
          name: restaurantName,
          menu: [],
        });
      }

      sessionStorage.setItem("userId", userId);
      sessionStorage.setItem("role", role);

      toast.success("Welcome to BlinkEat!", "Your account has been created successfully.");
      nav(role === "owner" ? "/owner-dashboard" : "/");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed", error.message || "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <LoginpgNavBar />

      <div className="auth-content">
        <div className="auth-bg" />
        <div className="auth-bg-pattern" />

        <div className="auth-card animate-scaleIn">
          <div className="auth-header">
            <div className="auth-icon">📝</div>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join BlinkEat and start ordering in seconds</p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: '50px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-tertiary)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    padding: '4px',
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {/* Password strength indicator */}
              {password.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '4px',
                  }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: '3px',
                          borderRadius: '2px',
                          background: i <= strength.level ? strength.color : 'var(--color-border)',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: strength.color,
                    fontWeight: 500,
                  }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">I am a</label>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  type="button"
                  className={`btn ${role === "customer" ? "btn-primary" : "btn-secondary"}`}
                  style={{ flex: 1 }}
                  onClick={() => setRole("customer")}
                >
                  🍽️ Customer
                </button>
                <button
                  type="button"
                  className={`btn ${role === "owner" ? "btn-primary" : "btn-secondary"}`}
                  style={{ flex: 1 }}
                  onClick={() => setRole("owner")}
                >
                  🏪 Restaurant Owner
                </button>
              </div>
            </div>

            {role === "owner" && (
              <div className="form-group animate-fadeInUp">
                <label className="form-label" htmlFor="reg-restaurant">Restaurant Name</label>
                <input
                  id="reg-restaurant"
                  type="text"
                  className="form-input"
                  placeholder="Enter your restaurant name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex-center gap-sm">
                  <span className="spinner spinner-sm" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <button onClick={() => nav("/login")}>Sign in</button></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;