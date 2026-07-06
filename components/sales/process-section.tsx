"use client"

import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

export function ProcessSection() {
  const { language } = useLanguage()
  const { process } = salesDeck

  return (
    <section id="process" className="bg-muted/30 py-16 md:py-20">
      <div className="container px-4 md:px-6 max-w-6xl">
        <h2 className="text-2xl font-semibold md:text-3xl tracking-tight text-foreground mb-10 md:mb-12">
          {pickLocale(process.title, language)}
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 mb-12">
          {process.steps.map((step, i) => (
            <div key={i} className={i > 0 ? "lg:border-l lg:border-border lg:pl-6" : ""}>
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

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-sm text-muted-foreground mr-1">
            {pickLocale(process.engagementTitle, language)}:
          </span>
          {process.engagements.map((e, i) => (
            <span
              key={i}
              title={pickLocale(e.body, language)}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground"
            >
              {pickLocale(e.title, language)}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
