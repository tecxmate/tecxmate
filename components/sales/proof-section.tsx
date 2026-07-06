"use client"

import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"
import { OfferingArt } from "@/components/sales/offering-art"

export function ProofSection() {
  const { language } = useLanguage()
  const { proof } = salesDeck

  return (
    <section id="proof" className="bg-muted/30 py-20 md:py-24">
      <div className="container px-4 md:px-6 max-w-7xl">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-3">
          {pickLocale(proof.title, language)}
        </h2>
        <p className="text-muted-foreground mb-12 md:mb-16">
          {pickLocale(proof.subtitle, language)}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {proof.offerings.map((cs) => (
            <article
              key={cs.id}
              className="proof-card bg-card border border-border rounded-2xl p-6 md:p-7 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
            >
              {/* Row 1: illustration */}
              <OfferingArt id={cs.id} />

              {/* Row 2: tag + title + summary */}
              <div className="pt-5">
                <span className="block text-xs font-medium uppercase tracking-wider text-primary mb-3">
                  {pickLocale(cs.tag, language)}
                </span>
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-3 leading-snug">
                  {pickLocale(cs.title, language)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pickLocale(cs.summary, language)}
                </p>
              </div>

              {/* Row 3: metric numbers — aligned across cards via subgrid */}
              <div className="flex flex-col gap-4 border-t border-border pt-5 mt-6">
                {cs.metrics.map((m, i) => (
                  <div key={i}>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      {pickLocale(m.label, language)}
                    </p>
                    <p className="text-2xl md:text-3xl font-semibold text-primary tabular-nums leading-none">
                      {pickLocale(m.value, language)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Row 4: stack + disclaimer, pinned to the bottom */}
              <div className="flex flex-col justify-end pt-6">
                <div className="flex flex-wrap gap-2">
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
