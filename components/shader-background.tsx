"use client"

import type React from "react"
import { GlobeBackground } from "@/components/globe-background"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export default function ShaderBackground({ children }: ShaderBackgroundProps) {
  return (
    <div 
      id="hero" 
      className="min-h-screen bg-white relative overflow-hidden -mt-16 pt-16"
      style={{
        transform: 'translateZ(0)', // Force hardware acceleration
        backfaceVisibility: 'hidden',
        WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
      }}
    >
      <GlobeBackground />
      {/* Light wash for text readability - reduced opacity */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(250,245,255,0.15) 40%, rgba(240,249,255,0.15) 70%, rgba(255,255,255,0.4) 100%)',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 z-10">{children}</div>
    </div>
  )
}
