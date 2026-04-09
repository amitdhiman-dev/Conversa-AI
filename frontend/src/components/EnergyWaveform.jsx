import { useEffect, useRef } from 'react'
import './EnergyWaveform.css'

export default function EnergyWaveform({ isRecording, isSpeaking, isDarkMode }) {
  const canvasRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const micStreamRef = useRef(null)
  const animationRef = useRef(null)
  const timeRef = useRef(0)

  // Initialize audio context and microphone access
  useEffect(() => {
    if (!isRecording && !isSpeaking) {
      // Cleanup when not active
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const setupAudio = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
        }

        // Only get microphone stream if recording
        if (isRecording && !micStreamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          micStreamRef.current = stream

          if (!analyserRef.current) {
            const source = audioContextRef.current.createMediaStreamSource(stream)
            analyserRef.current = audioContextRef.current.createAnalyser()
            analyserRef.current.fftSize = 256
            source.connect(analyserRef.current)
          }
        }

        drawWaveform()
      } catch (err) {
        console.error('Error accessing microphone:', err)
      }
    }

    if (isRecording || isSpeaking) {
      setupAudio()
    }

    return () => {
      if (!isRecording && micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop())
        micStreamRef.current = null
        analyserRef.current = null
      }
    }
  }, [isRecording, isSpeaking])

  const drawWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.fillStyle = isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.5)'
    ctx.fillRect(0, 0, width, height)

    if (isRecording && analyserRef.current) {
      // Recording mode: Show frequency bars based on microphone input
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)

      const barCount = 40
      const barWidth = width / barCount
      const centerHeight = height / 2

      // Draw bars with gradient colors
      for (let i = 0; i < barCount; i++) {
        // Sample every nth frequency bin
        const index = Math.floor((i / barCount) * dataArray.length)
        const value = dataArray[index] / 255

        // Bar height based on frequency value
        const barHeight = value * (height * 0.8)

        // Gradient color: blue -> purple -> pink
        const hue = 200 + value * 160
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
        ctx.globalAlpha = 0.7 + value * 0.3

        // Draw bar from center (top and bottom)
        const x = i * barWidth + barWidth * 0.35
        const y = centerHeight - barHeight / 2
        ctx.fillRect(x, y, barWidth * 0.3, barHeight)
      }

      ctx.globalAlpha = 1
    } else if (isSpeaking) {
      // Speaking mode: Smooth looping waveform
      const waveCount = 3
      const amplitude = height * 0.35
      const centerY = height / 2
      const frequency = 3
      const speed = 0.08

      ctx.strokeStyle = isDarkMode
        ? 'rgba(59, 130, 246, 0.8)'
        : 'rgba(29, 78, 216, 0.8)'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (let wave = 0; wave < waveCount; wave++) {
        ctx.beginPath()
        for (let x = 0; x <= width; x += 2) {
          const normalizedX = x / width
          const phaseOffset = wave * (Math.PI * 2 / waveCount)
          const y =
            centerY +
            amplitude *
              Math.sin(normalizedX * frequency * Math.PI * 2 + timeRef.current * speed + phaseOffset) *
              Math.cos(timeRef.current * speed * 0.5)

          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.globalAlpha = 0.6 - wave * 0.15
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      timeRef.current += 1
    }

    animationRef.current = requestAnimationFrame(drawWaveform)
  }

  // Setup canvas size
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const container = canvas.parentElement
    const width = container.offsetWidth
    const height = container.offsetHeight

    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
  }, [])

  return (
    <div className={`energy-waveform-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <canvas
        ref={canvasRef}
        className={`energy-waveform-canvas ${
          isRecording ? 'recording' : isSpeaking ? 'speaking' : 'idle'
        }`}
      />
    </div>
  )
}
