"use client"

import { useEffect } from "react"

/**
 * Pauses the decorative infinite CSS animations in a section while it is scrolled
 * off-screen. These animations (offering-art pulses, the org flow streams, the
 * tech carousel) otherwise run continuously for every section at once, keeping the
 * GPU compositor busy and heating the machine. Toggling `data-anim-paused` only
 * flips `animation-play-state` (see globals.css) — no layout/paint change.
 */
const ANIMATED_SECTION_IDS = ["proof", "org", "technology"]

export function AnimationPauser() {
  useEffect(() => {
    const els = ANIMATED_SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el != null,
    )
    if (els.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ;(entry.target as HTMLElement).toggleAttribute("data-anim-paused", !entry.isIntersecting)
        }
      },
      { rootMargin: "150px" },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return null
}
