"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"
import { OfferingArt } from "@/components/sales/offering-art"

type Offering = (typeof salesDeck.proof.offerings)[number]

/** The full content for one service — illustration hero + details. */
function ServicePanel({
  cs,
  index,
  total,
  compact,
}: {
  cs: Offering
  index: number
  total: number
  compact?: boolean
}) {
  const { language } = useLanguage()
  return (
    <div className="h-full flex flex-col rounded-2xl border border-primary/40 bg-card overflow-hidden shadow-[0_10px_40px_-8px_rgba(139,92,246,0.25)]">
      <div className="relative h-32 md:h-36 bg-muted/30 flex items-center justify-center border-b border-border overflow-hidden shrink-0">
        <div className="scale-[1.3] md:scale-[1.45]">
          <OfferingArt id={cs.id} />
        </div>
        <span className="absolute top-3 right-4 text-xs font-medium tabular-nums text-muted-foreground/70">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-col flex-1 min-h-0 p-6 md:p-7">
        <span className="text-xs font-medium uppercase tracking-wider text-primary">
          {pickLocale(cs.tag, language)}
        </span>
        <h3 className="text-lg md:text-xl font-semibold text-foreground mt-2 mb-2.5 leading-snug">
          {pickLocale(cs.title, language)}
        </h3>
        <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed line-clamp-2">
          {pickLocale(cs.summary, language)}
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-4 mt-auto">
          {cs.metrics.map((m, i) => (
            <div key={i}>
              <p className="text-xs text-muted-foreground mb-1">{pickLocale(m.label, language)}</p>
              <p className="text-xl md:text-2xl font-semibold text-primary tabular-nums leading-none">
                {pickLocale(m.value, language)}
              </p>
            </div>
          ))}
        </div>
        {!compact && (
          <div className="flex flex-wrap gap-2 mt-5">
            {cs.stack.map((tech) => (
              <span
                key={tech}
                className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** Big editorial content for the active service (desktop, Neon-style). */
function ServiceContent({ cs }: { cs: Offering }) {
  const { language } = useLanguage()
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
        {pickLocale(cs.tag, language)}
      </span>
      <h3 className="mt-4 text-3xl md:text-4xl xl:text-[2.6rem] font-semibold leading-[1.15] tracking-tight text-foreground max-w-2xl">
        {pickLocale(cs.title, language)}
      </h3>
      <p className="mt-5 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
        {pickLocale(cs.summary, language)}
      </p>
      <div className="mt-9 flex items-center gap-8 xl:gap-12">
        <div className="shrink-0 rounded-2xl border border-border bg-card px-6 py-3">
          <OfferingArt id={cs.id} />
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          {cs.metrics.map((m, i) => (
            <div key={i}>
              <p className="text-xs text-muted-foreground mb-1.5">{pickLocale(m.label, language)}</p>
              <p className="text-2xl md:text-3xl font-semibold text-primary tabular-nums leading-none">
                {pickLocale(m.value, language)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProofSection() {
  const { language } = useLanguage()
  const { proof } = salesDeck
  const offerings = proof.offerings
  const N = offerings.length

  // --- Desktop: pinned; vertical scroll advances the active service (Neon-style) ---
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  activeRef.current = active
  const lockRef = useRef(false)
  const minWheelUnlockAtRef = useRef(0)
  const wheelUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const rect = wrapper.getBoundingClientRect()
        const totalPx = rect.height - window.innerHeight
        const p = totalPx > 0 ? Math.min(Math.max(-rect.top / totalPx, 0), 1) : 0
        // Dwell: hold on each card for most of its zone, then swipe to the next.
        const zone = 1 / N
        const k = Math.min(Math.floor(p / zone), N - 1)
        let f: number
        if (k >= N - 1) {
          f = N - 1
        } else {
          const HOLD = 0.55
          const local = (p - k * zone) / zone
          const m = Math.min(Math.max((local - HOLD) / (1 - HOLD), 0), 1)
          f = k + m * m * (3 - 2 * m)
        }
        const idx = Math.round(f)
        setActive((prev) => (prev === idx ? prev : idx))
      })
    }
    // One card per scroll gesture: intercept the wheel while the deck is pinned and
    // step exactly one card, locked until the move settles — a hard scroll can't skip.
    const stepTo = (i: number) => {
      const totalPx = wrapper.offsetHeight - window.innerHeight
      const pTarget = Math.min((i + 0.25) / N, 0.999)
      window.scrollTo({ top: wrapper.offsetTop + pTarget * totalPx, behavior: "smooth" })
    }
    const scheduleWheelUnlock = () => {
      if (wheelUnlockTimerRef.current) clearTimeout(wheelUnlockTimerRef.current)
      const delay = Math.max(260, minWheelUnlockAtRef.current - window.performance.now())
      wheelUnlockTimerRef.current = setTimeout(() => {
        lockRef.current = false
      }, delay)
    }

    const onWheel = (e: WheelEvent) => {
      const rect = wrapper.getBoundingClientRect()
      const pinned = rect.top <= 1 && rect.bottom >= window.innerHeight - 1
      if (!pinned) return // outside the deck — let the page scroll normally
      if (lockRef.current) {
        e.preventDefault()
        scheduleWheelUnlock()
        return
      }
      if (Math.abs(e.deltaY) < 8 || Math.abs(e.deltaY) < Math.abs(e.deltaX)) {
        e.preventDefault()
        return
      }
      const dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0
      if (dir === 0) return
      const next = activeRef.current + dir
      if (next < 0 || next > N - 1) return // at an edge — release to leave the section
      e.preventDefault()
      lockRef.current = true
      minWheelUnlockAtRef.current = window.performance.now() + 620
      stepTo(next)
      window.setTimeout(() => {
        scheduleWheelUnlock()
      }, 520)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    window.addEventListener("wheel", onWheel, { passive: false })
    onScroll()
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      window.removeEventListener("wheel", onWheel)
      if (wheelUnlockTimerRef.current) clearTimeout(wheelUnlockTimerRef.current)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [N])

  const goTo = useCallback(
    (i: number) => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const totalPx = wrapper.offsetHeight - window.innerHeight
      const pTarget = Math.min((i + 0.25) / N, 0.999)
      window.scrollTo({ top: wrapper.offsetTop + pTarget * totalPx, behavior: "smooth" })
    },
    [N],
  )

  // --- Mobile: swipeable row of cards with dot indicators ---
  const mobileRef = useRef<HTMLDivElement>(null)
  const [mActive, setMActive] = useState(0)
  const onMobileScroll = useCallback(() => {
    const el = mobileRef.current
    if (!el) return
    const center = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let bestD = Infinity
    Array.from(el.children).forEach((c, i) => {
      const node = c as HTMLElement
      const cc = node.offsetLeft + node.offsetWidth / 2
      const d = Math.abs(cc - center)
      if (d < bestD) {
        bestD = d
        best = i
      }
    })
    setMActive(best)
  }, [])
  const mobileGoTo = (i: number) => {
    const el = mobileRef.current
    if (!el) return
    const child = el.children[i] as HTMLElement | undefined
    if (child) el.scrollTo({ left: child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2, behavior: "smooth" })
  }

  return (
    <section id="proof" className="bg-muted/30">
      {/* Mobile / touch: swipe through full cards (next one peeks), dot indicators */}
      <div className="lg:hidden py-20 md:py-24">
        <div className="container px-4 md:px-6 max-w-6xl">
          <h2 className="text-3xl font-semibold md:text-4xl tracking-tight text-foreground mb-3">
            {pickLocale(proof.title, language)}
          </h2>
          <p className="text-muted-foreground mb-8">{pickLocale(proof.subtitle, language)}</p>
          <div
            ref={mobileRef}
            onScroll={onMobileScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {offerings.map((cs, i) => (
              <article key={cs.id} className="snap-center shrink-0 w-[86%] sm:w-[70%]">
                <ServicePanel cs={cs} index={i} total={N} />
              </article>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-6">
            {offerings.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => mobileGoTo(i)}
                aria-label={`Service ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === mActive ? "w-6 bg-primary" : "w-2 bg-border"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: pinned; left text-nav rail + big editorial content that crossfades
          as you scroll through the four services (Neon-style). */}
      <div ref={wrapperRef} className="hidden lg:block relative" style={{ height: `${N * 100}vh` }}>
        <div className="sticky top-0 h-screen flex items-center bg-muted/30 overflow-hidden">
          <div className="container px-4 md:px-6 max-w-6xl w-full">
            <div className="grid grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-12 xl:gap-20 items-center">
              {/* Left: nav rail */}
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-2">
                  {pickLocale(proof.title, language)}
                </h2>
                <p className="text-sm text-muted-foreground mb-9 max-w-xs leading-relaxed">
                  {pickLocale(proof.subtitle, language)}
                </p>
                <nav className="flex flex-col">
                  {offerings.map((o, i) => {
                    const on = i === active
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-pressed={on}
                        className="group flex items-center gap-4 py-2.5 text-left"
                      >
                        <span
                          className={`h-6 w-[3px] rounded-full transition-colors ${on ? "bg-primary" : "bg-transparent group-hover:bg-border"}`}
                        />
                        <span
                          className={`text-base xl:text-lg font-medium transition-colors ${
                            on ? "text-foreground" : "text-muted-foreground/45 group-hover:text-muted-foreground"
                          }`}
                        >
                          {pickLocale(o.tag, language)}
                        </span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Right: crossfading editorial content */}
              <div className="relative min-h-[380px] xl:min-h-[400px]">
                {offerings.map((cs, i) => (
                  <div
                    key={cs.id}
                    className={`absolute inset-0 transition-all duration-500 ease-out ${
                      i === active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
                    }`}
                  >
                    <ServiceContent cs={cs} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
