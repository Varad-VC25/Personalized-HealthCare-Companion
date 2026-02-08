import React, { useState, useEffect, useRef } from "react";
import {
  FiSend,
  FiCpu,
  FiUser,
  FiMic,
  FiMicOff,
  FiGlobe,
  FiCheck,
} from "react-icons/fi";
import mediverseLogo from "../mediverseLogo.png";
import "./Chat.css";

function Chat() {
  const [messages, setMessages] = useState([
    {
      text: "Hello, I am MindWell AI, your personal therapeutic companion. How are you feeling today?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [showLangMenu, setShowLangMenu] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const langMenuRef = useRef(null);

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "hi-IN", name: "Hindi" },
    { code: "zh-CN", name: "Chinese" },
    { code: "ja-JP", name: "Japanese" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();

    // Close lang menu on click outside
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMicClick = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Your browser does not support voice input. Please use Chrome or Edge.",
      );
      return;
    }

    if (isListening) {
      // Logic to stop handled by the browser typically, but we can manage state
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev && transcript ? " " : "") + transcript);
    };

    recognition.start();
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Backend call
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: userMessage.text,
          language: language, // Sending language context if backend supports it
        }),
      });

      const data = await response.json();

      setTimeout(() => {
        const botMessage = {
          text: data.response || "I am listening. Please go on.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 600);
    } catch (error) {
      console.error("Error sending message:", error);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "I'm having trouble connecting to my thought process right now. Please check your connection or try again in a moment.",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header-display">
        <div className="header-left">
          <div className="bot-status-indicator">
            <div className="status-dot"></div>
            <span>Online</span>
          </div>
        </div>

        <div className="header-right" ref={langMenuRef}>
          <button
            className="lang-toggle-btn"
            onClick={() => setShowLangMenu(!showLangMenu)}
            title="Select Language"
          >
            <FiGlobe size={16} />
            <span className="lang-code">
              {languages
                .find((l) => l.code === language)
                ?.code.split("-")[0]
                .toUpperCase()}
            </span>
          </button>

          {showLangMenu && (
            <div className="lang-dropdown">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`lang-option ${language === lang.code ? "active" : ""}`}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLangMenu(false);
                  }}
                >
                  <span>{lang.name}</span>
                  {language === lang.code && <FiCheck size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="chat-safe-notice">
        <p>This is a safe space. All conversations are private.</p>
      </div>

      <div className="messages-area">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === "bot" ? (
                <img src={mediverseLogo} alt="AI" className="bot-img-avatar" />
              ) : (
                <div className="user-icon-avatar">
                  <FiUser />
                </div>
              )}
            </div>
            <div className="message-bubble">
              <p>{msg.text}</p>
              <span className="timestamp">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-wrapper bot">
            <div className="message-avatar">
              <img src={mediverseLogo} alt="AI" className="bot-img-avatar" />
            </div>
            <div className="message-bubble typing-bubble">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <div className={`input-wrapper ${isListening ? "listening-mode" : ""}`}>
          <button
            className={`mic-btn ${isListening ? "listening" : ""}`}
            onClick={handleMicClick}
            title={isListening ? "Stop Listening" : "Start Voice Input"}
          >
            {isListening ? <FiMicOff size={20} /> : <FiMic size={20} />}
            {isListening && <span className="mic-pulse"></span>}
          </button>

          <textarea
            ref={inputRef}
            placeholder={
              isListening ? "Listening..." : "Type your feelings here..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={1}
            style={{ minHeight: "50px", maxHeight: "120px" }}
          />

          <button
            onClick={handleSendMessage}
            className="send-btn"
            disabled={!input.trim() && !isListening}
          >
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
