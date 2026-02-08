import React, { useState } from "react";
import { FiMail, FiLock } from "react-icons/fi";

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "15px",
  },
  inputGroup: { position: "relative" },
  icon: {
    position: "absolute",
    top: "50%",
    left: "15px",
    transform: "translateY(-50%)",
    color: "#64748b",
  },
  input: {
    width: "100%",
    padding: "14px 14px 14px 45px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "1rem",
    outline: "none",
    transition: "border 0.3s",
  },
  button: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#0077b6",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  switchBtn: {
    background: "none",
    border: "none",
    color: "#0077b6",
    cursor: "pointer",
    fontWeight: "600",
  },
};

function Login({ onLoginSuccess, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        alert("Login failed: " + (data.message || "Invalid credentials"));
      }
    } catch (err) {
      alert("Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "400px" }}>
      <h2
        style={{ fontSize: "1.8rem", marginBottom: "30px", color: "#1e293b" }}
      >
        Sign In
      </h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <FiMail style={styles.icon} />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <FiLock style={styles.icon} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Signing in..." : "Log In"}
        </button>
      </form>
      <p style={{ marginTop: "20px", textAlign: "center", color: "#64748b" }}>
        Don't have an account?{" "}
        <button onClick={onSwitch} style={styles.switchBtn}>
          Sign Up
        </button>
      </p>
    </div>
  );
}

export default Login;
