import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { BiSolidMicrophone, BiStop } from 'react-icons/bi'
import './MicOrb.css'

export default function MicOrb({ isRecording, isSpeaking, isDarkMode, onStartVoice, onStopVoice }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  // Waveform animation for speaking state
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isSpeaking) return

    const ctx = canvas.getContext('2d')
    let animationFrame = 0

    const drawWaveform = () => {
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2

      // Clear canvas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, width, height)

      // Draw animated sine waves
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
      ctx.lineWidth = 2

      const frequency = 3
      const amplitude = 15
      const wavelength = 40

      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath()
        for (let x = 0; x < width; x++) {
          const y =
            centerY +
            amplitude * Math.sin((x + animationFrame - wave * 20) / wavelength) * (1 - wave * 0.2)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      animationFrame += 2
      animationRef.current = requestAnimationFrame(drawWaveform)
    }

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    drawWaveform()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isSpeaking])

  const orbVariants = {
    idle: {
      scale: 1,
      boxShadow: [
        '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)',
        '0 0 30px rgba(34, 197, 94, 0.6), 0 0 60px rgba(59, 130, 246, 0.3)',
        '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)',
      ],
    },
    listening: {
      scale: 1,
      boxShadow: [
        '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(34, 197, 94, 0.4)',
        '0 0 50px rgba(59, 130, 246, 1), 0 0 80px rgba(34, 197, 94, 0.6)',
        '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(34, 197, 94, 0.4)',
      ],
    },
    speaking: {
      scale: 1,
      boxShadow: [
        '0 0 25px rgba(59, 130, 246, 0.6), 0 0 50px rgba(34, 197, 94, 0.5)',
        '0 0 35px rgba(59, 130, 246, 0.8), 0 0 70px rgba(34, 197, 94, 0.6)',
        '0 0 25px rgba(59, 130, 246, 0.6), 0 0 50px rgba(34, 197, 94, 0.5)',
      ],
    },
  }

  const ringVariants = {
    idle: {
      opacity: [0.6, 1, 0.6],
      scale: [1, 1.1, 1],
    },
    listening: {
      opacity: 1,
      scale: 1.2,
    },
  }

  const rippleVariants = {
    listening: (custom) => ({
      scale: [1, 2.5],
      opacity: [1, 0],
      transition: {
        duration: 1.5,
        delay: custom * 0.3,
        repeat: Infinity,
      },
    }),
  }

  return (
    <div className={`mic-orb-wrapper ${isDarkMode ? 'dark-mode' : ''}`}>
      <motion.div
        className={`mic-orb ${
          isSpeaking
            ? 'speaking'
            : isRecording
              ? 'listening'
              : 'idle'
        }`}
        variants={orbVariants}
        animate={
          isSpeaking
            ? 'speaking'
            : isRecording
              ? 'listening'
              : 'idle'
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        {/* Pulsing ring for idle state */}
        {!isRecording && !isSpeaking && (
          <motion.div
            className="orb-ring"
            variants={ringVariants}
            animate="idle"
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          />
        )}

        {/* Ripple waves for listening state */}
        {isRecording && !isSpeaking && (
          <>
            {[0, 1, 2].map((index) => (
              <motion.div
                key={`ripple-${index}`}
                className="ripple"
                custom={index}
                variants={rippleVariants}
                animate="listening"
              />
            ))}
          </>
        )}

        {/* Waveform display for speaking state */}
        {isSpeaking && (
          <canvas
            ref={canvasRef}
            className="waveform-canvas"
            width={160}
            height={160}
          />
        )}

        {/* Main orb button */}
        <motion.button
          className="orb-button"
          onClick={isRecording ? onStopVoice : onStartVoice}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          title={isRecording ? 'Stop listening' : 'Start listening'}
        >
          {isRecording ? <BiStop size={28} /> : <BiSolidMicrophone size={28} />}
        </motion.button>

        {/* Stop indicator badge */}
        {isRecording && (
          <motion.div
            className="stop-indicator"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            onClick={onStopVoice}
            title="Click to stop recording"
          >
            <BiStop size={16} />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
