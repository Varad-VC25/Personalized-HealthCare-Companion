import React, { useState } from "react";
import { FiMail, FiLock, FiCheck } from "react-icons/fi";

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

function Signup({ onSignupSuccess, onSwitch }) {
  const [step, setStep] = useState(1); // 1: details, 2: otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // Call backend to send OTP
    try {
      const response = await fetch("http://127.0.0.1:8000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setStep(2);
      } else {
        alert("Error sending OTP");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp }),
      });
      const data = await response.json();
      if (data.success) {
        onSignupSuccess();
      } else {
        alert("Invalid OTP");
      }
    } catch (err) {
      alert("Verification failed");
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "400px" }}>
      <h2
        style={{ fontSize: "1.8rem", marginBottom: "30px", color: "#1e293b" }}
      >
        {step === 1 ? "Create Account" : "Verify Email"}
      </h2>

      {step === 1 ? (
        <form onSubmit={handleSendOtp} style={styles.form}>
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
          <div style={styles.inputGroup}>
            <FiLock style={styles.icon} />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.button}>
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} style={styles.form}>
          <p style={{ marginBottom: "10px", color: "#64748b" }}>
            Enter the code sent to {email}
          </p>
          <div style={styles.inputGroup}>
            <FiCheck style={styles.icon} />
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.button}>
            Verify & Create
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            style={{
              ...styles.switchBtn,
              fontSize: "0.9rem",
              marginTop: "10px",
            }}
          >
            Back
          </button>
        </form>
      )}

      {step === 1 && (
        <p style={{ marginTop: "20px", textAlign: "center", color: "#64748b" }}>
          Already have an account?{" "}
          <button onClick={onSwitch} style={styles.switchBtn}>
            Log In
          </button>
        </p>
      )}
    </div>
  );
}

export default Signup;
