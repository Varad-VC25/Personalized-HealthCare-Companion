import React, { useState, useRef, useEffect } from "react";
import { FiMusic, FiPlay, FiPause, FiSearch } from "react-icons/fi";
import "./CalmSounds.css";

const calmSoundsData = [
  {
    category: "Gym",
    type: "Phonk",
    sounds: [
      { title: "Phonk Energy", url: "/sounds/phonk1.mp3" },
      { title: "Gym Beast Mode", url: "/sounds/phonk2.mp3" }
    ]
  },
  {
    category: "Meditation",
    type: "Calm",
    sounds: [
      { title: "Deep Relax", url: "/sounds/calm1.mp3" },
      { title: "Peace Mind", url: "/sounds/calm2.mp3" }
    ]
  },
  {
    category: "Sleep",
    type: "LoFi",
    sounds: [
      { title: "Night Chill", url: "/sounds/lofi1.mp3" },
      { title: "Dream Waves", url: "/sounds/lofi2.mp3" }
    ]
  },
  {
    category: "Nature",
    type: "Ambient",
    sounds: [
      { title: "Rainforest", url: "/sounds/nature1.mp3" },
      { title: "Ocean Waves", url: "/sounds/nature2.mp3" }
    ]
  }
];

const CalmSounds = () => {
  const [currentSound, setCurrentSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const audioRef = useRef(new Audio());

  const playSound = (sound) => {
    const audio = audioRef.current;

    if (currentSound?.url === sound.url && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio.src = sound.url;
    audio.play();
    setCurrentSound(sound);
    setIsPlaying(true);
  };

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => setProgress(audio.currentTime);
    const setMeta = () => setDuration(audio.duration || 0);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", setMeta);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", setMeta);
    };
  }, []);

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setProgress(value);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const filteredData = calmSoundsData.map((cat) => ({
    ...cat,
    sounds: cat.sounds.filter((s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }));

  return (
    <div className="calm-wrapper">
      <div className="background-glow"></div>

      <div className="calm-header">
        <h1><FiMusic /> MindWell Sound Therapy</h1>
        <p>Relax • Focus • Heal • Energize</p>
      </div>

      <div className="search-container">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search sounds..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="categories-container">
        {filteredData.map((cat, index) => (
          <div key={index} className="category-card">
            <div className="category-header">
              <h2>{cat.category}</h2>
              <span>{cat.type}</span>
            </div>

            <div className="sound-grid">
              {cat.sounds.map((sound, i) => (
                <div
                  key={i}
                  className={`sound-card ${currentSound?.url === sound.url ? "active" : ""}`}
                  onClick={() => playSound(sound)}
                >
                  <div className="sound-overlay"></div>

                  <div className="sound-content">
                    <h3>{sound.title}</h3>
                    <button className="play-circle">
                      {currentSound?.url === sound.url && isPlaying ? (
                        <FiPause />
                      ) : (
                        <FiPlay />
                      )}
                    </button>
                  </div>

                  {currentSound?.url === sound.url && isPlaying && (
                    <div className="wave-animation">
                      <span></span><span></span><span></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {currentSound && (
        <div className="floating-player">
          <div className="player-left">
            🎧 {currentSound.title}
          </div>

          <div className="player-right">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={handleSeek}
            />
            <div className="time-row">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalmSounds;