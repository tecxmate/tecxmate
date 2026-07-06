"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

export function ProcessSection() {
  const { language } = useLanguage()
  const { process } = salesDeck
  const [active, setActive] = useState(0)
  const engagement = process.engagements[active]

  return (
    <section id="process" className="bg-muted/30 py-16 md:py-20">
      <div className="container px-4 md:px-6 max-w-6xl">
        <h2 className="text-2xl font-semibold md:text-3xl tracking-tight text-foreground mb-8 md:mb-10">
          {pickLocale(process.title, language)}
        </h2>

        {/* Engagement selector — picks which cooperation stages show above */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-10">
          <span className="text-sm text-muted-foreground mr-1">
            {pickLocale(process.engagementTitle, language)}:
          </span>
          {process.engagements.map((e, i) => {
            const isActive = i === active
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                title={pickLocale(e.body, language)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-white font-medium"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                {pickLocale(e.title, language)}
              </button>
            )
          })}
        </div>

        {/* Stages for the selected engagement */}
        <div key={engagement.id} className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
          {engagement.steps.map((step, i) => (
            <div
              key={i}
              className={`motion-safe:animate-[deck-assemble-in_400ms_ease-out_both] ${
                i > 0 ? "lg:border-l lg:border-border lg:pl-6" : ""
              }`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="text-sm font-mono text-primary">0{i + 1}</span>
              <h3 className="font-semibold text-foreground mt-1.5 mb-1">
                {pickLocale(step.title, language)}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pickLocale(step.body, language)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
