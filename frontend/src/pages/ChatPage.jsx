import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { BiArrowBack, BiPlay, BiTrash, BiSolidMicrophone, BiStop } from 'react-icons/bi'
import { AiOutlineSend } from 'react-icons/ai'
import ChatMessage from '../components/ChatMessage'
import Waveform from '../components/Waveform'
import MicOrb from '../components/MicOrb'
import EnergyWaveform from '../components/EnergyWaveform'
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
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
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
    recognitionRef.current.interimResults = true
    recognitionRef.current.language = 'en-US'

    recognitionRef.current.onstart = () => {
      setIsRecording(true)
      setInterimTranscript('')
      setInputValue('')
    }

    recognitionRef.current.onresult = (event) => {
      let interim = ''
      let final = ''

      // Process results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          final += transcript + ' '
        } else {
          interim += transcript
        }
      }

      // Update states
      setInterimTranscript(interim)
      
      if (final) {
        setInputValue(prev => (prev + final).trim())
        setJustFinishedRecording(true)
      }
    }

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setError(`Voice error: ${event.error}`)
    }

    recognitionRef.current.onend = () => {
      setIsRecording(false)
      setInterimTranscript('')
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

      utterance.onstart = () => {
        setIsSpeaking(true)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
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
              <BiArrowBack size={20} />
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
              <BiPlay size={20} />
              <span>Voice</span>
            </motion.button>

            <motion.div
              className="clear-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button onClick={handleClearChat} className="button button-ghost">
                <BiTrash size={20} />
                <span>Clear</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="chat-container">
        <Waveform 
          isActive={isRecording || isSpeaking}
          isRecording={isRecording}
          isDarkMode={isDarkMode}
        />
        
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
        {voiceEnabled && (isRecording || isSpeaking) && (
          <EnergyWaveform
            isRecording={isRecording}
            isSpeaking={isSpeaking}
            isDarkMode={isDarkMode}
          />
        )}
        <form onSubmit={handleSendMessage} className="input-form">
          <div className="input-wrapper">
            {voiceEnabled && (
              <MicOrb
                isRecording={isRecording}
                isSpeaking={isSpeaking}
                isDarkMode={isDarkMode}
                onStartVoice={handleStartVoiceInput}
                onStopVoice={handleStopVoiceInput}
              />
            )}
            <div className="input-field-container">
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
              {isRecording && interimTranscript && (
                <motion.div
                  className="interim-transcript"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="interim-label">Listening</span>
                  <span className="interim-text">{interimTranscript}</span>
                </motion.div>
              )}
              {isLoading && (
                <motion.div
                  className="interim-transcript understanding-state"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="interim-label">Understanding</span>
                  <span className="interim-text">Processing your message...</span>
                </motion.div>
              )}
            </div>
            {isSpeaking ? (
              <motion.button
                type="button"
                className="stop-speech-button"
                onClick={handleStopSpeech}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                title="Stop speaking"
              >
                <BiStop size={20} />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                className="button button-primary send-button"
                disabled={isLoading || !inputValue.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AiOutlineSend size={20} />
              </motion.button>
            )}
          </div>
          <p className="input-hint">
            {isRecording
              ? '🎙️ Recording... Speak naturally or click stop'
              : isSpeaking
                ? '🎧 AI is speaking... Click stop to interrupt'
                : isLoading
                  ? '⏳ Thinking... This might take a moment'
                  : 'Press Enter or click Send to chat'}
          </p>
        </form>
      </div>
    </div>
  )
}
