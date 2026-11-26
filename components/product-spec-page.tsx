"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { ProductWordmark } from "@/components/brand/product-wordmark"
import type { Bi, ProductSpec } from "@/lib/product-specs"

/** A product page in the spec-sheet layout. Chinese for zh readers, English for everyone else. */
export function ProductSpecPage({ spec }: { spec: ProductSpec }) {
  const { language } = useLanguage()
  const lang = language === "zh" ? "zh" : "en"
  const tx = (v: Bi) => v[lang]
  const ext = (href: string) => (href.startsWith("/") ? {} : { target: "_blank", rel: "noopener noreferrer" })
  const [open, setOpen] = useState<boolean[]>(() => spec.groups.map((_, i) => i === 0))
  const allOpen = open.every(Boolean)
  const L = lang === "zh"
    ? { products: "產品", specs: "規格", expand: "全部展開", collapse: "全部收合" }
    : { products: "Products", specs: "Specifications", expand: "Expand all", collapse: "Collapse all" }

  return (
    <div className="container px-4 md:px-6 max-w-6xl pt-6 pb-20 md:pt-10 md:pb-24">
      <p className="text-sm text-muted-foreground mb-6">
        <a href="/#products" className="hover:underline">{L.products}</a> › <span className="font-semibold text-foreground">{spec.name}</span>
      </p>

      <section className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-8 md:gap-14 items-center pb-12">
        <div className="relative aspect-square w-full max-w-[240px] md:max-w-none bg-[#1d1d1f] dark:bg-[#1c1c1e] border border-[#3a3a3c] grid place-items-center overflow-hidden">
          <div className="absolute inset-[9%] border border-[#3a3a3c]" aria-hidden="true" />
          <div className="relative w-full px-[16%] text-center">
            <ProductWordmark name={spec.name} className="block w-full h-auto text-white" />
            <p className="mt-3 text-xs md:text-sm uppercase tracking-[0.12em] text-[#a1a1a6]">{tx(spec.sub)}</p>
          </div>
          <div className="absolute left-[9%] right-[9%] bottom-[4%] flex justify-between" aria-hidden="true">
            {Array.from({ length: 14 }, (_, i) => (
              <span key={i} className="w-[3px] h-2.5 bg-[#3a3a3c]" />
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="mb-4 text-4xl md:text-5xl">
            <ProductWordmark name={spec.name} className="block h-[0.78em] w-auto max-w-full text-foreground" />
            <span className="sr-only">{spec.name}</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground max-w-[34em] mb-5">{tx(spec.line)}</p>
          {spec.statusLink ? (
            <a href={spec.statusLink.href} {...ext(spec.statusLink.href)} className="text-base md:text-lg font-semibold text-primary hover:underline">
              {tx(spec.status)}
              {spec.statusLink.joiner === "at" ? (lang === "zh" ? "：" : " at ") : " · "}
              {tx(spec.statusLink.label)} ›
            </a>
          ) : (
            <p className="text-base md:text-lg font-semibold text-primary">{tx(spec.status)}</p>
          )}
          <div className="mt-7 flex flex-wrap gap-2.5">
            {spec.ctas.map((c) => (
              <a
                key={c.href + c.label.en}
                href={c.href}
                {...ext(c.href)}
                className={
                  c.primary
                    ? "whitespace-nowrap px-6 py-3.5 font-semibold border-[1.5px] border-primary bg-primary text-white hover:bg-[#6b3fcc] hover:border-[#6b3fcc] transition-colors"
                    : "whitespace-nowrap px-6 py-3.5 font-semibold border-[1.5px] border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
                }
              >
                {tx(c.label)}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-6 md:gap-14">
        <aside>
          <h2 className="text-2xl font-semibold text-foreground mb-2">{L.specs}</h2>
          <p className="text-sm text-muted-foreground">{tx(spec.summary)}</p>
        </aside>
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => setOpen(spec.groups.map(() => !allOpen))}
            className="mb-4 px-3 py-2 text-sm font-semibold border border-foreground text-foreground"
          >
            {allOpen ? L.collapse : L.expand}
          </button>
          <div className="border-b border-border">
            {spec.groups.map((g, i) => (
              <div key={g.title.en} className="border-t border-border">
                <button
                  type="button"
                  aria-expanded={open[i]}
                  onClick={() => setOpen(open.map((v, j) => (j === i ? !v : v)))}
                  className="w-full flex items-center justify-between py-5 text-left text-lg md:text-xl font-semibold text-foreground"
                >
                  {tx(g.title)}
                  <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open[i] ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
                {open[i] && (
                  <div className="pb-5">
                    <dl className="grid grid-cols-1 sm:grid-cols-[2fr_3fr] sm:gap-x-6">
                      {g.rows.map(([k, v], r) => (
                        <div key={k.en} className={`contents`}>
                          <dt className={`pt-3 sm:py-3 text-[15px] text-muted-foreground ${r ? "border-t border-border" : ""}`}>{tx(k)}</dt>
                          <dd className={`pb-3 sm:py-3 text-[15px] text-foreground tabular-nums min-w-0 ${r ? "sm:border-t sm:border-border" : ""}`}>{tx(v)}</dd>
                        </div>
                      ))}
                    </dl>
                    {g.note && <p className="text-sm text-muted-foreground mt-1">{tx(g.note)}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
