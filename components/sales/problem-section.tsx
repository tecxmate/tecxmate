"use client"

import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

export function ProblemSection() {
  const { language } = useLanguage()
  const { problem } = salesDeck

  return (
    <section id="problem" className="bg-muted/30 py-20 md:py-24">
      <div className="container px-4 md:px-6 max-w-6xl">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-12 md:mb-16">
          {pickLocale(problem.title, language)}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {problem.points.map((point, i) => (
            <div key={i} className="bg-card p-6 border border-border">
              <span className="text-sm font-mono text-primary">0{i + 1}</span>
              <h3 className="text-lg font-semibold text-foreground mt-3 mb-2">
                {pickLocale(point.title, language)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pickLocale(point.body, language)}
              </p>
            </div>
          ))}
        </div>

        <p className="text-lg md:text-xl text-foreground max-w-3xl mb-16">
          {pickLocale(problem.close, language)}
        </p>

        <div className="border-l-4 border-primary pl-6 md:pl-8 max-w-3xl">
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
            {pickLocale(problem.reframe, language)}
          </p>
          <p className="text-xl md:text-2xl font-semibold text-foreground leading-snug">
            {pickLocale(problem.reframeStatement, language)}
          </p>
        </div>
      </div>
    </section>
  )
}
