"use client"

import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

export function ProcessSection() {
  const { language } = useLanguage()
  const { process } = salesDeck

  return (
    <section id="process" className="bg-muted/30 py-20 md:py-24">
      <div className="container px-4 md:px-6 max-w-6xl">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-12 md:mb-16">
          {pickLocale(process.title, language)}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {process.steps.map((step, i) => (
            <div key={i} className="relative bg-card p-6 border border-border">
              <span className="text-sm font-mono text-primary">0{i + 1}</span>
              <h3 className="text-lg font-semibold text-foreground mt-3 mb-2">
                {pickLocale(step.title, language)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pickLocale(step.body, language)}
              </p>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-6">
          {pickLocale(process.engagementTitle, language)}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {process.engagements.map((e, i) => (
            <div key={i} className="border-l-2 border-primary pl-5 py-1">
              <p className="font-semibold text-foreground mb-1">{pickLocale(e.title, language)}</p>
              <p className="text-sm text-muted-foreground">{pickLocale(e.body, language)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
