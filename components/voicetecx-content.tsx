"use client"

import {
  ArrowDown, ArrowRight, BookOpen, Briefcase, Check, Feather, FileAudio, FileText, Keyboard, Languages, Lock, Mic, Scale,
  Stethoscope, Subtitles, X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
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
// The winner of each chart is highlighted, whoever it is (Niko, 2026-11-28): on speed that is Apple.
type Row = { label: Key | "VoiceTecx"; value?: number; display?: string }
type Chart = { title: Key; scale: Key; max: number; unit?: string; lower?: boolean; rows: Row[] }
const SYSTEMS = (rows: [number, number, number, number, number], d: (v: number) => string): Row[] =>
  (["VoiceTecx", "vt_c_breeze", "vt_c_whisper", "vt_c_macos", "vt_c_apple_sa"] as const).map((label, i) => ({
    label, value: rows[i], display: d(rows[i]),
  }))
const CHARTS: Chart[] = [
  { title: "vt_c1_title", scale: "vt_c_scale", max: 100, rows: SYSTEMS([92.8, 92.8, 90.2, 87.2, 84.5], (v) => v.toFixed(1)) },
  { title: "vt_c2_title", scale: "vt_c_scale", max: 100, rows: SYSTEMS([89, 9, 74, 34, 70], String) },
  { title: "vt_c3_title", scale: "vt_c_scale_s", max: 2, unit: " s", lower: true, rows: SYSTEMS([1.78, 1.08, 0.73, 0.08, 0.05], (v) => v.toFixed(2)) },
]
const MODE_ROWS = (vals: (number | undefined)[], d: (v: number) => string = (v) => v.toFixed(1)): Row[] =>
  (["vt_m_std", "vt_m_words", "vt_m_speed", "vt_m_light", "vt_m_compact", "vt_m_fast"] as const).map((label, i) => ({
    label, value: vals[i], display: vals[i] === undefined ? undefined : d(vals[i]!),
  }))
// eval/results-latency-apple.md, third run: 5 long takes (31–51 s), Niko's voice, M5 on power. LiveTake is in the
// app behind a setting, off by default (NOTES-FOR-M5.md, 2026-11-27 22:15).
const LIVETAKE: Chart = {
  title: "vt_s_live_chart", scale: "vt_s_live_scale", max: 4, unit: " s", lower: true,
  rows: [
    { label: "vt_s_live_on", value: 1.38, display: "1.38" },
    { label: "vt_s_live_off", value: 3.36, display: "3.36" },
  ],
}
// Before and after, each from the app's own tests: eval/results-vocab-gate.md (h024 林雅區 → 苓雅區; agencies rule A,
// 建保署 → 健保署, in 「{誤}寄來一封信」) and Tests/DictationCoreTests/NumberStyleTests.swift (the rest, verbatim).
const BEFORE_AFTER: { kind: Key; heard: string; wrote: string; mark: string }[] = [
  { kind: "vt_s_k_district", heard: "高雄市林雅區", wrote: "高雄市苓雅區", mark: "苓雅區" },
  { kind: "vt_s_k_agency", heard: "建保署寄來一封信", wrote: "健保署寄來一封信", mark: "健保署" },
  { kind: "vt_s_k_mobile", heard: "我的電話是 0 9 1 2 3 4 5 6 7 8", wrote: "我的電話是 0912-345-678", mark: "0912-345-678" },
  { kind: "vt_s_k_landline", heard: "公司的市話是 02 23456789", wrote: "公司的市話是 (02) 2345-6789", mark: "(02) 2345-6789" },
  { kind: "vt_s_k_money", heard: "薪水大概 3 萬 5 千", wrote: "薪水大概 35,000", mark: "35,000" },
  { kind: "vt_s_k_law", heard: "依民法第一百八十四條第一項", wrote: "依民法第 184 條第 1 項", mark: "第 184 條第 1 項" },
  { kind: "vt_s_k_time", heard: "晚上 11 點 45 分起飛", wrote: "晚上 11:45 起飛", mark: "11:45" },
]
// eval/results-vocab-gate.md: list sizes, and false changes on correct text at each version ("How it got to zero").
const SCALE: { n: string; label: Key }[] = [
  { n: "368", label: "vt_s_n_districts" },
  { n: "35,798", label: "vt_s_n_roads" },
  { n: "367", label: "vt_s_n_stations" },
  { n: "117", label: "vt_s_n_agencies" },
]
const STEPS: { label: Key; values: number[] }[] = [
  { label: "vt_s_st_districts", values: [35, 2, 0] },
  { label: "vt_s_st_roads", values: [96, 4, 0] },
  { label: "vt_s_st_agencies", values: [129, 52, 1, 0] },
]
const MODES: Chart[] = [
  { title: "vt_c1_title", scale: "vt_c_scale", max: 100, rows: MODE_ROWS([92.8, 93.2]) },
  { title: "vt_c2_title", scale: "vt_c_scale", max: 100, rows: MODE_ROWS([89, 86], String) },
]
// On phones, rows of cards and charts scroll sideways instead of stacking, so the page stays short (Niko,
// 2026-11-28: "mobile is too long"); from md up they are a grid again.
const SWIPE = "flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-4 px-4 pb-3 md:mx-0 md:px-0 md:pb-0 md:overflow-visible md:grid"
const ITEM = "shrink-0 w-[85%] snap-start md:w-auto"
const FAQ: { q: Key; a: Key }[] = [
  { q: "vt_q1", a: "vt_q1_a" },
  { q: "vt_q2", a: "vt_q2_a" },
  { q: "vt_q3", a: "vt_q3_a" },
  { q: "vt_q4", a: "vt_q4_a" },
  { q: "vt_q5", a: "vt_q5_a" },
  { q: "vt_q6", a: "vt_q6_a" },
  { q: "vt_q7", a: "vt_q7_a" },
]

// Wide enough for "Best 92.8/100" and "Measuring", so every bar ends at the same place.
const VALUE_COL = "w-[6.75rem] shrink-0"

function BarChart({ title, scale, max, unit = "/100", lower, rows, children }: Chart & { children?: ReactNode }) {
  const { t } = useLanguage()
  const name = (l: Row["label"]) => (l === "VoiceTecx" ? "VoiceTecx" : t(l))
  const values = rows.flatMap((r) => (r.value === undefined ? [] : [r.value]))
  const best = lower ? Math.min(...values) : Math.max(...values)
  return (
    <figure className="border border-border p-6 m-0">
      <figcaption className="mb-5">
        <span className="block text-lg font-semibold text-foreground">{t(title)}</span>
        <span className="block text-sm text-muted-foreground">{t(scale)}</span>
      </figcaption>
      <div className="space-y-4" role="list">
        {rows.map((r) => {
          const win = r.value === best
          return (
          <div key={String(r.label)} role="listitem" title={`${name(r.label)}: ${r.display ?? t("vt_c_pending")}${r.display ? unit : ""}`}>
            {/* The name has the whole width, on one line; the value and the Best tag sit in a fixed column at the
                end of the bar, so they line up on every row and never wrap (Niko, 2026-11-28). */}
            <p className={`mb-1.5 truncate text-sm ${win ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{name(r.label)}</p>
            <div className="flex items-center gap-3">
              {/* The track is the full scale, so the gap looks as large as it is, no larger. */}
              <div className={`h-3 flex-1 rounded-r-[4px] ${r.value === undefined ? "border border-dashed border-border" : "bg-muted"}`}>
                {r.value !== undefined && (
                  <div
                    className={`h-3 rounded-r-[4px] ${win ? "bg-primary" : "bg-[#AEAEB2] dark:bg-[#636366]"}`}
                    style={{ width: `${Math.max(1, (r.value / max) * 100)}%` }}
                  />
                )}
              </div>
              <span className={`${VALUE_COL} text-right text-sm tabular-nums whitespace-nowrap ${win ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {win && <span className="mr-1.5 text-xs font-semibold uppercase tracking-wider text-primary">{t("vt_c_best")}</span>}
                {r.display ? r.display + unit : t("vt_c_pending")}
              </span>
            </div>
          </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-3 text-xs text-muted-foreground tabular-nums" aria-hidden="true">
        <div className="flex flex-1 justify-between">
          <span>0</span>
          <span>{max / 2}</span>
          <span>{max}</span>
        </div>
        <span className={VALUE_COL} />
      </div>
      {children}
    </figure>
  )
}

function Cards({ items }: { items: typeof FEATURES }) {
  const { t } = useLanguage()
  return (
    <div className={`${SWIPE} md:grid-cols-2 lg:grid-cols-3 md:gap-6`}>
      {items.map(({ icon: Icon, title, body }) => (
        <article key={title} className={`${ITEM} bg-card border border-border shadow-sm p-6`}>
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
    <section className="py-14 md:py-24 scroll-mt-20" id="results">
        <div className="container px-4 md:px-6 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3">{t("vt_num_title")}</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-3xl">{t("vt_num_lead")}</p>
          <div className={`${SWIPE} md:grid-cols-3 md:gap-6`}>
            {CHARTS.map((c) => (
              <div key={c.title} className={ITEM}>
                <BarChart {...c} />
              </div>
            ))}
          </div>
          <h3 className="mt-12 md:mt-16 text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-3">{t("vt_modes_title")}</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl">{t("vt_modes_lead")}</p>
          <div className={`${SWIPE} md:grid-cols-2 md:gap-6`}>
            {MODES.map((c) => (
              <div key={"m" + c.title} className={ITEM}>
                <BarChart {...c} />
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground max-w-3xl">{t("vt_num_note")}</p>
        </div>
      </section>
  )
}

/** One before/after card: what the engines heard, struck through, and what VoiceTecx writes, the change in colour. */
function BeforeAfter({ kind, heard, wrote, mark }: (typeof BEFORE_AFTER)[number]) {
  const { t } = useLanguage()
  const [pre, post] = wrote.split(mark)
  return (
    <article className="w-full bg-card border border-border shadow-sm p-5 flex flex-col">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">{t(kind)}</p>
      <p className="text-xs text-muted-foreground mb-1">{t("vt_s_heard")}</p>
      <p className="text-base text-muted-foreground line-through decoration-[#AEAEB2] break-words">{heard}</p>
      <ArrowDown className="h-4 w-4 text-muted-foreground my-2" aria-hidden="true" />
      <p className="text-xs text-muted-foreground mb-1">{t("vt_s_wrote")}</p>
      <p className="text-lg font-semibold text-foreground break-words">
        {pre}
        <span className="text-primary whitespace-nowrap">{mark}</span>
        {post}
      </p>
    </article>
  )
}

/** False changes on correct text at each version of a list's rules: a small column chart that ends at 0. */
function Steps({ label, values }: (typeof STEPS)[number]) {
  const { t } = useLanguage()
  const top = 129
  return (
    <div>
      <p className="text-sm font-semibold text-foreground mb-3">{t(label)}</p>
      <div className="flex items-end gap-2 h-24" role="list">
        {values.map((v, i) => {
          const last = i === values.length - 1
          return (
            <div key={i} role="listitem" className="flex flex-col items-center justify-end h-full flex-1 max-w-12">
              <span className={`text-xs tabular-nums mb-1 ${last ? "font-semibold text-primary" : "text-muted-foreground"}`}>{v}</span>
              {last ? (
                <span className="h-1 w-full bg-primary" />
              ) : (
                <span className="w-full bg-[#AEAEB2] dark:bg-[#636366]" style={{ height: `${Math.max(4, (v / top) * 64)}px` }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** A schematic of a long dictation: LiveTake writes each part at a pause; the whole take waits for the end. */
function LiveTakeTimeline() {
  const { t } = useLanguage()
  const parts = [
    [0, 22],
    [26, 44],
    [48, 62],
    [66, 78],
  ]
  const row = "relative h-5 w-full bg-muted"
  return (
    <div className="mt-6 space-y-3 text-xs text-muted-foreground" aria-hidden="true">
      <div>
        <p className="mb-1">{t("vt_s_live_speak")}</p>
        <div className={row}>
          {parts.map(([a, b]) => (
            <span key={a} className="absolute inset-y-0 bg-[#AEAEB2] dark:bg-[#636366]" style={{ left: `${a}%`, width: `${b - a}%` }} />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1 flex justify-between gap-3"><span>{t("vt_s_live_on")}</span><span className="font-semibold text-primary tabular-nums whitespace-nowrap">{t("vt_s_live_wait")} 1.38 s</span></p>
        <div className={row}>
          {parts.slice(0, 3).map(([, b]) => (
            <span key={b} className="absolute inset-y-1 bg-primary/40" style={{ left: `${b}%`, width: "4%" }} />
          ))}
          <span className="absolute inset-y-0 bg-primary" style={{ left: "78%", width: "6.2%" }} />
        </div>
      </div>
      <div>
        <p className="mb-1 flex justify-between gap-3"><span>{t("vt_s_live_off")}</span><span className="text-foreground tabular-nums whitespace-nowrap">{t("vt_s_live_wait")} 3.36 s</span></p>
        <div className={row}>
          <span className="absolute inset-y-0 bg-[#AEAEB2] dark:bg-[#636366]" style={{ left: "78%", width: "15%" }} />
        </div>
      </div>
    </div>
  )
}

/** Where VoiceTecx is clearly better (Niko, 2026-11-28): shown as cards, numbers and small diagrams. */
function VoiceTecxStrengths() {
  const { t } = useLanguage()
  return (
    <section className="py-14 md:py-24 scroll-mt-20" id="taiwan">
      <div className="container px-4 md:px-6 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3">{t("vt_s_title")}</h2>
        <p className="text-lg text-muted-foreground mb-8 md:mb-12 max-w-3xl">{t("vt_s_lead")}</p>

        <h3 className="text-2xl font-semibold tracking-tight text-foreground mb-6">{t("vt_s_ba_title")}</h3>
        <div className={`${SWIPE} items-start md:items-stretch md:grid-cols-2 lg:grid-cols-4`}>
          {BEFORE_AFTER.map((b) => (
            <div key={b.kind} className={`${ITEM} !w-[70%] md:!w-auto flex`}>
              <BeforeAfter {...b} />
            </div>
          ))}
          <article className={`${ITEM} !w-[70%] md:!w-auto bg-primary text-white p-5 flex flex-col justify-center`}>
            <p className="text-5xl font-semibold tracking-tight tabular-nums">0</p>
            <p className="text-lg font-semibold mb-2">{t("vt_s_zero_t")}</p>
            <p className="text-sm leading-relaxed text-white/85">{t("vt_s_zero_d")}</p>
          </article>
        </div>

        <h3 className="mt-12 md:mt-16 text-2xl font-semibold tracking-tight text-foreground mb-2">{t("vt_s_scale_title")}</h3>
        <p className="text-muted-foreground mb-6 max-w-3xl">{t("vt_s_scale_lead")}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SCALE.map(({ n, label }) => (
            <div key={label} className="border-t-2 border-primary pt-4">
              <p className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground tabular-nums">{n}</p>
              <p className="text-sm text-muted-foreground mt-1">{t(label)}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-6">
          <figure className="border border-border p-6 m-0">
            <p className="text-5xl font-semibold tracking-tight text-primary tabular-nums">99 %</p>
            <p className="text-lg font-semibold text-foreground mt-1 mb-2">{t("vt_s_fix_t")}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("vt_s_fix_d")}</p>
          </figure>
          <figure className="border border-border p-6 m-0">
            <figcaption className="mb-5">
              <span className="block text-lg font-semibold text-foreground">{t("vt_s_steps_title")}</span>
              <span className="block text-sm text-muted-foreground">{t("vt_s_steps_lead")}</span>
            </figcaption>
            <div className="grid grid-cols-3 gap-6">
              {STEPS.map((s) => (
                <Steps key={s.label} {...s} />
              ))}
            </div>
          </figure>
        </div>

        <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground mb-2">{t("vt_s_live_title")}</h3>
            <p className="text-muted-foreground mb-6">{t("vt_s_live_lead")}</p>
            <BarChart {...LIVETAKE}>
              <div className="hidden sm:block">
                <LiveTakeTimeline />
              </div>
              <p className="mt-6 text-xs text-muted-foreground leading-relaxed">{t("vt_s_live_note")}</p>
            </BarChart>
          </div>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground mb-2">{t("vt_s_file_title")}</h3>
            <p className="text-muted-foreground mb-6">{t("vt_s_file_lead")}</p>
            <figure className="border border-border p-6 m-0">
              <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-3">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{t("vt_s_file_in")}</p>
                  {["mp3", "wav", "m4a", "mp4"].map((x) => (
                    <div key={x} className="flex items-center gap-2 border border-border bg-card px-3 py-1.5 text-sm text-foreground">
                      <FileAudio className="h-4 w-4 text-muted-foreground" aria-hidden="true" />.{x}
                    </div>
                  ))}
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[22.5%] bg-[#141414] shadow-sm overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/products/voicetecx-mark.svg" alt="VoiceTecx" className="block w-full h-full" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <div className="space-y-2">
                  <div className="border border-primary bg-card px-3 py-2">
                    <FileText className="h-4 w-4 text-primary mb-1" aria-hidden="true" />
                    <p className="text-sm font-semibold text-foreground">.txt</p>
                    <p className="text-xs text-muted-foreground">{t("vt_s_file_out_txt")}</p>
                  </div>
                  <div className="border border-primary bg-card px-3 py-2">
                    <Subtitles className="h-4 w-4 text-primary mb-1" aria-hidden="true" />
                    <p className="text-sm font-semibold text-foreground">.srt</p>
                    <p className="text-xs text-muted-foreground">{t("vt_s_file_out_srt")}</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 border-t border-border pt-5">
                <p className="text-sm font-semibold text-foreground mb-3">{t("vt_s_file_cap")}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">VoiceTecx</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      <Check className="h-4 w-4" aria-hidden="true" />{t("vt_s_yes")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("vt_c_macos")}</span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <X className="h-4 w-4" aria-hidden="true" />{t("vt_s_no")}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-xs text-muted-foreground leading-relaxed">{t("vt_s_file_note")}</p>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}

export function VoiceTecxContent() {
  const { t } = useLanguage()
  return (
    <>
      <VoiceTecxStrengths />

      {/* TODO(Niko): a 15-second screen recording here (dictating mixed Mandarin and English into LINE, Notes, Mail). */}


      <section className="bg-muted py-14 md:py-24">
        <div className="container px-4 md:px-6 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-10">{t("vt_feat_title")}</h2>
          <Cards items={FEATURES} />
        </div>
      </section>

      <section className="py-14 md:py-24">
        <div className="container px-4 md:px-6 max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-10">{t("vt_aud_title")}</h2>
          <div className={`${SWIPE} md:grid-cols-2 lg:grid-cols-4 md:gap-6`}>
            {AUDIENCE.map(({ icon: Icon, title, body }) => (
              <article key={title} className={`${ITEM} border-t-2 border-primary pt-5`}>
                <Icon className="h-6 w-6 text-primary mb-3" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{t(title)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(body)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-14 md:py-24" id="pricing">
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

      <section className="py-14 md:py-24">
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
