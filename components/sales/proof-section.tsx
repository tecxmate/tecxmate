"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"
import type { Locale } from "@/lib/site-content"
import { OfferingArt } from "@/components/sales/offering-art"

type Offering = (typeof salesDeck.proof.offerings)[number]

/** How long each service holds before the desktop rail advances on its own. */
const ROTATE_INTERVAL_MS = 6000

/** The rail is desktop-only; below this, scrolling drives the panel instead. */
const DESKTOP_QUERY = "(min-width: 1024px)"

/** Copy and illustration for one service — shared by the rail and the mobile panel. */
function OfferingPanel({ offering, language }: { offering: Offering; language: Locale }) {
  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
      <div>
        <h3 className="text-2xl md:text-3xl xl:text-4xl font-semibold leading-[1.15] tracking-tight text-foreground">
          {pickLocale(offering.title, language)}
        </h3>
        <p className="mt-4 text-base xl:text-lg text-muted-foreground leading-relaxed">
          {pickLocale(offering.summary, language)}
        </p>
        <div className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
          {offering.metrics.map((metric, i) => (
            <div key={i}>
              <p className="text-xs text-muted-foreground mb-1.5">{pickLocale(metric.label, language)}</p>
              <p className="text-2xl md:text-3xl font-semibold text-primary tabular-nums leading-none">
                {pickLocale(metric.value, language)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {offering.stack.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[180px] lg:min-h-[300px]">
        <div className="scale-[1.2] sm:scale-[1.5] lg:scale-[1.9]">
          <OfferingArt id={offering.id} />
        </div>
      </div>
    </div>
  )
}

/**
 * Six services in one component, driven two different ways.
 *
 * Desktop gets a vertical rail that auto-advances. On phones that rail needed
 * over four screens of sideways scrolling and put the active tab out of sight,
 * so below `lg` the section pins to the viewport and vertical scrolling moves
 * through the services one at a time instead.
 */
export function ProofSection() {
  const { language } = useLanguage()
  const { proof } = salesDeck
  const [activeIndex, setActiveIndex] = useState(0)
  // Rotation is a hint for someone who has not engaged yet. The moment a
  // visitor picks a service it stops for good, so the panel never moves out
  // from under someone who is reading it.
  const [isRotating, setIsRotating] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isIdle, setIsIdle] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const sectionRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  const offerings = proof.offerings
  const active: Offering = offerings[activeIndex]

  /** Auto-rotation is actually running — drives both the timer and the countdown bar. */
  const isAdvancing = isDesktop && isRotating && !isHovered && isVisible && !isIdle

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY)
    const sync = () => setIsDesktop(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  // Only rotate while the section is on screen, so a visitor who scrolls down
  // does not arrive mid-cycle at service four. Threshold 0: the section is
  // taller than a short viewport, where a fractional threshold can never be
  // reached and rotation would never start at all.
  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0,
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // The page pauses decorative CSS animations once idle; follow it, so the
  // progress bar and the rotation it describes never disagree.
  useEffect(() => {
    const onIdle = (event: Event) => setIsIdle(Boolean((event as CustomEvent).detail?.idle))
    window.addEventListener("app:idle", onIdle)
    return () => window.removeEventListener("app:idle", onIdle)
  }, [])

  useEffect(() => {
    if (!isAdvancing) return
    // Motion that starts on its own is exactly what this setting asks us not
    // to do, so respect it rather than merely shortening the animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % offerings.length),
      ROTATE_INTERVAL_MS,
    )
    return () => window.clearInterval(timer)
  }, [isAdvancing, offerings.length])

  // Mobile: map scroll position within the pinned track onto a service.
  useEffect(() => {
    if (isDesktop) return
    const track = trackRef.current
    if (!track) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = track.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      if (scrollable <= 0) return

      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1)
      // The last step would only be reached at exactly 1, so clamp into range.
      const index = Math.min(offerings.length - 1, Math.floor(progress * offerings.length))
      setActiveIndex(index)
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [isDesktop, offerings.length])

  /** Jump the page to the scroll offset that shows a given service. */
  const scrollToOffering = useCallback(
    (index: number) => {
      const track = trackRef.current
      if (!track) return
      const scrollable = track.offsetHeight - window.innerHeight
      const step = scrollable / offerings.length
      // Land mid-step so the position is comfortably inside the target range.
      window.scrollTo({ top: track.offsetTop + step * (index + 0.5), behavior: "smooth" })
    },
    [offerings.length],
  )

  const selectTab = (index: number) => {
    setIsRotating(false)
    setActiveIndex(index)
  }

  // A tablist is expected to move selection with the arrow keys; only the
  // selected tab is in the tab order, so without this the other five are
  // unreachable by keyboard.
  const onKeyDown = (event: React.KeyboardEvent) => {
    const lastIndex = offerings.length - 1
    let next: number | null = null

    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = activeIndex === lastIndex ? 0 : activeIndex + 1
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = activeIndex === 0 ? lastIndex : activeIndex - 1
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = lastIndex

    if (next === null) return
    event.preventDefault()
    selectTab(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="proof" ref={sectionRef} className="bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl pt-16 md:pt-20">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-3">
          {pickLocale(proof.title, language)}
        </h2>
        <p className="text-muted-foreground max-w-2xl">{pickLocale(proof.subtitle, language)}</p>
      </div>

      {/* Desktop: vertical rail beside the panel */}
      <div className="hidden lg:block container mx-auto px-4 md:px-6 max-w-6xl pb-20">
        <div
          // Hover pause is scoped to the rail and panel, not the whole section:
          // the section spans the full viewport width, so a cursor resting
          // anywhere on screen used to freeze the rotation silently.
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setIsHovered(true)}
          onBlurCapture={() => setIsHovered(false)}
          className="mt-10 grid lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] gap-8 lg:gap-14 items-start"
        >
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label={pickLocale(proof.title, language)}
            onKeyDown={onKeyDown}
            className="flex flex-col gap-1 sticky top-24"
          >
            {offerings.map((offering, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={offering.id}
                  ref={(node) => {
                    tabRefs.current[index] = node
                  }}
                  type="button"
                  role="tab"
                  id={`offering-tab-${offering.id}`}
                  aria-selected={isActive}
                  aria-controls={`offering-panel-${offering.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectTab(index)}
                  className={`relative w-full text-left px-4 py-3 border-l-2 transition-colors ${
                    isActive
                      ? "border-primary bg-card text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/60"
                  }`}
                >
                  {isActive && isAdvancing && (
                    // Keyed on the index so the countdown restarts with each
                    // service rather than continuing from where it left off.
                    <span
                      key={activeIndex}
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left bg-primary/50 motion-safe:animate-[tab-progress_6s_linear] motion-reduce:hidden"
                    />
                  )}
                  <span className="flex items-baseline gap-2">
                    <span className="text-primary tabular-nums text-sm font-semibold">{index + 1}.</span>
                    <span className="font-semibold leading-snug">{pickLocale(offering.title, language)}</span>
                  </span>
                  <span className="mt-1 block pl-6 text-xs text-muted-foreground">
                    {pickLocale(offering.tag, language)}
                  </span>
                </button>
              )
            })}
          </div>

          <div
            role="tabpanel"
            id={`offering-panel-${active.id}`}
            aria-labelledby={`offering-tab-${active.id}`}
            className="min-w-0"
          >
            <OfferingPanel offering={active} language={language} />
          </div>
        </div>
      </div>

      {/* Mobile: the section pins and vertical scrolling steps through the services */}
      <div
        ref={trackRef}
        className="lg:hidden relative"
        style={{ height: `${offerings.length * 100}svh` }}
      >
        {/* No overflow-hidden: the tallest panel leaves only ~46px spare on a
            small phone, and clipping would drop copy silently if a visitor
            scales up their text. Overflowing visibly is the safer failure. */}
        <div className="sticky top-0 flex h-[100svh] items-center">
          <div className="container mx-auto px-4 w-full">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex gap-1.5">
                {offerings.map((offering, index) => (
                  <button
                    key={offering.id}
                    type="button"
                    onClick={() => scrollToOffering(index)}
                    aria-label={pickLocale(offering.title, language)}
                    aria-current={index === activeIndex}
                    className={`h-1.5 rounded-full transition-all ${
                      index === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-border"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground tabular-nums">
                {activeIndex + 1} / {offerings.length}
              </p>
            </div>
            <OfferingPanel offering={active} language={language} />
          </div>
        </div>
      </div>
    </section>
  )
}
