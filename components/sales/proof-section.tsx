"use client"

import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"
import { OfferingArt } from "@/components/sales/offering-art"

type Offering = (typeof salesDeck.proof.offerings)[number]

/** How long each service holds before the rail advances on its own. */
const ROTATE_INTERVAL_MS = 6000

/** The six services as one panel driven by a vertical rail, rather than six stacked blocks. */
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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const sectionRef = useRef<HTMLElement | null>(null)

  const offerings = proof.offerings
  const active: Offering = offerings[activeIndex]

  /** Rotation is actually running — drives both the timer and the countdown bar. */
  const isAdvancing = isRotating && !isHovered && isVisible && !isIdle

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
    <section id="proof" ref={sectionRef} className="bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-3">
          {pickLocale(proof.title, language)}
        </h2>
        <p className="text-muted-foreground max-w-2xl">{pickLocale(proof.subtitle, language)}</p>

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
          {/* Rail — vertical from lg, a horizontally scrollable strip below it */}
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label={pickLocale(proof.title, language)}
            onKeyDown={onKeyDown}
            className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0 lg:sticky lg:top-24"
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
                  className={`relative shrink-0 lg:w-full text-left px-4 py-3 border-l-2 transition-colors ${
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
                  <span className="hidden lg:block mt-1 pl-6 text-xs text-muted-foreground">
                    {pickLocale(offering.tag, language)}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Panel */}
          <div
            role="tabpanel"
            id={`offering-panel-${active.id}`}
            aria-labelledby={`offering-tab-${active.id}`}
            className="min-w-0"
          >
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl xl:text-4xl font-semibold leading-[1.15] tracking-tight text-foreground">
                  {pickLocale(active.title, language)}
                </h3>
                <p className="mt-4 text-base xl:text-lg text-muted-foreground leading-relaxed">
                  {pickLocale(active.summary, language)}
                </p>
                <div className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
                  {active.metrics.map((metric, i) => (
                    <div key={i}>
                      <p className="text-xs text-muted-foreground mb-1.5">{pickLocale(metric.label, language)}</p>
                      <p className="text-2xl md:text-3xl font-semibold text-primary tabular-nums leading-none">
                        {pickLocale(metric.value, language)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {active.stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center min-h-[220px] lg:min-h-[300px]">
                <div className="scale-[1.4] sm:scale-[1.7] lg:scale-[1.9]">
                  <OfferingArt id={active.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
