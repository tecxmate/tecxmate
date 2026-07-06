"use client"

import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

export function ProofSection() {
  const { language } = useLanguage()
  const { proof } = salesDeck

  return (
    <section id="proof" className="bg-muted/30 py-20 md:py-24">
      <div className="container px-4 md:px-6 max-w-6xl">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-3">
          {pickLocale(proof.title, language)}
        </h2>
        <p className="text-muted-foreground mb-12 md:mb-16">
          {pickLocale(proof.subtitle, language)}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {proof.caseStudies.map((cs) => (
            <article
              key={cs.id}
              className="bg-card border border-border p-6 md:p-8 flex flex-col transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
            >
              <span className="text-xs font-medium uppercase tracking-wider text-primary mb-3">
                {pickLocale(cs.tag, language)}
              </span>
              <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4 leading-snug">
                {pickLocale(cs.title, language)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {pickLocale(cs.problem, language)}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {pickLocale(cs.solution, language)}
              </p>
              <p className="text-sm text-foreground leading-relaxed mb-6">
                {pickLocale(cs.outcome, language)}
              </p>

              <div className="mt-auto">
                <div className="flex flex-wrap gap-8 border-t border-border pt-5 mb-5">
                  {cs.metrics.map((m, i) => (
                    <div key={i}>
                      <p className="text-xl md:text-2xl font-semibold text-primary">
                        {pickLocale(m.value, language)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pickLocale(m.label, language)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {cs.stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2.5 py-1 border border-border text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                {cs.disclaimer && (
                  <p className="text-xs text-muted-foreground/70 mt-4">
                    {pickLocale(cs.disclaimer, language)}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
