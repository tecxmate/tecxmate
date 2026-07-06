"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

// Percentage positions of the burden pills in the "before" graph.
const BURDEN_POS = [
  { x: 14, y: 48 },
  { x: 38, y: 44 },
  { x: 62, y: 44 },
  { x: 86, y: 48 },
  { x: 24, y: 80 },
  { x: 50, y: 86 },
  { x: 76, y: 80 },
]

export function OrgSection() {
  const { language } = useLanguage()
  const org = salesDeck.visuals.org
  const [after, setAfter] = useState(false)

  return (
    <section id="org" className="bg-muted/30 py-20 md:py-24">
      <div className="container px-4 md:px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground">
            {pickLocale(org.title, language)}
          </h2>

          {/* Toggle */}
          <div className="inline-flex self-start rounded-full border border-border bg-card p-1" role="tablist">
            <button
              role="tab"
              aria-selected={!after}
              onClick={() => setAfter(false)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                !after ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {pickLocale(org.toggleBefore, language)}
            </button>
            <button
              role="tab"
              aria-selected={after}
              onClick={() => setAfter(true)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                after ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {pickLocale(org.toggleAfter, language)}
            </button>
          </div>
        </div>

        {/* Graph */}
        <div className="relative h-[300px] md:h-[340px] select-none">
          {/* Before: you carrying seven obligations */}
          <div
            aria-hidden={after}
            className={`absolute inset-0 transition-all duration-500 ${
              after ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
            }`}
          >
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {BURDEN_POS.map((p, i) => (
                <path
                  key={i}
                  d={`M 50 14 Q ${(50 + p.x) / 2} ${p.y - 26} ${p.x} ${p.y - 7}`}
                  fill="none"
                  className="stroke-zinc-400 dark:stroke-zinc-600"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            <Pill x={50} y={10} variant="ink">
              {pickLocale(org.youLabel, language)}
            </Pill>
            {org.burdens.map((b, i) => (
              <Pill key={i} x={BURDEN_POS[i].x} y={BURDEN_POS[i].y} variant="muted">
                {pickLocale(b, language)}
              </Pill>
            ))}
          </div>

          {/* After: one clean line */}
          <div
            aria-hidden={!after}
            className={`absolute inset-0 transition-all duration-500 ${
              after ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <line
                x1="23" y1="50" x2="41" y2="50"
                className="stroke-primary deck-flow"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="59" y1="50" x2="77" y2="50"
                className="stroke-primary deck-flow"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <Pill x={15} y={50} variant="ink">
              {pickLocale(org.youLabel, language)}
            </Pill>
            <Pill x={50} y={50} variant="primary">
              tecxmate
            </Pill>
            <Pill x={85} y={50} variant="ink">
              {pickLocale(org.productLabel, language)}
            </Pill>
          </div>
        </div>

        <p className="text-lg md:text-xl font-medium text-foreground text-center mt-8 max-w-2xl mx-auto">
          {pickLocale(org.close, language)}
        </p>
      </div>
    </section>
  )
}

function Pill({
  x,
  y,
  variant,
  children,
}: {
  x: number
  y: number
  variant: "ink" | "muted" | "primary"
  children: React.ReactNode
}) {
  const styles =
    variant === "primary"
      ? "bg-primary text-white border-primary font-accent italic text-base md:text-lg"
      : variant === "ink"
        ? "bg-foreground text-background border-foreground font-medium"
        : "bg-card text-muted-foreground border-border"
  return (
    <span
      className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm shadow-sm ${styles}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {children}
    </span>
  )
}
