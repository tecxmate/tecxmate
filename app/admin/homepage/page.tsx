"use client"

import { useEffect, useState } from "react"
import { AdminShell, useAdminContext } from "@/components/admin/admin-shell"
import { salesDeck, pickLocale } from "@/lib/sales-deck"
import type { HomepageBlocks, Locale, Localized, SiteContent } from "@/lib/site-content"

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "vi", label: "VI" },
  { code: "zh", label: "ZH" },
]

const EMPTY_LOCALIZED: Localized = { en: "", vi: "", zh: "" }

// Fallback shape until content loads / for any missing field.
const EMPTY_HOMEPAGE: HomepageBlocks = {
  heroLogos: { enabled: false, caption: { ...EMPTY_LOCALIZED }, items: [] },
  cta: {
    title: { ...EMPTY_LOCALIZED },
    body: { ...EMPTY_LOCALIZED },
    buttonLabel: { ...EMPTY_LOCALIZED },
    url: "",
  },
  proofMetrics: [],
}

type Status = { kind: "idle" } | { kind: "ok"; msg: string } | { kind: "err"; msg: string }

function labelCls() {
  return "block text-xs font-medium text-muted-foreground mb-1"
}
function inputCls() {
  return "w-full rounded-md border px-3 py-2 text-sm bg-background"
}

function HomepageEditor() {
  const { authedFetch } = useAdminContext()
  const [hp, setHp] = useState<HomepageBlocks>(EMPTY_HOMEPAGE)
  const [locale, setLocale] = useState<Locale>("en")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((c: SiteContent | null) => {
        if (c?.homepage) setHp({ ...EMPTY_HOMEPAGE, ...c.homepage })
      })
      .finally(() => setLoading(false))
  }, [])

  // ---- hero logos ----
  const setLogosEnabled = (v: boolean) => setHp((p) => ({ ...p, heroLogos: { ...p.heroLogos, enabled: v } }))
  const setLogosCaption = (v: string) =>
    setHp((p) => ({ ...p, heroLogos: { ...p.heroLogos, caption: { ...p.heroLogos.caption, [locale]: v } } }))
  const setLogoField = (idx: number, field: "name" | "src", v: string) =>
    setHp((p) => ({
      ...p,
      heroLogos: {
        ...p.heroLogos,
        items: p.heroLogos.items.map((it, i) => (i === idx ? { ...it, [field]: v } : it)),
      },
    }))
  const addLogo = () =>
    setHp((p) => ({ ...p, heroLogos: { ...p.heroLogos, items: [...p.heroLogos.items, { name: "", src: "" }] } }))
  const removeLogo = (idx: number) =>
    setHp((p) => ({ ...p, heroLogos: { ...p.heroLogos, items: p.heroLogos.items.filter((_, i) => i !== idx) } }))
  const moveLogo = (idx: number, dir: -1 | 1) =>
    setHp((p) => {
      const items = [...p.heroLogos.items]
      const t = idx + dir
      if (t < 0 || t >= items.length) return p
      ;[items[idx], items[t]] = [items[t], items[idx]]
      return { ...p, heroLogos: { ...p.heroLogos, items } }
    })

  // ---- cta ----
  const setCta = (field: "title" | "body" | "buttonLabel", v: string) =>
    setHp((p) => ({ ...p, cta: { ...p.cta, [field]: { ...p.cta[field], [locale]: v } } }))
  const setCtaUrl = (v: string) => setHp((p) => ({ ...p, cta: { ...p.cta, url: v } }))

  // ---- proof metrics ----
  // Offerings are code-defined (lib/sales-deck.ts); the admin only edits their
  // stat figures. Resolve each offering's current metrics from the override in
  // state, falling back to the code default so the fields are never blank.
  const metricsFor = (offeringId: string) => {
    const override = hp.proofMetrics.find((m) => m.offeringId === offeringId)
    if (override) return override.metrics
    const fromDeck = salesDeck.proof.offerings.find((o) => o.id === offeringId)
    return fromDeck ? fromDeck.metrics : []
  }
  const setMetric = (offeringId: string, metricIdx: number, field: "label" | "value", v: string) =>
    setHp((p) => {
      const current = metricsFor(offeringId)
      const nextMetrics = current.map((m, i) =>
        i === metricIdx ? { ...m, [field]: { ...m[field], [locale]: v } } : m,
      )
      const exists = p.proofMetrics.some((m) => m.offeringId === offeringId)
      const proofMetrics = exists
        ? p.proofMetrics.map((m) => (m.offeringId === offeringId ? { ...m, metrics: nextMetrics } : m))
        : [...p.proofMetrics, { offeringId, metrics: nextMetrics }]
      return { ...p, proofMetrics }
    })

  const save = async () => {
    setSaving(true)
    setStatus({ kind: "idle" })
    try {
      const res = await authedFetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homepage: hp }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus({ kind: "err", msg: j.error || "Save failed" })
        return
      }
      setStatus({ kind: "ok", msg: "Saved. Changes are live within ~60s." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>

  const L = locale.toUpperCase()

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between sticky top-0 bg-muted/20 py-2 z-10">
        <div className="inline-flex rounded-md border bg-card p-0.5 text-sm">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLocale(l.code)}
              className={`px-3 py-1 rounded ${locale === l.code ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {status.kind === "ok" && <span className="text-sm text-green-600">{status.msg}</span>}
          {status.kind === "err" && <span className="text-sm text-red-600">{status.msg}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Hero partner logos */}
      <section className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Hero partner logos</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hp.heroLogos.enabled}
              onChange={(e) => setLogosEnabled(e.target.checked)}
            />
            Show on homepage
          </label>
        </div>
        <div>
          <label className={labelCls()}>Caption ({L})</label>
          <input value={hp.heroLogos.caption[locale]} onChange={(e) => setLogosCaption(e.target.value)} className={inputCls()} />
        </div>
        <div className="space-y-2">
          <label className={labelCls()}>Logos (name + image path)</label>
          {hp.heroLogos.items.map((logo, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={logo.name}
                onChange={(e) => setLogoField(idx, "name", e.target.value)}
                placeholder="Name"
                className="w-40 rounded-md border px-2 py-1.5 text-sm bg-background"
              />
              <input
                value={logo.src}
                onChange={(e) => setLogoField(idx, "src", e.target.value)}
                placeholder="/logos/example.png"
                className="flex-1 rounded-md border px-2 py-1.5 text-sm bg-background"
              />
              <button onClick={() => moveLogo(idx, -1)} disabled={idx === 0} className="rounded border px-2 py-1 text-sm disabled:opacity-40">↑</button>
              <button onClick={() => moveLogo(idx, 1)} disabled={idx === hp.heroLogos.items.length - 1} className="rounded border px-2 py-1 text-sm disabled:opacity-40">↓</button>
              <button onClick={() => removeLogo(idx)} className="rounded border px-2 py-1 text-sm text-red-600">✕</button>
            </div>
          ))}
          <button onClick={addLogo} className="rounded-md border px-3 py-1.5 text-sm">+ Add logo</button>
          <p className="text-xs text-muted-foreground">
            Image path is under <code>/public</code> (e.g. <code>/logos/example.png</code>) or a full https URL.
          </p>
        </div>
      </section>

      {/* Bottom CTA band */}
      <section className="rounded-lg border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold">Bottom call-to-action</h2>
        <div>
          <label className={labelCls()}>Heading ({L})</label>
          <input value={hp.cta.title[locale]} onChange={(e) => setCta("title", e.target.value)} className={inputCls()} />
        </div>
        <div>
          <label className={labelCls()}>Body ({L})</label>
          <textarea value={hp.cta.body[locale]} onChange={(e) => setCta("body", e.target.value)} rows={2} className={inputCls()} />
        </div>
        <div>
          <label className={labelCls()}>Button label ({L})</label>
          <input value={hp.cta.buttonLabel[locale]} onChange={(e) => setCta("buttonLabel", e.target.value)} className={inputCls()} />
        </div>
        <div>
          <label className={labelCls()}>Button link <span className="font-normal normal-case">(same for all languages)</span></label>
          <input type="url" inputMode="url" value={hp.cta.url} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://cal.com/nikolasdoan/30min" className={inputCls()} />
        </div>
      </section>

      {/* Proof stat figures */}
      <section className="rounded-lg border bg-card p-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Proof section — stat figures</h2>
          <p className="text-xs text-muted-foreground mt-1">
            The two figures shown under each service. Service names and descriptions stay in code; only these numbers are editable here.
          </p>
        </div>
        {salesDeck.proof.offerings.map((offering) => {
          const metrics = metricsFor(offering.id)
          return (
            <div key={offering.id} className="rounded-md border bg-background p-3 space-y-3">
              <p className="text-sm font-medium">{pickLocale(offering.title, locale)}</p>
              {metrics.map((m, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls()}>Label ({L})</label>
                    <input value={m.label[locale]} onChange={(e) => setMetric(offering.id, i, "label", e.target.value)} className={inputCls()} />
                  </div>
                  <div>
                    <label className={labelCls()}>Value ({L})</label>
                    <input value={m.value[locale]} onChange={(e) => setMetric(offering.id, i, "value", e.target.value)} className={inputCls()} />
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </section>
    </div>
  )
}

export default function HomepageBlocksPage() {
  return (
    <AdminShell title="Homepage Blocks">
      <HomepageEditor />
    </AdminShell>
  )
}
