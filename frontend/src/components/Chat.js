"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { FiSend, FiPaperclip, FiUser } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkEmoji from "remark-emoji";
import mediverseLogo from "../mediverseLogo.png";
import { ThemeContext } from "../ThemeContext";
import "./Chat.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function Chat({ chatId }) {
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm your MindWell AI assistant. How can I support you today? 💙",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("en-US");

  const chatBoxRef = useRef(null);
  const recognitionRef = useRef(null);
  const ttsUnlockedRef = useRef(false);
  const { darkMode } = useContext(ThemeContext);

  /* Auto scroll */
  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  /* Speech recognition setup */
  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) =>
      setInput(e.results[0][0].transcript);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
  }, [language]);

  /* Unlock TTS (browser requirement) */
  const unlockTTS = () => {
    if (ttsUnlockedRef.current) return;
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance(" ")
    );
    ttsUnlockedRef.current = true;
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  /* Send message */
  const handleSend = async () => {
    if (!input.trim()) return;

    unlockTTS();

    const userMessage = input;
    setMessages((prev) => [
      ...prev,
      { text: userMessage, sender: "user" },
    ]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMessage, language }),
      });

      const data = await res.json();
      const reply = data.reply || "I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        { text: reply, sender: "bot" },
      ]);

      speakText(reply);
    } catch {
      speakText("There was an issue connecting to the server.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`mindwell-chat ${darkMode ? "dark" : ""}`}>
      <div className="mindwell-messages" ref={chatBoxRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`message-row ${msg.sender}`}>
            <div className="avatar">
              {msg.sender === "user" ? (
                <FiUser />
              ) : (
                <img src={mediverseLogo} alt="MindWell AI" />
              )}
            </div>

            <div className={`bubble ${msg.sender}`}>
              <span className="author">
                {msg.sender === "user" ? "You" : "MindWell AI"}
              </span>

              {/* 🔥 MARKDOWN RENDERING */}
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkEmoji]}>
  {msg.text}
</ReactMarkdown>

            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message-row bot">
            <div className="avatar">
              <img src={mediverseLogo} alt="Typing" />
            </div>
            <div className="bubble bot typing">Typing…</div>
          </div>
        )}
      </div>

      <div className="input-bar">
        <FiPaperclip />

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en-US">English</option>
          <option value="hi-IN">Hindi</option>
          <option value="mr-IN">Marathi</option>
        </select>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your thoughts…"
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey && handleSend()
          }
        />

        <button
          className={`mic ${listening ? "listening" : ""}`}
          onClick={() => recognitionRef.current?.start()}
        >
          🎤
        </button>

        <button
          className={`send ${input.trim() ? "active" : ""}`}
          onClick={handleSend}
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
}

export default Chat;
