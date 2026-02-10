import React, { useState, useEffect, useRef } from "react";
import {
  FiPlay,
  FiPause,
  FiRefreshCw,
  FiAward,
  FiSmile,
  FiFrown,
  FiMeh,
  FiWind,
  FiX,
  FiTrendingUp,
} from "react-icons/fi";
import "./Meditation.css";

// Sound asset for timer end
const BELL_SOUND =
  "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

function Meditation() {
  // State
  const [activeSession, setActiveSession] = useState(null); // 'guided', 'custom', null
  const [timer, setTimer] = useState(0); // in seconds
  const [initialTime, setInitialTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false); // 'before' or 'after' or false
  const [moodBefore, setMoodBefore] = useState(null);
  const [moodAfter, setMoodAfter] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(10);
  const [streak, setStreak] = useState(5); // Mock data
  const [totalSessions, setTotalSessions] = useState(12);
  const [recommendation, setRecommendation] = useState("");

  const audioRef = useRef(new Audio(BELL_SOUND));
  const intervalRef = useRef(null);

  // Recommendations Logic
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 10)
      setRecommendation(
        "Morning Clarity: Try the 5 min Stress Relief to start your day.",
      );
    else if (hours > 20)
      setRecommendation(
        "Sleep Hygiene: The Sleep Meditation is perfect for now.",
      );
    else
      setRecommendation(
        "Mid-day Reset: A 2 minute Quick Relax can boost your focus.",
      );
  }, []);

  // Timer Logic
  useEffect(() => {
    if (isRunning && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isRunning) {
      handleSessionEnd();
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleStartRequest = (type, duration, isVideo = false) => {
    // 1. Set Pending Session Data
    setActiveSession({ type, duration, isVideo });
    setInitialTime(duration);
    setTimer(duration);

    // 2. Trigger Mood Check Before
    setShowMoodModal("before");
  };

  const startSession = () => {
    setShowMoodModal(false);
    setIsRunning(true);
    if (activeSession.isVideo) {
      setShowVideo(true);
    }
  };

  const pauseTimer = () => setIsRunning(false);
  const resumeTimer = () => setIsRunning(true);

  const resetTimer = () => {
    setIsRunning(false);
    setTimer(initialTime);
    setShowVideo(false);
  };

  const handleSessionEnd = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    audioRef.current
      .play()
      .catch((e) => console.log("Audio play failed interaction policy"));
    setShowVideo(false);
    setShowMoodModal("after");
  };

  const handleMoodSelection = (mood) => {
    if (showMoodModal === "before") {
      setMoodBefore(mood);
      startSession();
    } else if (showMoodModal === "after") {
      setMoodAfter(mood);
      saveSessionData(mood);
    }
  };

  const saveSessionData = (finalMood) => {
    // Backend Integration Comment
    /*
      // API Call to save session
      const sessionData = {
        type: activeSession.type,
        duration: initialTime,
        moodBefore: moodBefore,
        moodAfter: finalMood,
        timestamp: new Date().toISOString()
      };
      
      fetch('/api/meditation/save', { 
        method: 'POST', 
        body: JSON.stringify(sessionData) 
      });
    */

    // Update Local Stats Mock
    setStreak((prev) => prev + 1);
    setTotalSessions((prev) => prev + 1);
    setShowMoodModal(false);
    setActiveSession(null); // Reset to menu
    setMoodBefore(null);
    setMoodAfter(null);
  };

  // Render Helpers
  const renderMoodModal = () => (
    <div className="mood-modal-overlay">
      <div className="mood-modal">
        <h3>
          {showMoodModal === "before"
            ? "How do you feel right now?"
            : "How do you feel now?"}
        </h3>
        <div className="mood-options">
          <button
            className="mood-btn happy"
            onClick={() => handleMoodSelection("happy")}
          >
            <FiSmile size={32} /> <span>Great</span>
          </button>
          <button
            className="mood-btn neutral"
            onClick={() => handleMoodSelection("neutral")}
          >
            <FiMeh size={32} /> <span>Okay</span>
          </button>
          <button
            className="mood-btn sad"
            onClick={() => handleMoodSelection("sad")}
          >
            <FiFrown size={32} /> <span>Stressed</span>
          </button>
        </div>
        {showMoodModal === "after" && moodBefore && (
          <p className="mood-insight">
            {moodBefore === "sad" || moodBefore === "neutral"
              ? "Great job taking time for yourself! 📈"
              : "Keep that positive energy flowing! ✨"}
          </p>
        )}
      </div>
    </div>
  );

  const renderVideoOverlay = () => (
    <div className="video-overlay">
      <div className="video-container">
        <button className="close-video" onClick={() => setShowVideo(false)}>
          <FiX />
        </button>
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/aNXKjGFUlMs?autoplay=1&controls=0"
          title="Meditation Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div className="video-controls">
        <div className="timer-display-overlay">{formatTime(timer)}</div>
        <button className="control-btn stop" onClick={handleSessionEnd}>
          End Session
        </button>
      </div>
    </div>
  );

  return (
    <div className="meditation-container">
      {showMoodModal && renderMoodModal()}
      {showVideo && renderVideoOverlay()}

      {/* Header Stats */}
      <div className="meditation-header">
        <div className="header-text">
          <h1>Meditation & Focus</h1>
          <p className="recommendation-text">🧘 {recommendation}</p>
        </div>
        <div className="streak-card">
          <div className="streak-icon">
            <FiTrendingUp />
          </div>
          <div className="streak-info">
            <span className="streak-count">{streak} Day Streak 🔥</span>
            <span className="streak-sub">{totalSessions} Sessions Total</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="meditation-grid">
        {/* Left Col: Guided Sessions */}
        <div className="guided-section">
          <h2>Guided Sessions</h2>
          <div className="cards-grid">
            <div
              className="meditation-card relax"
              onClick={() =>
                handleStartRequest("Guided: Quick Relax", 120, true)
              }
            >
              <div className="card-icon-bg">
                <FiWind />
              </div>
              <h3>Quick Relax</h3>
              <p>2 Min • Reset</p>
            </div>

            <div
              className="meditation-card stress"
              onClick={() =>
                handleStartRequest("Guided: Stress Relief", 300, true)
              }
            >
              <div className="card-icon-bg">
                <FiFrown />
              </div>
              <h3>Stress Relief</h3>
              <p>5 Min • Calm</p>
            </div>

            <div
              className="meditation-card focus"
              onClick={() =>
                handleStartRequest("Guided: Deep Focus", 600, true)
              }
            >
              <div className="card-icon-bg">
                <FiRefreshCw />
              </div>
              <h3>Deep Focus</h3>
              <p>10 Min • Clarity</p>
            </div>

            <div
              className="meditation-card sleep"
              onClick={() => handleStartRequest("Guided: Sleep", 900, true)}
            >
              <div className="card-icon-bg">
                <FiAward />
              </div>
              <h3>Sleep Well</h3>
              <p>15 Min • Rest</p>
            </div>
          </div>
        </div>

        {/* Right Col: Custom Timer */}
        <div className="timer-section">
          <h2>Custom Timer</h2>
          <div className={`timer-circle ${isRunning ? "breathing" : ""}`}>
            <span className="time-text">
              {activeSession && !activeSession.isVideo
                ? formatTime(timer)
                : formatTime(customMinutes * 60)}
            </span>
            <span className="status-text">
              {isRunning ? "Breathe..." : "Ready"}
            </span>
          </div>

          {!isRunning ? (
            <div className="timer-setup">
              <label>Duration (Minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={customMinutes}
                onChange={(e) =>
                  setCustomMinutes(parseInt(e.target.value) || 1)
                }
              />
              <button
                className="start-btn"
                onClick={() =>
                  handleStartRequest("Custom Timer", customMinutes * 60, false)
                }
              >
                <FiPlay /> Start
              </button>
            </div>
          ) : (
            <div className="timer-controls">
              <button
                className="control-btn pause"
                onClick={isRunning ? pauseTimer : resumeTimer}
              >
                {isRunning ? <FiPause /> : <FiPlay />}
              </button>
              <button className="control-btn reset" onClick={resetTimer}>
                <FiRefreshCw />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Meditation;
