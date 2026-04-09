import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import ChatMessage from '../components/ChatMessage'
import './ChatPage.css'

export default function ChatPage({ sessionId, onBackHome, isDarkMode }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date(),
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [justFinishedRecording, setJustFinishedRecording] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const synthRef = useRef(window.speechSynthesis)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setVoiceEnabled(false)
      console.warn('Speech Recognition not supported in this browser')
      return
    }

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.language = 'en-US'

    recognitionRef.current.onstart = () => {
      setIsRecording(true)
    }

    recognitionRef.current.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setInputValue(transcript)
      setJustFinishedRecording(true)
    }

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setError(`Voice error: ${event.error}`)
    }

    recognitionRef.current.onend = () => {
      setIsRecording(false)
      // Refocus the input field after recording ends
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const handleStartVoiceInput = () => {
    if (recognitionRef.current && !isRecording) {
      recognitionRef.current.start()
    }
  }

  const handleStopVoiceInput = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
    }
  }

  const handleTextToSpeech = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      utterance.lang = 'en-US'

      window.speechSynthesis.speak(utterance)
    }
  }

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    // Allow reviewing voice input before sending
    if (justFinishedRecording) {
      setJustFinishedRecording(false)
      return
    }
    
    if (!inputValue.trim()) return

    // Add user message to UI immediately
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      // Send to backend
      const response = await axios.post('/api/chat', {
        message: inputValue,
        session_id: sessionId,
      })

      if (response.data.success) {
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(response.data.timestamp),
        }

        setMessages(prev => [...prev, assistantMessage])

        // Speak the response if voice is enabled
        if (voiceEnabled) {
          handleTextToSpeech(response.data.response)
        }
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err.response?.data?.error || 'Failed to send message. Please try again.')
      
      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear the conversation?')) {
      try {
        await axios.delete(`/api/clear-history/${sessionId}`)
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: 'Hello! I\'m your AI assistant. How can I help you today?',
            timestamp: new Date(),
          }
        ])
      } catch (err) {
        console.error('Error clearing chat:', err)
      }
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="header-content">
          <motion.div
            className="back-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button onClick={onBackHome} className="button button-ghost">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"></path>
              </svg>
              <span>Back</span>
            </button>
          </motion.div>

          <div className="title-section">
            <h1>Chat Assistant</h1>
            <p className="status">Online</p>
          </div>

          <div className="header-actions">
            <motion.button
              className={`button button-ghost voice-toggle ${voiceEnabled ? 'active' : ''}`}
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={voiceEnabled ? 'Voice output enabled' : 'Voice output disabled'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {voiceEnabled ? (
                  <>
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </>
                ) : (
                  <path d="M23 7l-7 5 7 5V7zm-15-2v16M1 5h15v14H1z"></path>
                )}
              </svg>
              <span>Voice</span>
            </motion.button>

            <motion.div
              className="clear-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button onClick={handleClearChat} className="button button-ghost">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6h16z"></path>
                </svg>
                <span>Clear</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-list">
          <AnimatePresence>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                index={index}
                onListen={handleTextToSpeech}
                onStop={handleStopSpeech}
                voiceEnabled={voiceEnabled}
              />
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              className="loading-indicator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="typing-animation">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>AI is thinking...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button
                onClick={() => setError(null)}
                className="error-close"
              >
                ✕
              </button>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSendMessage} className="input-form">
          <div className="input-wrapper">
            {voiceEnabled && (
              <motion.button
                type="button"
                className={`voice-button ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? handleStopVoiceInput : handleStartVoiceInput}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  {isRecording ? (
                    <>
                      <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                      <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                    </>
                  ) : (
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M9 20a6 6 0 0 0 6 0m0 0h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4"></path>
                  )}
                </svg>
              </motion.button>
            )}
            <input
              ref={inputRef}
              type="text"
              className="input"
              placeholder={isRecording ? 'Listening...' : 'Type or use voice...'}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                // Allow sending after user manually edits
                setJustFinishedRecording(false)
              }}
              disabled={isLoading}
              autoFocus
            />
            <motion.button
              type="submit"
              className="button button-primary send-button"
              disabled={isLoading || !inputValue.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16346706 C3.34915502,0.9 2.40734225,0.9 1.77946707,1.4870296 C0.994623095,2.0740692 0.837654326,3.16346706 1.15159189,3.94894204 L3.03521743,10.3899351 C3.03521743,10.5470325 3.19218622,10.7041299 3.50612381,10.7041299 L16.6915026,11.4896169 C16.6915026,11.4896169 17.1624089,11.4896169 17.1624089,12.0766564 C17.1624089,12.6636959 16.6915026,12.4744748 16.6915026,12.4744748 Z"></path>
              </svg>
            </motion.button>
          </div>
          <p className="input-hint">
            {isRecording ? '🎙️ Recording... Click to stop' : 'Press Enter or click Send to chat'}
          </p>
        </form>
      </div>
    </div>
  )
}
