"use client"

import { ArrowRight, Bot, CalendarCheck, ClipboardList, FileSignature, KanbanSquare, ShieldCheck } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import ShaderBackground from "@/components/shader-background"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

type T = ReturnType<typeof useLanguage>["t"]
type Key = Parameters<T>[0]

// TECXWORK lives at its own address; these are its public pages.
const TECXWORK_URL = "https://work.tecxmate.com"
const HOW_IT_WORKS_URL = `${TECXWORK_URL}/how-it-works`
const CAREERS_EMAIL = "mailto:official@tecxmate.com?subject=Careers%20at%20TECXMATE"

// Every claim here is checked against the tecxwork repo and its public /how-it-works page.
const FEATURES: { icon: LucideIcon; title: Key; body: Key }[] = [
  { icon: ClipboardList, title: "tw_f1_t", body: "tw_f1_d" },
  { icon: KanbanSquare, title: "tw_f2_t", body: "tw_f2_d" },
  { icon: CalendarCheck, title: "tw_f3_t", body: "tw_f3_d" },
  { icon: FileSignature, title: "tw_f4_t", body: "tw_f4_d" },
  { icon: Bot, title: "tw_f5_t", body: "tw_f5_d" },
  { icon: ShieldCheck, title: "tw_f6_t", body: "tw_f6_d" },
]

export function CareersContent() {
  const { t } = useLanguage()
  return (
    <>
      <ShaderBackground>
        <div className="absolute inset-0 flex flex-col items-start justify-center px-8 pt-20 pb-24 z-10">
          <div className="max-w-xl text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">{t("cr_eyebrow")}</p>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-6"
              suppressHydrationWarning
            >
              {t("cr_title")}
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">{t("cr_body")}</p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white text-base px-8 py-6 rounded-full shadow-lg whitespace-nowrap"
                asChild
              >
                <a href={CAREERS_EMAIL}>{t("cr_cta_cv")}</a>
              </Button>
            </div>
          </div>
        </div>
      </ShaderBackground>

      <section id="tecxwork" className="bg-muted py-20 md:py-24 scroll-mt-16">
        <div className="container px-4 md:px-6 max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">{t("tw_eyebrow")}</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">{t("tw_title")}</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mb-12">{t("tw_body")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <article key={title} className="bg-card border border-border shadow-sm p-6">
                <Icon className="h-6 w-6 text-primary mb-4" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{t(title)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(body)}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-muted-foreground">{t("tw_stack")}</p>
            <a
              href={HOW_IT_WORKS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all whitespace-nowrap"
            >
              {t("tw_cta")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
