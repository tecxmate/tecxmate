"use client"

import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"
import { OfferingArt } from "@/components/sales/offering-art"

type Offering = (typeof salesDeck.proof.offerings)[number]

/** One service as its own full-height page — big editorial layout, alternating sides. */
function ServiceSection({ cs, index }: { cs: Offering; index: number }) {
  const { language } = useLanguage()
  const flip = index % 2 === 1
  return (
    <div className="flex items-center py-12 md:py-0 md:min-h-[627px]">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-20 items-center">
          {/* Text */}
          <div className={flip ? "lg:order-2" : ""}>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {pickLocale(cs.tag, language)}
            </span>
            <h3 className="mt-4 text-3xl md:text-4xl xl:text-5xl font-semibold leading-[1.1] tracking-tight text-foreground max-w-xl">
              {pickLocale(cs.title, language)}
            </h3>
            <p className="mt-5 text-lg xl:text-xl text-muted-foreground leading-relaxed max-w-lg">
              {pickLocale(cs.summary, language)}
            </p>
            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              {cs.metrics.map((m, i) => (
                <div key={i}>
                  <p className="text-xs text-muted-foreground mb-1.5">{pickLocale(m.label, language)}</p>
                  <p className="text-2xl md:text-3xl font-semibold text-primary tabular-nums leading-none">
                    {pickLocale(m.value, language)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
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

          {/* Illustration — no frame, sized to fill its half of the page */}
          <div
            className={`flex items-center justify-center min-h-[240px] lg:min-h-[340px] ${flip ? "lg:order-1" : ""}`}
          >
            <div className="scale-[1.5] sm:scale-[1.9] lg:scale-[2.1] xl:scale-[2.35]">
              <OfferingArt id={cs.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProofSection() {
  const { language } = useLanguage()
  const { proof } = salesDeck

  return (
    <section id="proof" className="bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl pt-20 md:pt-24">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-3">
          {pickLocale(proof.title, language)}
        </h2>
        <p className="text-muted-foreground max-w-2xl">{pickLocale(proof.subtitle, language)}</p>
      </div>

      {proof.offerings.map((cs, i) => (
        <ServiceSection key={cs.id} cs={cs} index={i} />
      ))}

      <div className="h-8" />
    </section>
  )
}
