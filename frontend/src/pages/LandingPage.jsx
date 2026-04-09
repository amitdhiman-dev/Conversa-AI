import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import './LandingPage.css'

export default function LandingPage({ onStartChat }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  return (
    <div className="landing">
      <div className="background-gradient"></div>
      
      {/* Animated background elements */}
      <motion.div
        className="floating-shape shape-1"
        animate={{
          y: [0, 30, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      ></motion.div>
      
      <motion.div
        className="floating-shape shape-2"
        animate={{
          y: [0, -40, 0],
          x: [0, -15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      ></motion.div>

      <div className="container">
        <header className="header">
          <motion.div
            className="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
                <circle cx="12" cy="10" r="1" fill="currentColor"></circle>
                <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
              </svg>
            </div>
            <span>AI Chat</span>
          </motion.div>
        </header>

        <motion.div
          className="content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="title" variants={itemVariants}>
            Chat with <span className="gradient-text">Intelligent AI</span>
          </motion.h1>

          <motion.p className="subtitle" variants={itemVariants}>
            Experience natural conversation powered by advanced AI. 
            Get instant answers, brainstorm ideas, and more.
          </motion.p>

          <motion.div
            className="features-grid"
            variants={itemVariants}
          >
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                </svg>
              </div>
              <h3>Instant Responses</h3>
              <p>Get answers in real-time</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M2 12h20"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              <h3>Smart Context</h3>
              <p>Understands conversation flow</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
                </svg>
              </div>
              <h3>Reliable</h3>
              <p>Consistent and accurate</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"></path>
                  <path d="M12 7v5l3 3.53"></path>
                </svg>
              </div>
              <h3>Always Available</h3>
              <p>24/7 support ready</p>
            </div>
          </motion.div>

          <motion.div
            className="cta-section"
            variants={itemVariants}
          >
            <motion.button
              className="button button-primary cta-button"
              onClick={onStartChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Start Chatting</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </motion.button>
          </motion.div>

          <motion.p
            className="footer-text"
            variants={itemVariants}
          >
            No login required. Start conversing immediately.
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
