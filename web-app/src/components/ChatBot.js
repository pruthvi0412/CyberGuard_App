import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "System Initialized. I am CyberGuard AI. How can I assist you today?", isBot: true }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      processQuery(userMessage.toLowerCase());
      setIsTyping(false);
    }, 1000);
  };

  const processQuery = (query) => {
    let response = "";
    
    if (query.includes("report") || query.includes("submit") || query.includes("incident") || query.includes("crime")) {
      response = "To report a cybercrime incident, click the 'Report' link in the navbar or the 'REPORT INCIDENT' button on the homepage. Our AI will help classify your report.";
    } else if (query.includes("track") || query.includes("status")) {
      response = "You can track your existing complaints by visiting the 'Track' section. You'll need the Reference ID provided at the time of submission.";
    } else if (query.includes("dashboard") || query.includes("stats") || query.includes("analytics")) {
      response = "The Dashboard shows live stats of cybercrime activity. If you're a user, it shows your reports; if you're an admin, it shows global analytics.";
    } else if (query.includes("admin") || query.includes("police")) {
      response = "Admin access is restricted to authorized personnel. Use the 'ADMIN LOGIN' button at the top right to access the command center.";
    } else if (query.includes("register") || query.includes("sign up")) {
      response = "Click 'GET STARTED' or 'Register' to create an account as a Citizen or join as an Official.";
    } else if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
      response = "Greetings. I am the CyberGuard Neural Assistant. I can help you navigate the system or answer technical questions.";
    } else if (query.includes("help") || query.includes("navigate") || query.includes("menu")) {
      response = "I can guide you! Try: 'How to report?', 'Where is my dashboard?', or 'How to track status?'.";
    } else {
      response = "Query received. My knowledge base suggests checking the 'Report' or 'Dashboard' sections for most actions. Can I help you navigate somewhere?";
    }

    setMessages(prev => [...prev, { text: response, isBot: true }]);
  };

  const quickActions = [
    { label: "Report Crime", path: "/submit" },
    { label: "Track Status", path: "/track" },
    { label: "View Dashboard", path: "/dashboard" },
    { label: "Admin Hub", path: "/admin" },
  ];

  return (
    <div style={styles.container}>
      {/* Chat Toggle Button */}
      <motion.div 
        onClick={() => setIsOpen(!isOpen)}
        style={styles.trigger}
        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 255, 170, 0.6)" }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#00ffaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="10" r="1" fill="#00ffaa"/>
          <circle cx="15" cy="10" r="1" fill="#00ffaa"/>
          <path d="M9 13.5C9.5 14.5 11 15 12 15C13 15 14.5 14.5 15 13.5" stroke="#00ffaa" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            style={styles.window}
          >
            <div style={styles.header}>
              <div style={styles.headerTitle}>
                <span style={styles.onlineDot} />
                NEURAL ASSISTANT
              </div>
              <div style={styles.closeBtn} onClick={() => setIsOpen(false)}>×</div>
            </div>

            <div style={styles.messagesContainer}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  ...styles.message,
                  alignSelf: msg.isBot ? 'flex-start' : 'flex-end',
                  background: msg.isBot ? 'rgba(0, 255, 170, 0.08)' : 'rgba(0, 180, 255, 0.08)',
                  borderColor: msg.isBot ? 'rgba(0, 255, 170, 0.2)' : 'rgba(0, 180, 255, 0.2)',
                  borderTopLeftRadius: msg.isBot ? 0 : 12,
                  borderTopRightRadius: msg.isBot ? 12 : 0,
                }}>
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div style={{ ...styles.message, alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', fontStyle: 'italic', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                  Analyzing query...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={styles.quickActions}>
              {quickActions.map(action => (
                <button 
                  key={action.label} 
                  style={styles.actionBtn}
                  onClick={() => {
                    navigate(action.path);
                    setIsOpen(false);
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>

            <div style={styles.inputArea}>
              <input 
                style={styles.input}
                placeholder="How can I help?"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button style={styles.sendBtn} onClick={handleSend}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  trigger: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'rgba(0, 255, 170, 0.1)',
    border: '2px solid rgba(0, 255, 170, 0.4)',
    boxShadow: '0 0 20px rgba(0, 255, 170, 0.3)',
    transition: 'all 0.3s ease',
  },
  window: {
    position: 'absolute',
    bottom: '60px',
    right: '-100px',
    width: '340px',
    height: '480px',
    background: '#050a0f',
    border: '1px solid rgba(0, 255, 170, 0.2)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 255, 170, 0.15)',
    zIndex: 1000,
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
  },
  header: {
    padding: '18px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0, 255, 170, 0.03)',
  },
  headerTitle: {
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '3px',
    color: '#00ffaa',
    fontFamily: 'Orbitron, monospace',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  onlineDot: {
    width: '6px',
    height: '6px',
    background: '#00ffaa',
    borderRadius: '50%',
    boxShadow: '0 0 10px #00ffaa',
  },
  closeBtn: {
    cursor: 'pointer',
    fontSize: '24px',
    color: 'rgba(255, 255, 255, 0.3)',
    transition: 'color 0.2s',
    lineHeight: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: 'radial-gradient(circle at top right, rgba(0, 255, 170, 0.03), transparent)',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    maxWidth: '85%',
    lineHeight: '1.5',
    border: '1px solid rgba(255,255,255,0.05)',
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: 'Inter, sans-serif',
  },
  quickActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '0 20px 20px',
  },
  actionBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '10px',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: '600',
  },
  inputArea: {
    padding: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    gap: '12px',
    background: 'rgba(0,0,0,0.2)',
  },
  input: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '10px 15px',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  sendBtn: {
    background: '#00ffaa',
    border: 'none',
    borderRadius: '8px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#000',
    transition: 'transform 0.2s',
  }
};

export default ChatBot;
