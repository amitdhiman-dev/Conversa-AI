import { useState } from 'react'
import { motion } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import ChatPage from './pages/ChatPage'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [sessionId] = useState(`session_${Date.now()}`)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const handleStartChat = () => {
    setCurrentPage('chat')
  }

  const handleBackToHome = () => {
    setCurrentPage('landing')
  }

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Theme Toggle */}
      <motion.button
        className="theme-toggle"
        onClick={() => setIsDarkMode(!isDarkMode)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
      >
        {isDarkMode ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </motion.button>

      {currentPage === 'landing' ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <LandingPage onStartChat={handleStartChat} />
        </motion.div>
      ) : (
        <motion.div
          key="chat"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <ChatPage sessionId={sessionId} onBackHome={handleBackToHome} isDarkMode={isDarkMode} />
        </motion.div>
      )}
    </div>
  )
}

export default App
