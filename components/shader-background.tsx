"use client"

import type React from "react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { GlobeBackground } from "@/components/globe-background"
import { Starfield } from "@/components/starfield"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

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
      {/* Starfield background - only in dark mode */}
      {isDark && <Starfield />}
      {/* Globe */}
      <GlobeBackground isDark={isDark} />
      {/* Subtle glow around globe area */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
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
