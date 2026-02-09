"use client";

import { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiCheckCircle,
  FiTarget,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";
import "./GoalSetting.css";

export default function GoalSetting({ onBack }) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Mental");
  const [duration, setDuration] = useState(30);
  const [quote, setQuote] = useState("");
  const [priority, setPriority] = useState(false);

  /* 🔥 Load & Persist */
  useEffect(() => {
    const saved = localStorage.getItem("goals");
    if (saved) setGoals(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  const addGoal = () => {
    if (!title.trim()) return;

    setGoals((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        category,
        duration,
        quote:
          quote || "Small consistent steps lead to big changes 🌱",
        progress: 0,
        completed: false,
        editing: false,
        priority,
        streak: 0,
      },
    ]);

    setTitle("");
    setQuote("");
    setDuration(30);
    setCategory("Mental");
    setPriority(false);
    setShowModal(false);
  };

  const updateProgress = (id, value) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              progress: value,
              completed: value === 100,
              streak: value > g.progress ? g.streak + 1 : g.streak,
            }
          : g
      )
    );
  };

  const toggleEdit = (id) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, editing: !g.editing } : g
      )
    );
  };

  const togglePriority = (id) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, priority: !g.priority } : g
      )
    );
  };

  const updateTitle = (id, value) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, title: value } : g
      )
    );
  };

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const filteredGoals = goals.filter((g) => {
    if (filter === "active") return !g.completed;
    if (filter === "completed") return g.completed;
    if (filter === "starred") return g.priority;
    return true;
  });

  const completedCount = goals.filter((g) => g.completed).length;
  const avgProgress =
    goals.length === 0
      ? 0
      : Math.round(
          goals.reduce((a, b) => a + b.progress, 0) / goals.length
        );

  return (
    <div className="goal-setting">
      {/* HEADER */}
      <div className="goal-header">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            <FiArrowLeft /> Back
          </button>
        )}
        <div>
          <h1>Goal Setting</h1>
          <p>{today}</p>
        </div>
      </div>

      {/* STATS */}
      <div className="goal-stats">
        <div><FiTarget /> {goals.length} Goals</div>
        <div><FiCheckCircle /> {completedCount} Completed</div>
        <div><FiTrendingUp /> Avg {avgProgress}%</div>
      </div>

      {/* FILTER */}
      <div className="goal-filters">
        {["all", "active", "completed", "starred"].map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* EMPTY */}
      {filteredGoals.length === 0 && (
        <div className="goal-empty">
          <FiTarget size={64} />
          <h2>No goals here ✨</h2>
          <p>Create something meaningful today.</p>
        </div>
      )}

      {/* GOALS */}
      <div className="goal-grid">
        {filteredGoals.map((goal) => (
          <div
            key={goal.id}
            className={`goal-card ${goal.completed ? "completed" : ""}`}
          >
            <div className="goal-top">
              <span className={`tag ${goal.category.toLowerCase()}`}>
                {goal.category}
              </span>
              <button
                className={`star-btn ${goal.priority ? "on" : ""}`}
                onClick={() => togglePriority(goal.id)}
              >
                <FiStar />
              </button>
            </div>

            {goal.editing ? (
              <input
                className="edit-input"
                value={goal.title}
                onChange={(e) =>
                  updateTitle(goal.id, e.target.value)
                }
                onBlur={() => toggleEdit(goal.id)}
                autoFocus
              />
            ) : (
              <h3>{goal.title}</h3>
            )}

            <p className="duration">
              {goal.duration} day journey • 🔥 {goal.streak} streak
            </p>

            <div className="progress-wrap">
              <input
                type="range"
                min="0"
                max="100"
                value={goal.progress}
                onChange={(e) =>
                  updateProgress(goal.id, +e.target.value)
                }
              />
              <span>{goal.progress}%</span>
            </div>

            <p className="quote">“{goal.quote}”</p>

            <div className="goal-actions">
              <button onClick={() => toggleEdit(goal.id)}>
                <FiEdit3 />
              </button>
              <button onClick={() => deleteGoal(goal.id)}>
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD */}
      <button
        className="add-goal-btn"
        onClick={() => setShowModal(true)}
      >
        <FiPlus /> New Goal
      </button>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="goal-modal">
            <h2>Create Goal</h2>

            <input
              placeholder="Goal title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Mental</option>
              <option>Productivity</option>
              <option>Fitness</option>
              <option>Personal</option>
            </select>

            <select
              value={duration}
              onChange={(e) => setDuration(+e.target.value)}
            >
              <option value={7}>7 Days</option>
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
            </select>

            <input
              placeholder="Motivational quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
            />

            <label className="priority-check">
              <input
                type="checkbox"
                checked={priority}
                onChange={() => setPriority(!priority)}
              />
              Mark as priority
            </label>

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="primary" onClick={addGoal}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}