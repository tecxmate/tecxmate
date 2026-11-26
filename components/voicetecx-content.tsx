"use client"

import { BookOpen, Keyboard, Languages, Lock, Mic, Subtitles } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import ShaderBackground from "@/components/shader-background"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

type T = ReturnType<typeof useLanguage>["t"]
type Key = Parameters<T>[0]

// Every claim here comes from the voicetecx repo (README.md, FINDINGS.md) as of 2026-11-26.
const FEATURES: { icon: LucideIcon; title: Key; body: Key }[] = [
  { icon: Keyboard, title: "vt_f1_t", body: "vt_f1_d" },
  { icon: Mic, title: "vt_f2_t", body: "vt_f2_d" },
  { icon: Languages, title: "vt_f3_t", body: "vt_f3_d" },
  { icon: BookOpen, title: "vt_f4_t", body: "vt_f4_d" },
  { icon: Subtitles, title: "vt_f5_t", body: "vt_f5_d" },
  { icon: Lock, title: "vt_f6_t", body: "vt_f6_d" },
]
const NUMBERS: { figure: string; text: Key }[] = [
  { figure: "26%", text: "vt_n1" },
  { figure: "84", text: "vt_n2" },
  { figure: "0.75 s", text: "vt_n3" },
]

export function VoiceTecxContent() {
  const { t } = useLanguage()
  return (
    <>
      <ShaderBackground>
        <div className="absolute inset-0 flex flex-col items-start justify-center px-8 pt-20 pb-24 z-10">
          <div className="max-w-xl text-left">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">VoiceTecx</p>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-6"
              suppressHydrationWarning
            >
              {t("vt_title")}
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">{t("vt_body")}</p>
            <p className="text-sm font-medium text-muted-foreground mb-8">{t("vt_status")}</p>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white text-base px-8 py-6 rounded-full shadow-lg whitespace-nowrap"
              asChild
            >
              <a href="/quote?product=voicetecx">{t("vt_cta")}</a>
            </Button>
          </div>
        </div>
      </ShaderBackground>

      <section className="bg-muted py-20 md:py-24">
        <div className="container px-4 md:px-6 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-10">{t("vt_feat_title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <article key={title} className="bg-card border border-border shadow-sm p-6">
                <Icon className="h-6 w-6 text-primary mb-4" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{t(title)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(body)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container px-4 md:px-6 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-10">{t("vt_num_title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {NUMBERS.map(({ figure, text }) => (
              <div key={text} className="border border-border p-6">
                <p className="text-5xl font-semibold tracking-tight text-primary mb-3">{figure}</p>
                <p className="text-foreground leading-relaxed">{t(text)}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground max-w-3xl">{t("vt_num_note")}</p>
        </div>
      </section>
    </>
  )
}
