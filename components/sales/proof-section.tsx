"use client"

import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"
import { OfferingArt } from "@/components/sales/offering-art"

type Offering = (typeof salesDeck.proof.offerings)[number]

/** One full-page service panel: title rail on the left, content and graphic on the right. */
function ServicePanel({ cs, index, total }: { cs: Offering; index: number; total: number }) {
  const { language } = useLanguage()
  return (
    <article className="grid min-h-[calc(100vh-4rem)] border-t border-border bg-background md:grid-cols-[minmax(220px,0.34fr)_minmax(0,0.66fr)]">
      <aside className="flex flex-col justify-between border-b border-border bg-muted/20 p-5 md:border-b-0 md:border-r md:p-8 lg:p-10">
        <div>
          <div className="mb-8 flex items-center justify-between text-xs tabular-nums text-muted-foreground md:block">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span className="md:mt-1 md:block">/ {String(total).padStart(2, "0")}</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {pickLocale(cs.tag, language)}
          </span>
          <h3 className="mt-4 max-w-sm text-3xl font-semibold leading-[1.06] tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {pickLocale(cs.title, language)}
          </h3>
        </div>
        <div className="mt-8 hidden text-sm text-muted-foreground md:block">
          {pickLocale(cs.problem, language)}
        </div>
      </aside>

      <div className="flex min-h-[620px] flex-col p-5 md:p-8 lg:p-10">
        <div className="grid gap-5 border border-border bg-border md:grid-cols-2">
          {cs.metrics.map((m, i) => (
            <div key={i} className="bg-card p-5 md:p-6">
              <p className="mb-2 text-xs text-muted-foreground">{pickLocale(m.label, language)}</p>
              <p className="text-2xl font-semibold leading-none text-primary tabular-nums md:text-3xl">
                {pickLocale(m.value, language)}
              </p>
            </div>
          ))}
        </div>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(300px,1.28fr)] lg:py-12">
          <div>
            <p className="text-xl leading-relaxed text-foreground md:text-2xl">
              {pickLocale(cs.summary, language)}
            </p>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              {pickLocale(cs.solution, language)}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {cs.stack.map((tech) => (
                <span
                  key={tech}
                  className="border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-border bg-muted/20 p-6 md:min-h-[320px] md:p-8">
            <div className="scale-[1.4] md:scale-[1.55]">
              <OfferingArt id={cs.id} />
            </div>
          </div>
        </div>

        <p className="border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">
          {pickLocale(cs.outcome, language)}
        </p>
      </div>
    </article>
  )
}

export function ProofSection() {
  const { language } = useLanguage()
  const { proof } = salesDeck

  return (
    <section id="proof" className="bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 pt-20 md:px-6 md:pt-24">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          {pickLocale(proof.title, language)}
        </h2>
        <p className="max-w-2xl text-muted-foreground">{pickLocale(proof.subtitle, language)}</p>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <div className="border border-border">
          {proof.offerings.map((cs, i) => (
            <ServicePanel key={cs.id} cs={cs} index={i} total={proof.offerings.length} />
          ))}
        </div>
      </div>
    </section>
  )
}
