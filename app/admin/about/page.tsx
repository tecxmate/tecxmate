"use client"

import { useCallback, useEffect, useState } from "react"
import { AdminShell, useAdminContext } from "@/components/admin/admin-shell"
import type { AboutSection, Locale, Localized, SiteContent } from "@/lib/site-content"

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "vi", label: "VI" },
  { code: "zh", label: "ZH" },
]

const EMPTY_LOCALIZED: Localized = { en: "", vi: "", zh: "" }

function blankSection(): AboutSection {
  return {
    id: `section-${Date.now()}`,
    heading: { ...EMPTY_LOCALIZED },
    paragraphs: [{ ...EMPTY_LOCALIZED }],
    bullets: [],
  }
}

type Status = { kind: "idle" } | { kind: "ok"; msg: string } | { kind: "err"; msg: string }

function AboutEditor() {
  const { authedFetch } = useAdminContext()
  const [hero, setHero] = useState<SiteContent["hero"]>({ title: EMPTY_LOCALIZED, subtitle: EMPTY_LOCALIZED })
  const [subtitle, setSubtitle] = useState<Localized>(EMPTY_LOCALIZED)
  const [sections, setSections] = useState<AboutSection[]>([])
  const [locale, setLocale] = useState<Locale>("en")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((c: SiteContent | null) => {
        if (c?.hero) setHero(c.hero)
        if (c?.about) {
          setSubtitle(c.about.subtitle)
          setSections(c.about.sections)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const setHeroField = (field: "title" | "subtitle", value: string) =>
    setHero((prev) => ({ ...prev, [field]: { ...prev[field], [locale]: value } }))

  const updateSection = useCallback((idx: number, patch: Partial<AboutSection>) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }, [])

  // Edit one Localized entry inside a section's paragraphs/bullets array (or its heading).
  const setHeading = (idx: number, value: string) =>
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, heading: { ...s.heading, [locale]: value } } : s)),
    )

  const setListItem = (idx: number, field: "paragraphs" | "bullets", itemIdx: number, value: string) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i === idx
          ? { ...s, [field]: s[field].map((l, j) => (j === itemIdx ? { ...l, [locale]: value } : l)) }
          : s,
      ),
    )

  const addListItem = (idx: number, field: "paragraphs" | "bullets") =>
    updateSection(idx, { [field]: [...sections[idx][field], { ...EMPTY_LOCALIZED }] } as Partial<AboutSection>)

  const removeListItem = (idx: number, field: "paragraphs" | "bullets", itemIdx: number) =>
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: s[field].filter((_, j) => j !== itemIdx) } : s)),
    )

  const moveSection = (idx: number, dir: -1 | 1) => {
    setSections((prev) => {
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const removeSection = (idx: number) => {
    if (!confirm("Remove this section?")) return
    setSections((prev) => prev.filter((_, i) => i !== idx))
  }

  const save = async () => {
    setSaving(true)
    setStatus({ kind: "idle" })
    try {
      const res = await authedFetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero, about: { subtitle, sections } }),
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

      {/* Homepage hero */}
      <section className="rounded-lg border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold">Homepage Hero</h2>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Title ({L})</label>
          <input
            value={hero.title[locale]}
            onChange={(e) => setHeroField("title", e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Subtitle ({L})</label>
          <textarea
            value={hero.subtitle[locale]}
            onChange={(e) => setHeroField("subtitle", e.target.value)}
            rows={2}
            className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          />
        </div>
      </section>

      {/* About page */}
      <section className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold mb-2">About Page</h2>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Page subtitle ({L})</label>
          <textarea
            value={subtitle[locale]}
            onChange={(e) => setSubtitle((prev) => ({ ...prev, [locale]: e.target.value }))}
            rows={2}
            className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          />
        </div>

        {sections.map((s, idx) => (
          <div key={s.id} className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <input
                value={s.heading[locale]}
                onChange={(e) => setHeading(idx, e.target.value)}
                placeholder={`Heading (${L})`}
                className="flex-1 rounded-md border px-3 py-2 text-sm font-medium bg-background"
              />
              <div className="flex items-center gap-1 text-sm">
                <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="rounded border px-2 py-1 disabled:opacity-40">
                  ↑
                </button>
                <button
                  onClick={() => moveSection(idx, 1)}
                  disabled={idx === sections.length - 1}
                  className="rounded border px-2 py-1 disabled:opacity-40"
                >
                  ↓
                </button>
                <button onClick={() => removeSection(idx)} className="rounded border px-2 py-1 text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Paragraphs</p>
              {s.paragraphs.map((p, pi) => (
                <div key={pi} className="flex gap-2">
                  <textarea
                    value={p[locale]}
                    onChange={(e) => setListItem(idx, "paragraphs", pi, e.target.value)}
                    rows={2}
                    className="flex-1 rounded-md border px-3 py-2 text-sm bg-background"
                  />
                  <button
                    onClick={() => removeListItem(idx, "paragraphs", pi)}
                    className="rounded border px-2 text-red-600 hover:bg-red-50 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => addListItem(idx, "paragraphs")}
                className="text-xs text-primary hover:underline"
              >
                + Add paragraph
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Bullet points</p>
              {s.bullets.map((b, bi) => (
                <div key={bi} className="flex gap-2">
                  <input
                    value={b[locale]}
                    onChange={(e) => setListItem(idx, "bullets", bi, e.target.value)}
                    className="flex-1 rounded-md border px-3 py-2 text-sm bg-background"
                  />
                  <button
                    onClick={() => removeListItem(idx, "bullets", bi)}
                    className="rounded border px-2 text-red-600 hover:bg-red-50 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => addListItem(idx, "bullets")}
                className="text-xs text-primary hover:underline"
              >
                + Add bullet
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setSections((prev) => [...prev, blankSection()])}
          className="w-full rounded-lg border border-dashed py-3 text-sm text-muted-foreground hover:bg-muted"
        >
          + Add section
        </button>
      </section>
    </div>
  )
}

export default function AboutAdminPage() {
  return (
    <AdminShell title="Hero & About">
      <AboutEditor />
    </AdminShell>
  )
}
