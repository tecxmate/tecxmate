"use client"

import { useRef, useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"
import { OfferingArt } from "@/components/sales/offering-art"

type Offering = (typeof salesDeck.proof.offerings)[number]

/** The six services as one panel driven by a vertical rail, rather than six stacked blocks. */
export function ProofSection() {
  const { language } = useLanguage()
  const { proof } = salesDeck
  const [activeIndex, setActiveIndex] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const offerings = proof.offerings
  const active: Offering = offerings[activeIndex]

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
    setActiveIndex(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="proof" className="bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-3">
          {pickLocale(proof.title, language)}
        </h2>
        <p className="text-muted-foreground max-w-2xl">{pickLocale(proof.subtitle, language)}</p>

        <div className="mt-10 grid lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] gap-8 lg:gap-14 items-start">
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
                  onClick={() => setActiveIndex(index)}
                  className={`shrink-0 lg:w-full text-left px-4 py-3 border-l-2 transition-colors ${
                    isActive
                      ? "border-primary bg-card text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/60"
                  }`}
                >
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
