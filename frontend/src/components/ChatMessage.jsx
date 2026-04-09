import { motion } from 'framer-motion'
import './ChatMessage.css'

export default function ChatMessage({ message, index, onListen, onStop, voiceEnabled }) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const canSpeak = isAssistant && voiceEnabled && onListen

  const messageVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <motion.div
      className={`message-wrapper ${isUser ? 'user' : 'assistant'}`}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className={`message ${isUser ? 'user-message' : 'assistant-message'} ${message.isError ? 'error' : ''}`}>
        <div className="message-avatar">
          {isUser ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"></path>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
            </svg>
          )}
        </div>

        <div className="message-content">
          <p className="message-text">{message.content}</p>
          <span className="message-time">
            {message.timestamp.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        </div>

        {canSpeak && (
          <motion.div
            className="message-voice-controls"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <motion.button
              className="msg-voice-btn listen-btn"
              onClick={() => onListen(message.content)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Listen to this message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"></path>
              </svg>
              <span>Listen</span>
            </motion.button>
            <motion.button
              className="msg-voice-btn stop-btn"
              onClick={onStop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Stop audio"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
              <span>Stop</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
