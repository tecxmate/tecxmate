"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"
import { OfferingArt } from "@/components/sales/offering-art"

type Offering = (typeof salesDeck.proof.offerings)[number]

/** The full content for one service — illustration hero + details. */
function ServicePanel({ cs }: { cs: Offering }) {
  const { language } = useLanguage()
  return (
    <div className="rounded-2xl border border-primary/40 bg-card overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.08)]">
      <div className="relative h-40 md:h-48 bg-muted/30 flex items-center justify-center border-b border-border overflow-hidden">
        <div className="scale-[1.4] md:scale-[1.6]">
          <OfferingArt id={cs.id} />
        </div>
      </div>
      <div className="p-6 md:p-8">
        <span className="text-xs font-medium uppercase tracking-wider text-primary">
          {pickLocale(cs.tag, language)}
        </span>
        <h3 className="text-xl md:text-2xl font-semibold text-foreground mt-2 mb-3 leading-snug">
          {pickLocale(cs.title, language)}
        </h3>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 max-w-2xl">
          {pickLocale(cs.summary, language)}
        </p>
        <div className="flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-5">
          {cs.metrics.map((m, i) => (
            <div key={i}>
              <p className="text-xs text-muted-foreground mb-1">{pickLocale(m.label, language)}</p>
              <p className="text-2xl md:text-3xl font-semibold text-primary tabular-nums leading-none">
                {pickLocale(m.value, language)}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          {cs.stack.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground"
            >
              {tech}
            </span>
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

  // --- Desktop: native sticky pin; vertical scroll scrubs the filmstrip ---
  const wrapperRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
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
        const total = rect.height - window.innerHeight
        const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0
        const f = p * (N - 1)
        if (stripRef.current) stripRef.current.style.transform = `translateX(-${f * 100}%)`
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

  const goTo = useCallback((i: number) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    window.scrollTo({ top: wrapper.offsetTop + i * window.innerHeight + 4, behavior: "smooth" })
  }, [])

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
            {offerings.map((cs) => (
              <article key={cs.id} className="snap-center shrink-0 w-[86%] sm:w-[70%]">
                <ServicePanel cs={cs} />
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

      {/* Desktop: pinned; vertical scroll rotates through the four horizontally */}
      <div ref={wrapperRef} className="hidden lg:block relative" style={{ height: `${N * 100}vh` }}>
        <div className="sticky top-0 h-screen flex items-center bg-muted/30 overflow-hidden">
          <div className="container px-4 md:px-6 max-w-6xl w-full">
            <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-3">
              {pickLocale(proof.title, language)}
            </h2>
            <p className="text-muted-foreground mb-8 lg:mb-10">{pickLocale(proof.subtitle, language)}</p>

            <div className="grid grid-cols-[300px_1fr] gap-6">
              {/* Numbered tab rail */}
              <div className="flex flex-col gap-3 self-center">
                {offerings.map((o, i) => {
                  const on = i === active
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-pressed={on}
                      className={`group flex items-center gap-3.5 rounded-xl border p-4 text-left transition-colors ${
                        on ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <span
                        className={`shrink-0 h-9 w-9 rounded-lg flex items-center justify-center text-sm font-semibold tabular-nums transition-colors ${
                          on ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:text-primary"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-sm font-medium leading-snug ${
                          on ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {pickLocale(o.tag, language)}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Filmstrip — scrubbed by scroll progress */}
              <div className="overflow-hidden">
                <div ref={stripRef} className="flex w-full will-change-transform">
                  {offerings.map((cs) => (
                    <div key={cs.id} className="w-full shrink-0">
                      <ServicePanel cs={cs} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground/70 mt-8">
              {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")} — keep scrolling to explore all {N}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
