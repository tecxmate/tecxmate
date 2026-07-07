"use client"

import { useEffect, useRef } from "react"

// The starfield is purely decorative. Draw at 30fps (twinkle needs no more) and
// only while it's actually on screen and the tab is visible — otherwise it would
// redraw 200 stars forever in the background and heat the machine.
const FRAME_MS = 1000 / 30

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

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

    let animationId = 0
    let time = 0
    let last = 0
    let inView = true
    let idle = false

    const drawFrame = () => {
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
    }

    const shouldRun = () => !reduced && !document.hidden && inView && !idle

    const loop = (now: number) => {
      if (!shouldRun()) {
        animationId = 0
        return
      }
      animationId = requestAnimationFrame(loop)
      if (now - last < FRAME_MS) return
      last = now
      drawFrame()
    }

    const start = () => {
      if (!animationId && shouldRun()) animationId = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (animationId) cancelAnimationFrame(animationId)
      animationId = 0
    }

    // Stop entirely once the hero scrolls out of view.
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        if (inView) start()
        else stop()
      },
      { rootMargin: "80px" },
    )
    io.observe(canvas)

    // Stop while the tab is in the background.
    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener("visibilitychange", onVisibility)

    // Stop once the page goes idle (AnimationPauser); resume on activity.
    const onIdle = (e: Event) => {
      idle = !!(e as CustomEvent).detail?.idle
      if (idle) stop()
      else start()
    }
    window.addEventListener("app:idle", onIdle)

    if (reduced) {
      drawFrame() // one static frame, no loop
    } else {
      start()
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("app:idle", onIdle)
      io.disconnect()
      stop()
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
