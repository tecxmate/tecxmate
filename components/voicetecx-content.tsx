"use client"

import { Briefcase, Feather, Keyboard, Languages, Lock, Mic, Scale, Stethoscope, Subtitles, BookOpen } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useLanguage } from "@/components/language-provider"

type T = ReturnType<typeof useLanguage>["t"]
type Key = Parameters<T>[0]

// Every claim here comes from the voicetecx repo (README.md, FINDINGS.md, eval/) as of 2026-11-26.
// The page sells the result, not the parts: model names appear only in the FAQ's credits (Niko: users see the
// language, not the model; the licences require the credit somewhere).
const FEATURES: { icon: LucideIcon; title: Key; body: Key }[] = [
  { icon: Keyboard, title: "vt_f1_t", body: "vt_f1_d" },
  { icon: Mic, title: "vt_f2_t", body: "vt_f2_d" },
  { icon: Languages, title: "vt_f3_t", body: "vt_f3_d" },
  { icon: BookOpen, title: "vt_f4_t", body: "vt_f4_d" },
  { icon: Subtitles, title: "vt_f5_t", body: "vt_f5_d" },
  { icon: Lock, title: "vt_f6_t", body: "vt_f6_d" },
]
const AUDIENCE: { icon: LucideIcon; title: Key; body: Key }[] = [
  { icon: Scale, title: "vt_a1_t", body: "vt_a1_d" },
  { icon: Stethoscope, title: "vt_a2_t", body: "vt_a2_d" },
  { icon: Briefcase, title: "vt_a3_t", body: "vt_a3_d" },
  { icon: Feather, title: "vt_a4_t", body: "vt_a4_d" },
]
// tecxmate/voicetecx eval/results-apple-niko.md (4282fd9): the same 30 recordings, VoiceTecx against macOS's own
// dictation (DictationTranscriber, macOS 26.6, on-device). VoiceTecx without the sound-alike pairs made from these
// recordings, so it is not flattered. Bars start at 0.
const CHARTS: { title: Key; rows: { label: Key | "VoiceTecx"; value: number; display: string; ours?: boolean }[] }[] = [
  {
    title: "vt_c1_title",
    rows: [
      { label: "VoiceTecx", value: 92.8, display: "~93", ours: true },
      { label: "vt_c_macos", value: 87.1, display: "~87" },
    ],
  },
  {
    title: "vt_c2_title",
    rows: [
      { label: "VoiceTecx", value: 84, display: "84", ours: true },
      { label: "vt_c_macos", value: 32, display: "32" },
    ],
  },
]
const FAQ: { q: Key; a: Key }[] = [
  { q: "vt_q1", a: "vt_q1_a" },
  { q: "vt_q2", a: "vt_q2_a" },
  { q: "vt_q3", a: "vt_q3_a" },
  { q: "vt_q4", a: "vt_q4_a" },
  { q: "vt_q5", a: "vt_q5_a" },
  { q: "vt_q6", a: "vt_q6_a" },
  { q: "vt_q7", a: "vt_q7_a" },
]

function BarChart({ title, rows }: (typeof CHARTS)[number]) {
  const { t } = useLanguage()
  const name = (l: Key | "VoiceTecx") => (l === "VoiceTecx" ? "VoiceTecx" : t(l))
  return (
    <figure className="border border-border p-6 m-0">
      <figcaption className="mb-5">
        <span className="block text-lg font-semibold text-foreground">{t(title)}</span>
        <span className="block text-sm text-muted-foreground">{t("vt_c_scale")}</span>
      </figcaption>
      <div className="space-y-4" role="list">
        {rows.map((r) => (
          <div key={r.display + r.label} role="listitem" title={`${name(r.label)}: ${r.display}/100`}>
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <span className={`text-sm ${r.ours ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{name(r.label)}</span>
              <span className={`text-sm tabular-nums ${r.ours ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{r.display}/100</span>
            </div>
            {/* The track is the full 0–100 scale, so the gap looks as large as it is, no larger. */}
            <div className="h-3 w-full bg-muted rounded-r-[4px]">
              <div
                className={`h-3 rounded-r-[4px] ${r.ours ? "bg-primary" : "bg-[#AEAEB2] dark:bg-[#636366]"}`}
                style={{ width: `${r.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums" aria-hidden="true">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </figure>
  )
}

function Cards({ items }: { items: typeof FEATURES }) {
  const { t } = useLanguage()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(({ icon: Icon, title, body }) => (
        <article key={title} className="bg-card border border-border shadow-sm p-6">
          <Icon className="h-6 w-6 text-primary mb-4" strokeWidth={1.75} aria-hidden="true" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t(title)}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{t(body)}</p>
        </article>
      ))}
    </div>
  )
}

/** The test results against macOS dictation: shown right after the spec sheet's hero (Niko, 2026-11-26). */
export function VoiceTecxResults() {
  const { t } = useLanguage()
  return (
    <section className="py-20 md:py-24 scroll-mt-20" id="results">
        <div className="container px-4 md:px-6 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3">{t("vt_num_title")}</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-3xl">{t("vt_num_lead")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CHARTS.map((c) => (
              <BarChart key={c.title} {...c} />
            ))}
            <div className="border border-border p-6">
              <p className="text-lg font-semibold text-foreground mb-5">{t("vt_n3_title")}</p>
              <p className="text-5xl font-semibold tracking-tight text-primary mb-2 whitespace-nowrap">
                ~0.75<span className="text-2xl font-medium text-muted-foreground"> s</span>
              </p>
              <p className="text-foreground mb-3">{t("vt_n3")}</p>
              <p className="text-sm text-muted-foreground border-t border-border pt-3">{t("vt_n3_cmp")}</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground max-w-3xl">{t("vt_num_note")}</p>
        </div>
      </section>
  )
}

export function VoiceTecxContent() {
  const { t } = useLanguage()
  return (
    <>

      {/* TODO(Niko): a 15-second screen recording here (dictating mixed Mandarin and English into LINE, Notes, Mail). */}


      <section className="bg-muted py-20 md:py-24">
        <div className="container px-4 md:px-6 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-10">{t("vt_feat_title")}</h2>
          <Cards items={FEATURES} />
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container px-4 md:px-6 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-10">{t("vt_aud_title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AUDIENCE.map(({ icon: Icon, title, body }) => (
              <article key={title} className="border-t-2 border-primary pt-5">
                <Icon className="h-6 w-6 text-primary mb-3" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{t(title)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(body)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-20 md:py-24" id="pricing">
        <div className="container px-4 md:px-6 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3">{t("vt_price_title")}</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-3xl">{t("vt_price_lead")}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <article className="bg-card border-2 border-primary shadow-sm p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">{t("vt_p1_name")}</p>
              <p className="text-4xl font-semibold tracking-tight text-foreground mb-1">
                NT$1,490<span className="text-base font-medium text-muted-foreground"> {t("vt_p_once")}</span>
              </p>
              <p className="text-sm font-medium text-primary mb-5">{t("vt_p1_early")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("vt_p1_d")}</p>
            </article>
            <article className="bg-card border border-border shadow-sm p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t("vt_p2_name")}</p>
              <p className="text-4xl font-semibold tracking-tight text-foreground mb-1">
                NT$2,990<span className="text-base font-medium text-muted-foreground"> {t("vt_p_seat")}</span>
              </p>
              <p className="text-sm font-medium text-muted-foreground mb-5">{t("vt_p2_inv")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("vt_p2_d")}</p>
            </article>
          </div>
          <p className="mt-6 text-sm font-medium text-foreground max-w-3xl">{t("vt_req")}</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-3xl">{t("vt_price_cmp")}</p>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container px-4 md:px-6 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-8">{t("vt_faq_title")}</h2>
          <Accordion type="single" collapsible>
            {FAQ.map(({ q, a }) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="text-left text-base">{t(q)}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{t(a)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  )
}
