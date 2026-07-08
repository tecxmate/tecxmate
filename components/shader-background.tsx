"use client"

import type React from "react"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { GlobeBackground } from "@/components/globe-background"
import { Starfield } from "@/components/starfield"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const { resolvedTheme } = useTheme()
  const mobilePatternRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const pattern = mobilePatternRef.current
    if (!pattern) return

    const mobileMq = window.matchMedia("(max-width: 767px)")
    let frame = 0

    const update = () => {
      frame = 0
      if (!mobileMq.matches) {
        pattern.style.transform = ""
        return
      }

      const hero = document.getElementById("hero")
      const top = hero?.getBoundingClientRect().top ?? 0
      const height = hero?.offsetHeight || window.innerHeight
      const progress = Math.max(0, Math.min(1, -top / height))
      const offset = Math.max(-42, Math.min(42, -top * 0.12))
      const spread = 1 + progress * 0.18
      pattern.style.transform = `translate3d(0, ${offset}px, 0) scale(${spread})`
    }

    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)
    mobileMq.addEventListener("change", requestUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)
      mobileMq.removeEventListener("change", requestUpdate)
    }
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const mobileTileColor = isDark ? "#a978ff" : "#8c52ff"
  const tileClusters = [
    { id: "top-right", className: "right-[-16px] top-8", cols: 10, rows: 10, anchorCol: 9, anchorRow: 0, seed: 11 },
    { id: "lower-left", className: "left-[-24px] bottom-16", cols: 11, rows: 10, anchorCol: 0, anchorRow: 9, seed: 43 },
  ]
  const tileSize = 13
  const tileGap = 5

  return (
    <div
      id="hero"
      className="min-h-screen relative overflow-hidden -mt-16 pt-16 transition-colors duration-300"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1030 40%, #0d0820 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f6ff 40%, #f0f4ff 100%)',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Mobile hero treatment mirrors the pitch-deck/design-system wash and avoids the globe behind text. */}
      <div
        className="absolute inset-0 z-0 md:hidden pointer-events-none"
        style={{
          background: isDark
            ? `
              radial-gradient(900px 420px at 105% -8%, rgba(169,120,255,0.28), transparent 62%),
              radial-gradient(560px 360px at -20% 108%, rgba(140,82,255,0.18), transparent 68%),
              linear-gradient(180deg, #090611 0%, #15101f 100%)
            `
            : `
              radial-gradient(900px 420px at 105% -8%, rgba(140,82,255,0.18), transparent 62%),
              radial-gradient(560px 360px at -20% 108%, rgba(169,120,255,0.12), transparent 68%),
              linear-gradient(180deg, #ffffff 0%, #fafafa 100%)
            `,
        }}
        aria-hidden
      />
      <div
        ref={mobilePatternRef}
        className="absolute inset-0 z-[1] h-full w-full origin-center md:hidden pointer-events-none will-change-transform"
        aria-hidden
      >
        {tileClusters.map((cluster) => (
          <div
            key={cluster.id}
            className={`absolute ${cluster.className}`}
            style={{
              width: cluster.cols * tileSize + (cluster.cols - 1) * tileGap,
              height: cluster.rows * tileSize + (cluster.rows - 1) * tileGap,
            }}
          >
            {Array.from({ length: cluster.rows * cluster.cols }).map((_, index) => {
              const row = Math.floor(index / cluster.cols)
              const col = index % cluster.cols
              const dx = (col - cluster.anchorCol) / cluster.cols
              const dy = (row - cluster.anchorRow) / cluster.rows
              const distance = Math.sqrt(dx * dx + dy * dy)
              const density = Math.max(0, 1 - distance * 1.7)
              const noise = ((row * 37 + col * 19 + cluster.seed) % 100) / 100
              const isChecker = (row + col + cluster.seed) % 2 === 0
              const shouldRender = density > 0.12 && (isChecker || noise < density * 0.9)

              if (!shouldRender) return null

              const baseOpacity = (isDark ? 0.06 : 0.045) + density * (isDark ? 0.16 : 0.11)
              const peakOpacity = Math.min(isDark ? 0.62 : 0.42, baseOpacity + 0.26 + noise * 0.18)
              const duration = 2.6 + ((row * 11 + col * 7 + cluster.seed) % 18) / 10
              const delay = ((row * 23 + col * 29 + cluster.seed) % 34) / 10

              return (
                <span
                  key={`${cluster.id}-${row}-${col}`}
                  className="absolute rounded-[2px]"
                  style={
                    {
                      left: col * (tileSize + tileGap),
                      top: row * (tileSize + tileGap),
                      width: tileSize,
                      height: tileSize,
                      backgroundColor: mobileTileColor,
                      opacity: baseOpacity,
                      boxShadow: density > 0.64 ? `0 0 12px ${mobileTileColor}` : undefined,
                      "--tile-base": baseOpacity,
                      "--tile-peak": peakOpacity,
                      animation: `mobileHeroTilePulse ${duration}s ease-in-out ${delay}s infinite`,
                    } as React.CSSProperties
                  }
                />
              )
            })}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes mobileHeroTilePulse {
          0%,
          100% {
            opacity: var(--tile-base);
          }
          48% {
            opacity: var(--tile-peak);
          }
        }
      `}</style>
      {/* Starfield background - only in dark mode */}
      {isDark && <Starfield />}
      {/* Globe */}
      <div className="hidden md:block">
        <GlobeBackground isDark={isDark} />
      </div>
      {/* Subtle glow around globe area */}
      <div
        className="absolute inset-0 z-[1] hidden md:block pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 80% 80% at 70% 50%, rgba(140, 82, 255, 0.15) 0%, transparent 50%)'
            : 'radial-gradient(ellipse 80% 80% at 70% 50%, rgba(140, 82, 255, 0.08) 0%, transparent 50%)',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 z-10">{children}</div>
    </div>
  )
}
