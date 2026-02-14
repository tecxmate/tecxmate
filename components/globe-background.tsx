"use client"

import { useEffect, useRef, useState } from "react"
import createGlobe from "cobe"

/** Detect Android (incl. WebView in Messenger, Instagram, etc.) for performance tweaks */
function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false
  return /Android/i.test(navigator.userAgent)
}

/** Purple (gradient start) */
const BASE = [0.4, 0.25, 0.95] as [number, number, number]
/** Pink/magenta (gradient middle) */
const ACCENT = [0.95, 0.45, 1] as [number, number, number]
/** Warm pink glow (gradient end) */
const GLOW = [0.9, 0.5, 0.8] as [number, number, number]

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

export function GlobeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const phiRef = useRef(0)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isInView, setIsInView] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
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

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
    }

    updateDimensions()
    const ro = new ResizeObserver(updateDimensions)
    ro.observe(container)

    return () => ro.disconnect()
  }, [])

  // Pause globe animation when off-screen to reduce GPU load and scroll jank on Android
  useEffect(() => {
    const hero = document.getElementById("hero")
    if (!hero) return

    const io = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.05, rootMargin: "50px" }
    )
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
    const width = dimensions.width
    const height = dimensions.height

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const mapSamples = isAndroid() ? (isMobile ? 4000 : 8000) : isMobile ? 8000 : 20000

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width,
      height,
      phi: phiRef.current,
      theta: 0.4,
      dark: 0,
      diffuse: 1.2,
      scale: 2.8,
      mapSamples,
      mapBrightness: 8,
      mapBaseBrightness: 0,
      opacity: isMobile ? 0.78 : 1,
      baseColor: BASE,
      markerColor: ACCENT,
      glowColor: GLOW,
      markers: MARKERS,
      offset: [width * 0.72, -height * 0.52],
      onRender: (state) => {
        if (!prefersReducedMotion && isInView) {
          phiRef.current += 0.001
          state.phi = phiRef.current
        }
      },
    })

    return () => globe.destroy()
  }, [dimensions, isMobile, prefersReducedMotion, isInView])

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
      {/* Gradient overlay: purple → pink → soft orange on dots */}
      <div
        className="absolute inset-0 opacity-95"
        style={{
          background: `
            radial-gradient(
              ellipse 90% 90% at 15% 50%,
              rgba(100, 60, 255, 0.92) 0%,
              transparent 50%
            ),
            radial-gradient(
              ellipse 75% 75% at 50% 35%,
              rgba(255, 100, 220, 0.88) 0%,
              transparent 48%
            ),
            radial-gradient(
              ellipse 65% 65% at 85% 65%,
              rgba(255, 130, 100, 0.82) 0%,
              transparent 45%
            )
          `,
          mixBlendMode: "soft-light",
          pointerEvents: "none",
        }}
      />
    </div>
  )
}
