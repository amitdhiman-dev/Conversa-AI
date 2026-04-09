import { useEffect, useRef } from 'react'
import './Waveform.css'

export default function Waveform({ isActive, isRecording, isDarkMode }) {
  const canvasRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)
  const streamRef = useRef(null)
  const animationIdRef = useRef(null)

  // Initialize audio context and microphone access
  useEffect(() => {
    if (!isRecording) return

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        audioContextRef.current = audioContext

        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.85

        source.connect(analyser)
        analyserRef.current = analyser

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        dataArrayRef.current = dataArray

        drawWaveform()
      } catch (error) {
        console.error('Error accessing microphone:', error)
      }
    }

    initAudio()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [isRecording])

  const drawWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas || !analyserRef.current) return

    const ctx = canvas.getContext('2d')
    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current

    const width = canvas.width
    const height = canvas.height
    const centerY = height / 2

    const draw = () => {
      analyser.getByteFrequencyData(dataArray)

      // Clear canvas with fade effect
      const bgColor = isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)'
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, width, height)

      // Draw waveform
      const barWidth = width / dataArray.length
      let x = 0

      // Gradient for bars
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      if (isDarkMode) {
        gradient.addColorStop(0, '#3b82f6')
        gradient.addColorStop(0.5, '#8b5cf6')
        gradient.addColorStop(1, '#ec4899')
      } else {
        gradient.addColorStop(0, '#2563eb')
        gradient.addColorStop(0.5, '#7c3aed')
        gradient.addColorStop(1, '#db2777')
      }

      ctx.fillStyle = gradient
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let i = 0; i < dataArray.length; i += 2) {
        const value = dataArray[i] / 255
        const barHeight = value * height * 0.8

        const y = centerY - barHeight / 2
        ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight)

        x += barWidth
      }

      // Draw center line
      ctx.strokeStyle = isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(100, 116, 139, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(width, centerY)
      ctx.stroke()

      animationIdRef.current = requestAnimationFrame(draw)
    }

    draw()
  }

  // Animated waveform for speech (when not recording but playing)
  const drawAnimatedWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const centerY = height / 2

    let time = 0

    const animate = () => {
      // Clear canvas
      const bgColor = isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)'
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, width, height)

      // Draw animated sine waves
      ctx.strokeStyle = isDarkMode ? '#10b981' : '#059669'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const frequency = 0.015
      const amplitude = height * 0.25

      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = 0.6 - i * 0.15
        ctx.beginPath()

        for (let x = 0; x < width; x++) {
          const y =
            centerY +
            Math.sin(x * frequency + time - i * 0.5) * amplitude *
            (1 - Math.abs(x - width / 2) / (width / 2))

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.stroke()
      }

      ctx.globalAlpha = 1

      // Draw center line
      ctx.strokeStyle = isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(100, 116, 139, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(width, centerY)
      ctx.stroke()

      time += 0.05
      animationIdRef.current = requestAnimationFrame(animate)
    }

    animate()
  }

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2

    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)

    if (isActive && !isRecording) {
      // Draw animated waveform when playing speech
      drawAnimatedWaveform()
    } else if (isRecording) {
      // Draw recording waveform (handled by drawWaveform in useEffect above)
      drawWaveform()
    } else {
      // Draw idle state
      const bgColor = isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)'
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2)

      const centerY = (canvas.height / 2) / 2
      ctx.strokeStyle = isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(100, 116, 139, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(canvas.width / 2, centerY)
      ctx.stroke()
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [isActive, isRecording, isDarkMode])

  return (
    <div className={`waveform-container ${isActive ? 'active' : ''} ${isDarkMode ? 'dark' : ''}`}>
      <canvas
        ref={canvasRef}
        className="waveform-canvas"
        width="400"
        height="120"
      />
    </div>
  )
}
