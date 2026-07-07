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

/** One full-viewport service page for the horizontal track (desktop). */
function ServicePage({ cs }: { cs: Offering }) {
  const { language } = useLanguage()
  return (
    <div className="w-screen h-full shrink-0 flex items-center">
      <div className="container mx-auto px-6 md:px-10 max-w-6xl w-full grid grid-cols-[1.05fr_0.95fr] gap-12 xl:gap-20 items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {pickLocale(cs.tag, language)}
          </span>
          <h3 className="mt-5 text-3xl md:text-4xl xl:text-5xl font-semibold leading-[1.08] tracking-tight text-foreground max-w-xl">
            {pickLocale(cs.title, language)}
          </h3>
          <p className="mt-6 text-lg xl:text-xl text-muted-foreground leading-relaxed max-w-lg">
            {pickLocale(cs.summary, language)}
          </p>
          <div className="mt-10 flex flex-wrap gap-x-12 gap-y-5">
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
        <div className="flex justify-center">
          <div className="rounded-3xl border border-border bg-card px-10 py-8 shadow-[0_20px_60px_-20px_rgba(139,92,246,0.3)]">
            <div className="scale-[1.4] xl:scale-[1.6]">
              <OfferingArt id={cs.id} />
            </div>
          </div>
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

  // --- Desktop: pinned horizontal scroll — vertical scroll moves the track sideways,
  //     each service is a full-viewport page. Linear (no lock) so it never feels stuck. ---
  const wrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

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
        const f = p * (N - 1)
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(-${f * 100}vw, 0, 0)`
        }
        const idx = Math.round(f)
        setActive((prev) => (prev === idx ? prev : idx))
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    onScroll()
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [N])

  const goTo = useCallback(
    (i: number) => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const totalPx = wrapper.offsetHeight - window.innerHeight
      const pTarget = N > 1 ? i / (N - 1) : 0
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

      {/* Desktop: pinned horizontal scroll — each service is a full-viewport page;
          vertical scroll slides the track sideways. Header stays; titles move in. */}
      <div ref={wrapperRef} className="hidden lg:block relative" style={{ height: `${N * 100}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden bg-muted/30">
          {/* Persistent header + progress */}
          <div className="absolute inset-x-0 top-0 z-20">
            <div className="container mx-auto px-6 md:px-10 max-w-6xl pt-24 xl:pt-28">
              <div className="flex items-end justify-between gap-6">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                  {pickLocale(proof.title, language)}
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {offerings.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-label={`Service ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${i === active ? "w-7 bg-primary" : "w-3 bg-border hover:bg-primary/40"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal track */}
          <div ref={trackRef} className="flex h-full will-change-transform">
            {offerings.map((cs) => (
              <ServicePage key={cs.id} cs={cs} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
