"use client"

import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"
import { OfferingArt } from "@/components/sales/offering-art"

export function ProofSection() {
  const { language } = useLanguage()
  const { proof } = salesDeck
  const offerings = proof.offerings
  const [active, setActive] = useState(0)
  const pausedRef = useRef(false)

  // Rotate through the services on a gentle cadence; pause on interaction.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => {
      if (pausedRef.current) return
      setActive((a) => (a + 1) % offerings.length)
    }, 5500)
    return () => clearInterval(id)
  }, [offerings.length])

  const cs = offerings[active]

  return (
    <section id="proof" className="bg-muted/30 py-20 md:py-24">
      <div className="container px-4 md:px-6 max-w-6xl">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-3">
          {pickLocale(proof.title, language)}
        </h2>
        <p className="text-muted-foreground mb-10 md:mb-12">
          {pickLocale(proof.subtitle, language)}
        </p>

        <div
          className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] gap-4 lg:gap-6"
          onPointerEnter={() => (pausedRef.current = true)}
          onPointerLeave={() => (pausedRef.current = false)}
        >
          {/* Tab handles — numbered, on the left (a scrollable row on mobile) */}
          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {offerings.map((o, i) => {
              const on = i === active
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className={`group flex items-center gap-3.5 rounded-xl border p-3.5 lg:p-4 text-left transition-colors shrink-0 min-w-[210px] lg:min-w-0 lg:w-full ${
                    on
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40"
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

          {/* Active service — one wide panel with a large illustration */}
          <div
            key={cs.id}
            className="rounded-2xl border border-primary/40 bg-card overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.08)] motion-safe:animate-[deck-assemble-in_400ms_ease-out]"
          >
            <div className="relative h-44 md:h-56 bg-muted/30 flex items-center justify-center border-b border-border overflow-hidden">
              <div className="scale-[1.4] md:scale-[1.7]">
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

              {cs.disclaimer && (
                <p className="text-xs text-muted-foreground/70 mt-4">{pickLocale(cs.disclaimer, language)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
