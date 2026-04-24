"use client"

import { useEffect, useRef } from "react"

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Generate stars with different layers for depth
    const stars: { x: number; y: number; size: number; opacity: number; twinkleSpeed: number; layer: number }[] = []
    const starCount = Math.min(200, Math.floor((window.innerWidth * window.innerHeight) / 8000))

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        layer: Math.floor(Math.random() * 3), // 0 = far, 1 = mid, 2 = close
      })
    }

    let animationId: number
    let time = 0

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.016

      stars.forEach((star) => {
        // Twinkle effect
        const twinkle = Math.sin(time * star.twinkleSpeed * 100 + star.x) * 0.3 + 0.7
        const currentOpacity = star.opacity * twinkle

        // Color based on layer (distant stars are more blue/purple)
        const colors = [
          `rgba(200, 180, 255, ${currentOpacity})`, // Far - purple tint
          `rgba(220, 210, 255, ${currentOpacity})`, // Mid - light purple
          `rgba(255, 255, 255, ${currentOpacity})`, // Close - white
        ]

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * (star.layer * 0.3 + 0.7), 0, Math.PI * 2)
        ctx.fillStyle = colors[star.layer]
        ctx.fill()

        // Add glow to larger stars
        if (star.size > 1 && star.layer === 2) {
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2)
          const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2)
          gradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity * 0.3})`)
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
          ctx.fillStyle = gradient
          ctx.fill()
        }
      })

      animationId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.8 }}
      aria-hidden
    />
  )
}
