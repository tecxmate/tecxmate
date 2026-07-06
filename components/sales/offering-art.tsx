"use client"

import { Check, GraduationCap, Sparkles } from "lucide-react"

/**
 * Slim animated illustration strips for the offering cards.
 * Same language as the other infographics: gray = the world before,
 * purple = what Tecxmate brings. Pure CSS loops, reduced-motion safe.
 */
export function OfferingArt({ id }: { id: string }) {
  if (id === "apps") return <AppsArt />
  if (id === "modernize") return <ModernizeArt />
  if (id === "consulting") return <ConsultingArt />
  return <AiArt />
}

const ASSEMBLE = "motion-safe:animate-[deck-assemble_4s_ease-in-out_infinite]"

/** A phone and a web-admin window whose UI assembles itself, block by block. */
function AppsArt() {
  return (
    <div className="h-28 flex items-end justify-center gap-5 pb-1" aria-hidden>
      {/* Phone */}
      <span className="w-[52px] h-[84px] rounded-xl border-2 border-zinc-400 dark:border-zinc-500 p-1.5 flex flex-col gap-1">
        <span className={`h-2 rounded-sm bg-primary/70 ${ASSEMBLE}`} style={{ animationDelay: "0ms" }} />
        <span className={`h-4 rounded-sm bg-primary/25 ${ASSEMBLE}`} style={{ animationDelay: "300ms" }} />
        <span className={`h-4 rounded-sm bg-primary/25 ${ASSEMBLE}`} style={{ animationDelay: "600ms" }} />
        <span className={`h-2 w-2/3 mx-auto mt-auto rounded-full bg-primary ${ASSEMBLE}`} style={{ animationDelay: "900ms" }} />
      </span>
      {/* Web admin panel */}
      <span className="w-28 h-[76px] rounded-lg border-2 border-zinc-400 dark:border-zinc-500 flex flex-col overflow-hidden">
        <span className="h-3 shrink-0 bg-zinc-200 dark:bg-zinc-700 flex items-center gap-[3px] px-1.5">
          <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
          <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
        </span>
        <span className="flex flex-1 min-h-0">
          <span className={`w-6 shrink-0 bg-primary/15 ${ASSEMBLE}`} style={{ animationDelay: "450ms" }} />
          <span className="flex-1 p-1.5 flex flex-col gap-1">
            <span className={`h-2 rounded-sm bg-primary/40 ${ASSEMBLE}`} style={{ animationDelay: "750ms" }} />
            <span className={`h-2 rounded-sm bg-primary/25 ${ASSEMBLE}`} style={{ animationDelay: "1050ms" }} />
            <span className={`h-2 w-2/3 rounded-sm bg-primary/25 ${ASSEMBLE}`} style={{ animationDelay: "1350ms" }} />
          </span>
        </span>
      </span>
    </div>
  )
}

function Paper({ className, style, tidy }: { className?: string; style?: React.CSSProperties; tidy?: boolean }) {
  return (
    <span
      className={`absolute w-9 h-12 rounded-[3px] border-2 bg-card p-1 flex flex-col gap-[3px] ${
        tidy ? "border-primary/60" : "border-zinc-400 dark:border-zinc-500"
      } ${className ?? ""}`}
      style={style}
    >
      <span className={`h-[3px] rounded-full ${tidy ? "bg-primary/50" : "bg-zinc-300 dark:bg-zinc-600"}`} />
      <span className={`h-[3px] w-2/3 rounded-full ${tidy ? "bg-primary/35" : "bg-zinc-300 dark:bg-zinc-600"}`} />
    </span>
  )
}

/** Scattered paperwork straightening into a tidy, approved stack. */
function ModernizeArt() {
  return (
    <div className="h-28 flex items-center justify-center gap-4" aria-hidden>
      {/* Messy pile */}
      <span className="relative w-16 h-20">
        <Paper className="left-0 top-2 motion-safe:animate-[deck-wobble_3s_ease-in-out_infinite]" style={{ transform: "rotate(-12deg)" }} />
        <Paper className="left-5 top-4" style={{ transform: "rotate(8deg)" }} />
        <Paper className="left-2.5 top-6" style={{ transform: "rotate(-4deg)" }} />
      </span>
      {/* Thrust */}
      <span className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            viewBox="0 0 10 14"
            className="w-2.5 h-3.5 text-primary motion-safe:animate-[deck-thrust_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <path d="M2 1 L8 7 L2 13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ))}
      </span>
      {/* Tidy stack */}
      <span className="relative w-16 h-20">
        <Paper tidy style={{ left: "4px", top: "10px" }} />
        <Paper tidy style={{ left: "10px", top: "18px" }} />
        <Paper tidy style={{ left: "16px", top: "26px" }} />
        <span className="absolute -right-0.5 bottom-0 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center motion-safe:animate-[deck-pop_2.4s_ease-in-out_infinite]">
          <Check className="w-3 h-3" strokeWidth={3} />
        </span>
      </span>
    </div>
  )
}

// One shared heartbeat (3000ms period, kept literal in the animation classes so
// Tailwind emits them): a pulse crosses a wire and the node it reaches reacts.
// Delays step by FLOW_STEP so the whole chain reads as one connected signal.
const FLOW_STEP_MS = 600

/** A wire carrying a single pulse dot that arrives at ~18% of the period. */
function PulseWire({ delay, dir = "ltr" }: { delay: number; dir?: "ltr" | "rtl" }) {
  const anim =
    dir === "rtl"
      ? "motion-safe:animate-[deck-pulse-rev_3000ms_linear_infinite]"
      : "motion-safe:animate-[deck-pulse_3000ms_linear_infinite]"
  return (
    <span className="relative w-5 h-px shrink-0 bg-border" aria-hidden>
      <span
        className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary opacity-0 ${anim}`}
        style={{ animationDelay: `${delay}ms` }}
      />
    </span>
  )
}

/** A system block that turns purple the moment its pulse arrives. */
function ReactBlock({ delay }: { delay: number }) {
  return (
    <span className="relative w-7 h-7 shrink-0 overflow-hidden rounded-md border-2 border-zinc-400 dark:border-zinc-500 bg-zinc-100 dark:bg-zinc-800">
      <span
        className="absolute inset-0 bg-primary opacity-0 motion-safe:animate-[deck-react_3000ms_ease-in-out_infinite]"
        style={{ animationDelay: `${delay}ms` }}
      />
    </span>
  )
}

/** Existing systems that light up outward from the AI core, in sync with each pulse. */
function AiArt() {
  return (
    <div className="h-28 flex items-center justify-center" aria-hidden>
      <span className="flex items-center">
        <ReactBlock delay={FLOW_STEP_MS} />
        <PulseWire delay={FLOW_STEP_MS} dir="rtl" />
        <ReactBlock delay={0} />
        <PulseWire delay={0} dir="rtl" />
        <span className="w-10 h-10 shrink-0 rounded-lg bg-primary flex items-center justify-center motion-safe:animate-[deck-glow_3000ms_ease-out_infinite]">
          <Sparkles className="w-5 h-5 text-white" />
        </span>
        <PulseWire delay={0} dir="ltr" />
        <ReactBlock delay={0} />
        <PulseWire delay={FLOW_STEP_MS} dir="ltr" />
        <ReactBlock delay={FLOW_STEP_MS} />
      </span>
    </div>
  )
}

/** One person who lights up the moment the pulse reaches them. */
function Learner({ delay }: { delay: number }) {
  return (
    <span className="relative flex flex-col items-center shrink-0" aria-hidden>
      {/* faint base so the team is visible at rest */}
      <span className="w-3.5 h-3.5 rounded-full bg-primary/20" />
      <span className="w-6 h-3 mt-0.5 rounded-t-full bg-primary/20" />
      {/* bright "skill acquired" fill, timed to the pulse arrival */}
      <span
        className="absolute inset-x-0 top-0 flex flex-col items-center opacity-0 motion-safe:animate-[deck-react_3000ms_ease-in-out_infinite]"
        style={{ animationDelay: `${delay}ms` }}
      >
        <span className="w-3.5 h-3.5 rounded-full bg-primary" />
        <span className="w-6 h-3 mt-0.5 rounded-t-full bg-primary" />
      </span>
    </span>
  )
}

/** Knowledge flowing from the mentor into the team — each person lights up as the pulse arrives. */
function ConsultingArt() {
  return (
    <div className="h-28 flex items-center justify-center gap-1.5" aria-hidden>
      <span className="w-10 h-10 shrink-0 rounded-lg bg-primary flex items-center justify-center motion-safe:animate-[deck-glow_3000ms_ease-out_infinite]">
        <GraduationCap className="w-5 h-5 text-white" />
      </span>
      <PulseWire delay={0} />
      <Learner delay={0} />
      <PulseWire delay={FLOW_STEP_MS} />
      <Learner delay={FLOW_STEP_MS} />
      <PulseWire delay={FLOW_STEP_MS * 2} />
      <Learner delay={FLOW_STEP_MS * 2} />
    </div>
  )
}
