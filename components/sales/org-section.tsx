"use client"

import { Clock, Database, DollarSign, Users } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { salesDeck, pickLocale } from "@/lib/sales-deck"

// Percentage positions of the burden pills inside the narrow in-house panel.
const BURDEN_POS = [
  { x: 30, y: 32 },
  { x: 70, y: 32 },
  { x: 28, y: 54 },
  { x: 72, y: 54 },
  { x: 30, y: 76 },
  { x: 70, y: 76 },
  { x: 50, y: 93 },
]

export function OrgSection() {
  const { language } = useLanguage()
  const org = salesDeck.visuals.org

  return (
    <section id="org" className="bg-muted/30 py-20 md:py-24">
      <div className="container px-4 md:px-6 max-w-6xl">
        <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-10">
          {pickLocale(org.title, language)}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* In-house: one third — you, carrying seven obligations */}
          <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {pickLocale(org.toggleBefore, language)}
            </p>
            <div className="relative h-[300px] md:h-[320px] select-none">
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden
              >
                {BURDEN_POS.map((p, i) => (
                  <path
                    key={i}
                    d={`M 50 12 Q ${(50 + p.x) / 2} ${(12 + p.y) / 2 - 6} ${p.x} ${p.y - 6}`}
                    fill="none"
                    className="stroke-zinc-400 dark:stroke-zinc-600"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>
              <TanglePill x={50} y={8} variant="ink">
                {pickLocale(org.youLabel, language)}
              </TanglePill>
              {org.burdens.map((b, i) => (
                <TanglePill key={i} x={BURDEN_POS[i].x} y={BURDEN_POS[i].y} variant="muted">
                  {pickLocale(b, language)}
                </TanglePill>
              ))}
            </div>
          </div>

          {/* Tecxmate: two thirds — the force propelling you toward product & revenue */}
          <div className="lg:col-span-2 rounded-2xl border border-primary/40 bg-card p-5 md:p-6 shadow-[0_0_40px_rgba(139,92,246,0.10)]">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              {pickLocale(org.toggleAfter, language)}
            </p>
            <div className="min-h-[280px] md:min-h-[320px] flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 sm:gap-2 px-2 sm:px-6 py-6">
              <FlowPill variant="wordmark">tecxmate</FlowPill>
              <Thrust />
              <FlowPill variant="primary">{pickLocale(org.youLabel, language)}</FlowPill>
              <Thrust />
              <span className="relative inline-flex items-center justify-center shrink-0">
                <RevenueFlow />
                <FlowPill variant="ink">{pickLocale(org.productLabel, language)}</FlowPill>
              </span>
            </div>
          </div>
        </div>

        <p className="text-lg md:text-xl font-medium text-foreground text-center mt-10 max-w-2xl mx-auto">
          {pickLocale(org.close, language)}
        </p>
      </div>
    </section>
  )
}

// Streams of value moving through the pill: money, data, people, time.
type FlowKind = "money" | "data" | "people" | "time"
const FLOW_LANES: { kind: FlowKind; dir: "up" | "down"; pos: number; dur: number }[] = [
  { kind: "money", dir: "up", pos: 13, dur: 5.5 },
  { kind: "data", dir: "down", pos: 38, dur: 7 },
  { kind: "people", dir: "up", pos: 62, dur: 6 },
  { kind: "time", dir: "down", pos: 87, dur: 7.5 },
]

function FlowGlyph({ kind }: { kind: FlowKind }) {
  const cls = "w-4 h-4 shrink-0"
  if (kind === "money") return <DollarSign className={cls} strokeWidth={2.5} />
  if (kind === "data") return <Database className={cls} strokeWidth={2.5} />
  if (kind === "people") return <Users className={cls} strokeWidth={2.5} />
  return <Clock className={cls} strokeWidth={2.5} />
}

/** Money, data, people, and time streaming through "Product & revenue" — perpendicular
 *  to the arrows (vertical on desktop, horizontal on mobile). See globals.css. */
function RevenueFlow() {
  return (
    <span className="revenue-flow" aria-hidden>
      {FLOW_LANES.map((lane, i) => (
        <span
          key={i}
          className="revenue-lane"
          data-dir={lane.dir}
          style={{ ["--pos" as string]: `${lane.pos}%`, animationDuration: `${lane.dur}s`, animationDelay: `${i * -1.7}s` }}
        >
          {Array.from({ length: 10 }).map((_, j) => (
            <FlowGlyph key={j} kind={lane.kind} />
          ))}
        </span>
      ))}
    </span>
  )
}

/** Chevrons pulsing forward — thrust pushing toward the next node. Rotates downward on small screens. */
function Thrust() {
  return (
    <span
      className="relative z-10 flex flex-col sm:flex-row sm:flex-1 items-center justify-center sm:justify-evenly gap-1.5 sm:gap-0 py-1 sm:py-0"
      aria-hidden
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`rotate-90 sm:rotate-0 ${i > 2 ? "hidden sm:block" : ""}`}>
          <svg
            viewBox="0 0 10 14"
            className="w-2.5 h-3.5 md:w-3 md:h-4 text-primary motion-safe:animate-[deck-thrust_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <path
              d="M2 1 L8 7 L2 13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ))}
    </span>
  )
}

const PILL_STYLES = {
  primary: "bg-primary text-white border-primary font-medium",
  wordmark: "bg-foreground text-background border-foreground font-accent italic text-base md:text-lg",
  ink: "bg-foreground text-background border-foreground font-medium",
  muted: "bg-card text-muted-foreground border-border",
} as const

type PillVariant = keyof typeof PILL_STYLES

function TanglePill({
  x,
  y,
  variant,
  children,
}: {
  x: number
  y: number
  variant: PillVariant
  children: React.ReactNode
}) {
  return (
    <span
      className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs shadow-sm ${PILL_STYLES[variant]}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {children}
    </span>
  )
}

function FlowPill({
  variant,
  children,
}: {
  variant: PillVariant
  children: React.ReactNode
}) {
  return (
    <span
      className={`relative z-10 whitespace-nowrap rounded-full border px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base shadow-sm shrink-0 ${PILL_STYLES[variant]}`}
    >
      {children}
    </span>
  )
}
