import React, { useState } from "react";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import "./Auth.css";

function Login({ onLoginSuccess, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Mimic backend delay for smoother UI feel
    // Real fetch would go here:
    // const res = await fetch('http://127.0.0.1:8000/login', ...);

    // Using simple mock validation for UX demo as requested to keep backend logic same
    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await response.json();

      if (data.success) {
        onLoginSuccess(email);
      } else {
        setErrors({ form: data.message || "Invalid credentials" });
      }
    } catch (err) {
      setErrors({ form: "Server error, please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue your journey</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {errors.form && (
          <div
            className="error-text"
            style={{ justifyContent: "center", marginBottom: "10px" }}
          >
            <FiAlertCircle /> {errors.form}
          </div>
        )}

        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            className={`form-input ${errors.email ? "error" : ""}`}
            required
          />
          <FiMail className="input-icon" />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            className={`form-input ${errors.password ? "error" : ""}`}
            required
          />
          <FiLock className="input-icon" />
          {errors.password && (
            <span className="error-text">{errors.password}</span>
          )}
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Signing in..." : "Log In"}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account?{" "}
        <button onClick={onSwitch} className="auth-link">
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default Login;
