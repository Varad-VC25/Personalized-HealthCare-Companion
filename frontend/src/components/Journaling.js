import React, { useState, useEffect } from "react";
import {
  FiSave,
  FiClock,
  FiCalendar,
  FiEdit3,
  FiSmile,
  FiTrendingUp,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import "./Journaling.css";

const MOODS = [
  { id: "happy", label: "Happy", emoji: "🙂", color: "#22c55e" },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "#64748b" },
  { id: "sad", label: "Sad", emoji: "😔", color: "#3b82f6" },
  { id: "angry", label: "Angry", emoji: "😡", color: "#ef4444" },
  { id: "tired", label: "Tired", emoji: "😴", color: "#a855f7" },
  { id: "grateful", label: "Grateful", emoji: "😍", color: "#f59e0b" },
];

const PROMPTS = [
  "What made me feel grateful today?",
  "What stressed me today?",
  "What is worrying me right now?",
  "One thing I learned today",
];

const MOCK_HISTORY = [
  {
    id: 1,
    date: "28 Feb 2026",
    mood: "happy",
    text: "Had a great productive day!",
    wordCount: 120,
  },
  {
    id: 2,
    date: "27 Feb 2026",
    mood: "sad",
    text: "Felt a bit down due to weather.",
    wordCount: 95,
  },
  {
    id: 3,
    date: "26 Feb 2026",
    mood: "neutral",
    text: "Just a regular day at work.",
    wordCount: 140,
  },
];

function Journaling() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mood, setMood] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handlePromptClick = (prompt) => {
    setContent((prev) => (prev ? `${prev}\n\n${prompt} ` : `${prompt} `));
  };

  const saveJournal = async () => {
    if (!mood) {
      setToast({ type: "error", message: "Please select a mood first!" });
      return;
    }
    if (!content.trim()) {
      setToast({ type: "error", message: "Journal content cannot be empty!" });
      return;
    }

    setLoading(true);

    // Mock API call
    const journalData = {
      mood: mood.id,
      content: content,
      created_at: new Date().toISOString(),
    };

    console.log("Saving Journal:", journalData);

    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      setToast({ type: "success", message: "Journal saved successfully!" });
      setMood(null);
      setContent("");
    }, 1500);
  };

  const getMoodObj = (id) => MOODS.find((m) => m.id === id);

  return (
    <div className="journaling-container">
      {/* HEADER */}
      <div className="journal-header">
        <div>
          <h1>
            <FiEdit3 /> Journaling
          </h1>
          <p className="date-display">
            <FiCalendar />{" "}
            {currentDate.toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            <span className="time-separator">•</span>
            <FiClock />{" "}
            {currentDate.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* MOOD SELECTOR */}
      <div className="section-block">
        <h3>How are you feeling?</h3>
        <div className="mood-selector">
          {MOODS.map((m) => (
            <button
              key={m.id}
              className={`mood-btn ${mood?.id === m.id ? "selected" : ""}`}
              onClick={() => setMood(m)}
              style={{
                "--mood-color": m.color,
                borderColor: mood?.id === m.id ? m.color : "transparent",
                backgroundColor:
                  mood?.id === m.id ? `${m.color}20` : "var(--bg-secondary)",
              }}
            >
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-label">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PROMPTS */}
      <div className="section-block">
        <div className="prompts-list">
          {PROMPTS.map((prompt, index) => (
            <button
              key={index}
              className="prompt-chip"
              onClick={() => handlePromptClick(prompt)}
            >
              ✨ {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* TEXTAREA */}
      <div className="editor-container">
        <textarea
          className="journal-textarea"
          placeholder="Write your thoughts here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="char-counter">{content.length} chars</div>
      </div>

      {/* SAVE BUTTON */}
      <button
        className={`save-journal-btn ${loading ? "loading" : ""}`}
        onClick={saveJournal}
        disabled={loading}
      >
        {loading ? (
          <span className="loader"></span>
        ) : (
          <>
            <FiSave /> Save Entry
          </>
        )}
      </button>

      {/* HISTORY SECTION */}
      <div className="journal-list">
        <h2>
          <FiTrendingUp /> My Previous Journals
        </h2>
        {MOCK_HISTORY.map((entry) => {
          const moodObj = getMoodObj(entry.mood);
          return (
            <div key={entry.id} className="journal-item">
              <p>{entry.text}</p>
              <small>
                {entry.date} •{" "}
                <span style={{ color: moodObj?.color }}>
                  {moodObj?.emoji} {moodObj?.label}
                </span>{" "}
                • {entry.wordCount} words
              </small>
            </div>
          );
        })}
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default Journaling;
