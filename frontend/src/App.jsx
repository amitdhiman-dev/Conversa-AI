import { useState } from 'react'
import { motion } from 'framer-motion'
import { BiSun, BiMoon } from 'react-icons/bi'
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
        {isDarkMode ? <BiSun size={24} /> : <BiMoon size={24} />}
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
