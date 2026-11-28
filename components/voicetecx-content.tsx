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
// tecxmate/voicetecx eval/results-latency-apple.md and eval/results-apple-niko.md: the same 25 Taiwan Mandarin
// recordings (one speaker) through every system on one M5 MacBook Pro. MediaTek and OpenAI are the original models
// run with whisper.cpp; Apple's are macOS 26's on-device dictation and SpeechAnalyzer. No sound-alike pairs made from
// these recordings (not flattered). Bars start at 0. pending = a mode still being measured on the same recordings.
type Row = { label: Key | "VoiceTecx"; value?: number; display?: string; ours?: boolean }
type Chart = { title: Key; scale: Key; max: number; unit?: string; rows: Row[] }
const SYSTEMS = (rows: [number, number, number, number, number], d: (v: number) => string): Row[] =>
  (["VoiceTecx", "vt_c_breeze", "vt_c_whisper", "vt_c_macos", "vt_c_apple_sa"] as const).map((label, i) => ({
    label, value: rows[i], display: d(rows[i]), ours: i === 0,
  }))
const CHARTS: Chart[] = [
  { title: "vt_c1_title", scale: "vt_c_scale", max: 100, rows: SYSTEMS([92.8, 92.8, 90.2, 87.2, 84.5], (v) => v.toFixed(1)) },
  { title: "vt_c2_title", scale: "vt_c_scale", max: 100, rows: SYSTEMS([89, 9, 74, 34, 70], String) },
  { title: "vt_c3_title", scale: "vt_c_scale_s", max: 2, unit: " s", rows: SYSTEMS([1.78, 1.08, 0.73, 0.08, 0.05], (v) => v.toFixed(2)) },
]
const MODE_ROWS = (vals: (number | undefined)[], d: (v: number) => string = (v) => v.toFixed(1)): Row[] =>
  (["vt_m_std", "vt_m_words", "vt_m_speed", "vt_m_light", "vt_m_compact", "vt_m_fast"] as const).map((label, i) => ({
    label, value: vals[i], display: vals[i] === undefined ? undefined : d(vals[i]!), ours: i === 0,
  }))
const MODES: Chart[] = [
  { title: "vt_c1_title", scale: "vt_c_scale", max: 100, rows: MODE_ROWS([92.8, 93.2]) },
  { title: "vt_c2_title", scale: "vt_c_scale", max: 100, rows: MODE_ROWS([89, 86], String) },
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

function BarChart({ title, scale, max, unit = "/100", rows }: Chart) {
  const { t } = useLanguage()
  const name = (l: Row["label"]) => (l === "VoiceTecx" ? "VoiceTecx" : t(l))
  return (
    <figure className="border border-border p-6 m-0">
      <figcaption className="mb-5">
        <span className="block text-lg font-semibold text-foreground">{t(title)}</span>
        <span className="block text-sm text-muted-foreground">{t(scale)}</span>
      </figcaption>
      <div className="space-y-4" role="list">
        {rows.map((r) => (
          <div key={String(r.label)} role="listitem" title={`${name(r.label)}: ${r.display ?? t("vt_c_pending")}${r.display ? unit : ""}`}>
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <span className={`text-sm ${r.ours ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{name(r.label)}</span>
              <span className={`text-sm tabular-nums whitespace-nowrap ${r.ours ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {r.display ? r.display + unit : t("vt_c_pending")}
              </span>
            </div>
            {/* The track is the full scale, so the gap looks as large as it is, no larger. */}
            <div className={`h-3 w-full rounded-r-[4px] ${r.value === undefined ? "border border-dashed border-border" : "bg-muted"}`}>
              {r.value !== undefined && (
                <div
                  className={`h-3 rounded-r-[4px] ${r.ours ? "bg-primary" : "bg-[#AEAEB2] dark:bg-[#636366]"}`}
                  style={{ width: `${Math.max(1, (r.value / max) * 100)}%` }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums" aria-hidden="true">
        <span>0</span>
        <span>{max / 2}</span>
        <span>{max}</span>
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
          </div>
          <h3 className="mt-16 text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-3">{t("vt_modes_title")}</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl">{t("vt_modes_lead")}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MODES.map((c) => (
              <BarChart key={"m" + c.title} {...c} />
            ))}
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
