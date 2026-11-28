"use client"

import { useState, type FormEvent } from "react"
import { Check, Download, Loader2, Mail, Tag } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

type T = ReturnType<typeof useLanguage>["t"]
type Key = Parameters<T>[0]

const USES: { id: string; label: Key }[] = [
  { id: "legal", label: "vt_eb_use_legal" },
  { id: "clinic", label: "vt_eb_use_clinic" },
  { id: "business", label: "vt_eb_use_business" },
  { id: "writing", label: "vt_eb_use_writing" },
  { id: "study", label: "vt_eb_use_study" },
  { id: "other", label: "vt_eb_use_other" },
]
const MACS: { id: string; label: Key }[] = [
  { id: "apple-silicon", label: "vt_eb_mac_as" },
  { id: "intel", label: "vt_eb_mac_intel" },
  { id: "no-mac", label: "vt_eb_mac_none" },
  { id: "not-sure", label: "vt_eb_mac_unsure" },
]
const DMG = "https://huggingface.co/nikolas-doan/VoiceTecx-releases/resolve/main/VoiceTecx.dmg"

const field =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
const labelCls = "mb-1.5 block text-sm font-medium text-foreground"
const chip = (on: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
    on ? "border-primary bg-primary text-white" : "border-border bg-card text-foreground hover:border-primary"
  }`

/** The VoiceTecx early-bird sign-up: email first, two optional one-tap questions, consent. */
export function VoiceTecxEarlyBird() {
  const { t, language } = useLanguage()
  const [use, setUse] = useState<string>()
  const [mac, setMac] = useState<string>()
  const [state, setState] = useState<"idle" | "sending" | "done">("idle")
  const [error, setError] = useState<string>()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setState("sending")
    setError(undefined)
    try {
      const res = await fetch("/api/voicetecx/early-bird", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          name: form.get("name"),
          use,
          mac,
          language: language === "zh" ? "zh" : "en",
          consent: form.get("consent") === "on",
          website: form.get("website") || undefined,
        }),
      })
      if (res.ok) return setState("done")
      setError(t(res.status === 400 ? "vt_eb_err_form" : res.status === 429 ? "vt_eb_err_rate" : "vt_eb_err"))
    } catch {
      setError(t("vt_eb_err"))
    }
    setState("idle")
  }

  return (
    <section className="pt-28 pb-20 md:pt-32 md:pb-24">
      <div className="container px-4 md:px-6 max-w-5xl grid grid-cols-1 md:grid-cols-[5fr_6fr] gap-10 md:gap-14">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">VoiceTecx</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">{t("vt_eb_title")}</h1>
          <p className="text-lg text-muted-foreground mb-8">{t("vt_eb_lead")}</p>
          <ul className="space-y-5">
            {([
              [Tag, "vt_eb_b1_t", "vt_eb_b1_d"],
              [Mail, "vt_eb_b2_t", "vt_eb_b2_d"],
              [Download, "vt_eb_b3_t", "vt_eb_b3_d"],
            ] as const).map(([Icon, title, body]) => (
              <li key={title} className="flex gap-3">
                <Icon className="h-5 w-5 shrink-0 text-primary mt-0.5" strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <p className="font-semibold text-foreground">{t(title)}</p>
                  <p className="text-sm text-muted-foreground">{t(body)}</p>
                </div>
              </li>
            ))}
          </ul>
          <a href={DMG} className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
            {t("vt_eb_download")} ›
          </a>
        </div>

        <div className="bg-card border border-border shadow-sm p-6 md:p-8">
          {state === "done" ? (
            <div className="text-center py-8" role="status">
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
              </span>
              <h2 className="text-xl font-semibold text-foreground">{t("vt_eb_done_t")}</h2>
              <p className="mt-2 text-muted-foreground">{t("vt_eb_done_d")}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
              <label className="block">
                <span className={labelCls}>{t("vt_eb_email")}</span>
                <input type="email" name="email" required maxLength={200} autoComplete="email" inputMode="email" className={field} />
              </label>
              <label className="block">
                <span className={labelCls}>
                  {t("vt_eb_name")} <span className="ml-1 text-xs font-normal text-muted-foreground">({t("vt_eb_optional")})</span>
                </span>
                <input name="name" maxLength={120} autoComplete="name" className={field} />
              </label>
              <fieldset>
                <legend className={labelCls}>
                  {t("vt_eb_use")} <span className="ml-1 text-xs font-normal text-muted-foreground">({t("vt_eb_optional")})</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {USES.map((u) => (
                    <button key={u.id} type="button" aria-pressed={use === u.id} className={chip(use === u.id)} onClick={() => setUse(use === u.id ? undefined : u.id)}>
                      {t(u.label)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className={labelCls}>
                  {t("vt_eb_mac")} <span className="ml-1 text-xs font-normal text-muted-foreground">({t("vt_eb_optional")})</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {MACS.map((m) => (
                    <button key={m.id} type="button" aria-pressed={mac === m.id} className={chip(mac === m.id)} onClick={() => setMac(mac === m.id ? undefined : m.id)}>
                      {t(m.label)}
                    </button>
                  ))}
                </div>
                {(mac === "intel" || mac === "no-mac") && <p className="mt-2 text-xs text-muted-foreground">{t("vt_eb_mac_note")}</p>}
              </fieldset>
              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-primary" />
                <span>
                  {t("vt_eb_consent")}{" "}
                  <a href="/privacy-policy" className="underline hover:text-foreground">{t("vt_eb_privacy")}</a>
                </span>
              </label>
              {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={state === "sending"}
                className="inline-flex w-full items-center justify-center gap-2 bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {t(state === "sending" ? "vt_eb_sending" : "vt_eb_submit")}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
