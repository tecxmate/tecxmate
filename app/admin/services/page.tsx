"use client"

import { useCallback, useEffect, useState } from "react"
import { AdminShell, useAdminContext } from "@/components/admin/admin-shell"
import { SERVICE_ICONS, type Locale, type Localized, type Service, type SiteContent } from "@/lib/site-content"

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "vi", label: "VI" },
  { code: "zh", label: "ZH" },
]

const EMPTY_LOCALIZED: Localized = { en: "", vi: "", zh: "" }

function blankService(): Service {
  return {
    id: `service-${Date.now()}`,
    icon: "bot",
    title: { ...EMPTY_LOCALIZED },
    description: { ...EMPTY_LOCALIZED },
  }
}

type Status = { kind: "idle" } | { kind: "ok"; msg: string } | { kind: "err"; msg: string }

function ServicesEditor() {
  const { authedFetch } = useAdminContext()
  const [title, setTitle] = useState<Localized>(EMPTY_LOCALIZED)
  const [items, setItems] = useState<Service[]>([])
  const [locale, setLocale] = useState<Locale>("en")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((c: SiteContent | null) => {
        if (c?.services) {
          setTitle(c.services.title)
          setItems(c.services.items)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const updateItem = useCallback((idx: number, patch: Partial<Service>) => {
    setItems((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }, [])

  const updateLocalized = useCallback(
    (idx: number, field: "title" | "description", value: string) => {
      setItems((prev) =>
        prev.map((s, i) => (i === idx ? { ...s, [field]: { ...s[field], [locale]: value } } : s)),
      )
    },
    [locale],
  )

  const move = (idx: number, dir: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const remove = (idx: number) => {
    if (!confirm("Remove this service?")) return
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const save = async () => {
    setSaving(true)
    setStatus({ kind: "idle" })
    try {
      const res = await authedFetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: { title, items } }),
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

  if (loading) return <p className="text-sm text-muted-foreground">Loading services…</p>

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between sticky top-0 bg-muted/20 py-2">
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

      <div className="rounded-lg border bg-card p-4">
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          Section heading ({locale.toUpperCase()})
        </label>
        <input
          value={title[locale]}
          onChange={(e) => setTitle((prev) => ({ ...prev, [locale]: e.target.value }))}
          placeholder="e.g. Our Services"
          className="w-full rounded-md border px-3 py-2 text-sm bg-background"
        />
      </div>

      {items.map((s, idx) => (
        <div key={s.id} className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <select
              value={s.icon}
              onChange={(e) => updateItem(idx, { icon: e.target.value as Service["icon"] })}
              className="rounded-md border px-2 py-1.5 text-sm bg-background"
            >
              {SERVICE_ICONS.map((ic) => (
                <option key={ic} value={ic}>
                  {ic}
                </option>
              ))}
            </select>
            <input
              value={s.id}
              onChange={(e) => updateItem(idx, { id: e.target.value })}
              placeholder="id (used for layout accent)"
              className="flex-1 rounded-md border px-3 py-1.5 text-sm bg-background font-mono text-xs"
            />
            <div className="flex items-center gap-1 text-sm">
              <button onClick={() => move(idx, -1)} disabled={idx === 0} className="rounded border px-2 py-1 disabled:opacity-40">
                ↑
              </button>
              <button
                onClick={() => move(idx, 1)}
                disabled={idx === items.length - 1}
                className="rounded border px-2 py-1 disabled:opacity-40"
              >
                ↓
              </button>
              <button onClick={() => remove(idx)} className="rounded border px-2 py-1 text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
          <input
            value={s.title[locale]}
            onChange={(e) => updateLocalized(idx, "title", e.target.value)}
            placeholder={`Title (${locale.toUpperCase()})`}
            className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          />
          <textarea
            value={s.description[locale]}
            onChange={(e) => updateLocalized(idx, "description", e.target.value)}
            placeholder={`Description (${locale.toUpperCase()})`}
            rows={2}
            className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          />
        </div>
      ))}

      <button
        onClick={() => setItems((prev) => [...prev, blankService()])}
        className="w-full rounded-lg border border-dashed py-3 text-sm text-muted-foreground hover:bg-muted"
      >
        + Add service
      </button>
    </div>
  )
}

export default function ServicesAdminPage() {
  return (
    <AdminShell title="Services">
      <ServicesEditor />
    </AdminShell>
  )
}
