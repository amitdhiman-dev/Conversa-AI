import { motion } from 'framer-motion'
import { BiSolidUser, BiCheckCircle, BiPlay, BiPause } from 'react-icons/bi'
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
            <BiSolidUser size={24} />
          ) : (
            <BiCheckCircle size={24} />
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
              <BiPlay size={16} />
              <span>Listen</span>
            </motion.button>
            <motion.button
              className="msg-voice-btn stop-btn"
              onClick={onStop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Stop audio"
            >
              <BiPause size={16} />
              <span>Stop</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
