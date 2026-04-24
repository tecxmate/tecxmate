"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import createGlobe from "cobe"

/** Detect Android (incl. WebView in Messenger, Instagram, etc.) for performance tweaks */
function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false
  return /Android/i.test(navigator.userAgent)
}

/** Light mode colors */
const LIGHT_BASE = [0.55, 0.32, 1.0] as [number, number, number]  // Purple dots
const LIGHT_ACCENT = [0.55, 0.32, 1.0] as [number, number, number] // Purple markers
const LIGHT_GLOW = [0.9, 0.85, 1.0] as [number, number, number]   // Soft purple glow

/** Dark mode colors */
const DARK_BASE = [1, 1, 1] as [number, number, number]           // White dots
const DARK_ACCENT = [1, 0.7, 1] as [number, number, number]       // Pink markers
const DARK_GLOW = [0.55, 0.32, 1.0] as [number, number, number]   // Purple glow

const MARKERS = [
  { location: [25.03, 121.57] as [number, number], size: 0.04 }, // Taiwan
  { location: [21.0285, 105.8542] as [number, number], size: 0.04 }, // Hanoi
  { location: [10.8231, 106.6297] as [number, number], size: 0.04 }, // HCMC
  { location: [13.7563, 100.5018] as [number, number], size: 0.04 }, // Bangkok
  { location: [47.4979, 19.0402] as [number, number], size: 0.04 }, // Budapest
  { location: [45.4642, 9.1900] as [number, number], size: 0.04 }, // Milan
  { location: [51.5074, -0.1278] as [number, number], size: 0.04 }, // London
  { location: [35.6762, 139.6503] as [number, number], size: 0.04 }, // Tokyo, Japan
  { location: [-6.2088, 106.8456] as [number, number], size: 0.04 }, // Jakarta
  { location: [37.7749, -122.4194] as [number, number], size: 0.04 }, // San Francisco
  { location: [40.7128, -74.0060] as [number, number], size: 0.04 }, // New York
  { location: [22.3193, 114.1694] as [number, number], size: 0.04 }, // Hong Kong
  { location: [-7.2575, 112.7521] as [number, number], size: 0.04 }, // Surabaya
]

// Target fps: low enough to keep devices cool, high enough for smooth rotation
const TARGET_FPS = 15
const FRAME_INTERVAL = 1000 / TARGET_FPS

interface GlobeBackgroundProps {
  isDark?: boolean
}

export function GlobeBackground({ isDark = false }: GlobeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const phiRef = useRef(0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null)
  const rafRef = useRef<number>(0)
  const prefersReducedMotionRef = useRef(false)
  const isInViewRef = useRef(true)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    prefersReducedMotionRef.current = mq.matches
    const handler = () => { prefersReducedMotionRef.current = mq.matches }
    mq.addEventListener("change", handler)

    const widthMq = window.matchMedia("(max-width: 768px)")
    setIsMobile(widthMq.matches)
    const widthHandler = () => setIsMobile(widthMq.matches)
    widthMq.addEventListener("change", widthHandler)

    return () => {
      mq.removeEventListener("change", handler)
      widthMq.removeEventListener("change", widthHandler)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let resizeTimer: ReturnType<typeof setTimeout>
    const updateDimensions = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        const rect = container.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }, 200)
    }

    const rect = container.getBoundingClientRect()
    setDimensions({ width: rect.width, height: rect.height })

    const ro = new ResizeObserver(updateDimensions)
    ro.observe(container)

    return () => { ro.disconnect(); clearTimeout(resizeTimer) }
  }, [])

  // Track visibility via ref (no re-render needed)
  useEffect(() => {
    const hero = document.getElementById("hero")
    if (!hero) return

    const io = new IntersectionObserver(
      ([entry]) => { isInViewRef.current = entry.isIntersecting },
      { threshold: 0.05, rootMargin: "50px" }
    )
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const android = isAndroid()
    const dpr = Math.min(window.devicePixelRatio ?? 1, android ? 1 : isMobile ? 1.5 : 2)
    const width = dimensions.width
    const height = dimensions.height

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const mapSamples = android ? (isMobile ? 3000 : 6000) : isMobile ? 5000 : 8000

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width,
      height,
      phi: phiRef.current,
      theta: 0.4,
      dark: isDark ? 1 : 0,
      diffuse: isDark ? 1.5 : 1.2,
      scale: 2.8,
      mapSamples,
      mapBrightness: isDark ? 6 : 8,
      mapBaseBrightness: 0,
      opacity: isMobile ? 0.78 : 1,
      baseColor: isDark ? DARK_BASE : LIGHT_BASE,
      markerColor: isDark ? DARK_ACCENT : LIGHT_ACCENT,
      glowColor: isDark ? DARK_GLOW : LIGHT_GLOW,
      markers: MARKERS,
      offset: [width * 0.72, -height * 0.52],
      onRender: (state) => {
        if (!prefersReducedMotionRef.current) {
          phiRef.current += 0.001
          state.phi = phiRef.current
        }
      },
    })

    globeRef.current = globe

    // Kill cobe's internal 60fps rAF loop — we'll drive rendering ourselves
    globe.toggle(false)

    // Our own rAF loop, throttled to TARGET_FPS
    let lastFrameTime = 0
    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick)

      if (!isInViewRef.current) return // skip GPU work entirely when off-screen

      if (now - lastFrameTime < FRAME_INTERVAL) return
      lastFrameTime = now

      // Render exactly one frame: enable → draw → disable
      globe.shouldRender = false
      globe.render()
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      globe.destroy()
      globeRef.current = null
    }
  }, [dimensions, isMobile, isDark])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: "cover" }}
      />
      {/* Gradient overlay for glow effect */}
      <div
        className="absolute inset-0"
        style={{
          opacity: isDark ? 0.7 : 0.5,
          background: isDark
            ? `
              radial-gradient(
                ellipse 80% 80% at 70% 50%,
                rgba(140, 82, 255, 0.4) 0%,
                transparent 50%
              ),
              radial-gradient(
                ellipse 60% 60% at 80% 60%,
                rgba(180, 100, 255, 0.3) 0%,
                transparent 40%
              )
            `
            : `
              radial-gradient(
                ellipse 80% 80% at 70% 50%,
                rgba(140, 82, 255, 0.15) 0%,
                transparent 50%
              )
            `,
          mixBlendMode: isDark ? "screen" : "normal",
          pointerEvents: "none",
        }}
      />
    </div>
  )
}
