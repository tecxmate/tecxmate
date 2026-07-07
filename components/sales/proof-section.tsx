"use client"

import { ArrowUpRight } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"
import { OfferingArt } from "@/components/sales/offering-art"

type Offering = (typeof salesDeck.proof.offerings)[number]

/** One service card following the squared Tecxmate design-system language. */
function ServiceCard({ cs, index }: { cs: Offering; index: number }) {
  const { language } = useLanguage()
  return (
    <article className="group flex min-h-[460px] flex-col border border-border bg-card/70 transition-[border-color,box-shadow,background-color] duration-300 hover:border-primary/35 hover:bg-card hover:shadow-[0_0_40px_rgba(139,92,246,0.12)]">
      <div className="flex items-center justify-between border-b border-border px-5 py-4 md:px-6">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {pickLocale(cs.tag, language)}
        </span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="flex h-36 shrink-0 items-center justify-center overflow-hidden border-b border-border bg-muted/30">
        <div className="scale-[1.45] transition-transform duration-300 group-hover:scale-[1.55]">
          <OfferingArt id={cs.id} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-start gap-4">
          <h3 className="text-xl font-semibold leading-tight tracking-tight text-foreground md:text-2xl">
            {pickLocale(cs.title, language)}
          </h3>
          <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
          {pickLocale(cs.summary, language)}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-px border border-border bg-border">
          {cs.metrics.map((m, i) => (
            <div key={i} className="bg-background/95 p-3">
              <p className="mb-1 text-[11px] text-muted-foreground">{pickLocale(m.label, language)}</p>
              <p className="text-lg font-semibold leading-none text-primary tabular-nums">
                {pickLocale(m.value, language)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {cs.stack.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export function ProofSection() {
  const { language } = useLanguage()
  const { proof } = salesDeck

  return (
    <section id="proof" className="bg-muted/30 py-20 md:py-24">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 max-w-3xl md:mb-12">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {pickLocale(proof.title, language)}
          </h2>
          <p className="text-muted-foreground">{pickLocale(proof.subtitle, language)}</p>
        </div>

        <div className="grid grid-cols-1 border border-border bg-border md:grid-cols-2">
          {proof.offerings.map((cs, i) => (
            <ServiceCard key={cs.id} cs={cs} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
