"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { PROJECTS, STUDIES, type ResearchProject } from "@/lib/research"

const pick = (v: string | { en: string; zh: string }, lang: "en" | "zh") => (typeof v === "string" ? v : v[lang])

function monthLabel(month: string, lang: string) {
  const [y, m] = month.split("-").map(Number)
  if (lang === "zh") return `${y} 年 ${m} 月`
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
}

export function ResearchContent() {
  const { t, language } = useLanguage()
  const lang = language === "zh" ? "zh" : "en"
  const studies = STUDIES.filter((s) => s.public).sort((a, b) => b.month.localeCompare(a.month))
  // Only projects that have a public study get a filter chip.
  const projects = PROJECTS.filter((p) => studies.some((s) => s.project === p))
  const [filter, setFilter] = useState<ResearchProject | "all">("all")
  const shown = filter === "all" ? studies : studies.filter((s) => s.project === filter)
  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
      active ? "bg-primary text-white border-primary" : "bg-card text-foreground border-border hover:border-primary"
    }`

  return (
    <section className="pt-28 pb-20 md:pt-32 md:pb-24">
      <div className="container px-4 md:px-6 max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">{t("rs_eyebrow")}</p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">{t("rs_title")}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mb-10">{t("rs_body")}</p>

        {projects.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8" role="tablist">
            <button type="button" className={chip(filter === "all")} onClick={() => setFilter("all")}>
              {t("rs_all")}
            </button>
            {projects.map((p) => (
              <button key={p} type="button" className={chip(filter === p)} onClick={() => setFilter(p)}>
                {p}
              </button>
            ))}
          </div>
        )}

        <div className={`grid grid-cols-1 gap-6 ${shown.length >= 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"}`}>
          {shown.map((s) => (
            <a
              key={s.id}
              href={pick(s.url, lang)}
              {...(pick(s.url, lang).startsWith("/") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              className="group bg-card border border-border shadow-sm overflow-hidden flex flex-col hover:border-primary transition-colors"
            >
              {s.image && (
                // Images stay on the project's own site, so the gallery never holds a stale copy.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pick(s.image, lang)} alt="" width={1200} height={630} loading="lazy" className="w-full aspect-[1200/630] object-cover" />
              )}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                  {s.project} · {s.topic[lang]} · {monthLabel(s.month, lang)}
                </p>
                <h2 className="text-xl font-semibold text-foreground mb-2">{s.title[lang]}</h2>
                <p className="text-muted-foreground leading-relaxed flex-1">{s.finding[lang]}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:gap-2 transition-all whitespace-nowrap">
                  {t("rs_read")}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">{t("rs_more")}</p>
      </div>
    </section>
  )
}
