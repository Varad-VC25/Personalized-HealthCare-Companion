import { useState, useEffect, useRef, useContext } from "react";
import {
  FiMessageSquare,
  FiTrash2,
  FiFlag,
  FiSend,
  FiLogOut,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import "./UserMenu.css";
import { ThemeContext } from "../ThemeContext";

/* =========================
   HELPER: NAME FROM EMAIL
========================= */
const getNameFromEmail = (email) => {
  if (!email) return "User";

  const username = email.split("@")[0];
  const clean = username.replace(/[^a-zA-Z]/g, " ");
  const firstName = clean.trim().split(" ")[0];

  return firstName
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
    : "User";
};

function UserMenu({
  showChatbot,
  setShowChatbot,
  onLogout,
  userEmail, // 👈 from App.js
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  const userName = getNameFromEmail(userEmail);
  const initials = userName.charAt(0);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="user-menu" ref={menuRef}>
      {/* Avatar */}
      <button className="user-avatar" onClick={toggleMenu}>
        <span className="avatar-text">{initials}</span>
      </button>

      {menuOpen && (
        <div className="user-dropdown">
          {/* HEADER */}
          <div className="user-dropdown-header">
            <div className="avatar-large">{initials}</div>
            <div>
              <h4>{userName}</h4>
              <p>Personal Health Space</p>
            </div>
          </div>

          <div className="divider" />

          <button onClick={() => setShowChatbot(!showChatbot)}>
            <FiMessageSquare />
            {showChatbot ? "Disable Chatbot" : "Enable Chatbot"}
          </button>

          <button onClick={toggleDarkMode}>
            {darkMode ? <FiSun /> : <FiMoon />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          <div className="divider" />

          <button>
            <FiSend /> Feedback
          </button>

          <button>
            <FiFlag /> Report Issue
          </button>

          <button className="danger">
            <FiTrash2 /> Delete Account
          </button>

          <div className="divider" />

          <button className="logout" onClick={onLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
