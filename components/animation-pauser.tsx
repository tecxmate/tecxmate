"use client"

import { useEffect } from "react"

/**
 * Keeps the site from doing continuous animation work when it isn't needed:
 *
 * 1. Off-screen sections: pauses a section's decorative infinite CSS animations
 *    (offering-art pulses, org flow streams, tech carousel) while it's scrolled
 *    out of view — via `data-anim-paused` (see globals.css), no layout change.
 *
 * 2. Idle: after IDLE_MS with no pointer/scroll/key input (or when the tab is
 *    hidden), sets `data-idle` on <html> — which pauses all decorative CSS
 *    animations (globals.css) and, via the `app:idle` event, stops the canvas
 *    render loops (starfield, globe). This is what lets the machine go cool when
 *    the page is left open and unattended. Any interaction resumes instantly.
 */
const ANIMATED_SECTION_IDS = ["proof", "org", "technology"]
const IDLE_MS = 60_000

export function AnimationPauser() {
  useEffect(() => {
    const root = document.documentElement

    // --- 1. Pause a section's animations while it is off-screen ---
    const els = ANIMATED_SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el != null,
    )
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ;(entry.target as HTMLElement).toggleAttribute("data-anim-paused", !entry.isIntersecting)
        }
      },
      { rootMargin: "150px" },
    )
    els.forEach((el) => io.observe(el))

    // --- 2. Pause everything after a stretch of inactivity ---
    let timer: ReturnType<typeof setTimeout> | undefined
    let idle = false
    const setIdle = (next: boolean) => {
      if (next === idle) return
      idle = next
      root.toggleAttribute("data-idle", next)
      window.dispatchEvent(new CustomEvent("app:idle", { detail: { idle: next } }))
    }
    const onActivity = () => {
      setIdle(false)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => setIdle(true), IDLE_MS)
    }
    const onVisibility = () => {
      if (document.hidden) {
        if (timer) clearTimeout(timer)
        setIdle(true)
      } else {
        onActivity()
      }
    }

    const activityEvents = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"]
    const opts: AddEventListenerOptions = { passive: true }
    activityEvents.forEach((ev) => window.addEventListener(ev, onActivity, opts))
    document.addEventListener("visibilitychange", onVisibility)
    onActivity() // arm the idle timer

    return () => {
      io.disconnect()
      if (timer) clearTimeout(timer)
      activityEvents.forEach((ev) => window.removeEventListener(ev, onActivity, opts))
      document.removeEventListener("visibilitychange", onVisibility)
      root.removeAttribute("data-idle")
    }
  }, [])

  return null
}
