"use client"

import { useEffect, useState } from "react"
import { AdminShell, useAdminContext } from "@/components/admin/admin-shell"
import type { SeoMetadata, SiteContent } from "@/lib/site-content"

type Status = { kind: "idle" } | { kind: "ok"; msg: string } | { kind: "err"; msg: string }

function MetadataEditor() {
  const { authedFetch } = useAdminContext()
  const [seo, setSeo] = useState<SeoMetadata | null>(null)
  const [keywords, setKeywords] = useState("")
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SiteContent | null) => {
        if (data?.seo) {
          setSeo(data.seo)
          setKeywords(data.seo.keywords.join(", "))
        }
      })
  }, [])

  if (!seo) return <p className="text-sm text-muted-foreground">Loading metadata…</p>

  const set = (patch: Partial<SeoMetadata>) => setSeo((prev) => (prev ? { ...prev, ...patch } : prev))

  const save = async () => {
    setSaving(true)
    setStatus({ kind: "idle" })
    const payload: SeoMetadata = {
      ...seo,
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
    }
    try {
      const res = await authedFetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seo: payload }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus({ kind: "err", msg: j.error || "Save failed" })
        return
      }
      setStatus({ kind: "ok", msg: "Saved. Search/preview metadata updates within ~60s." })
    } finally {
      setSaving(false)
    }
  }

  const Label = ({ children }: { children: React.ReactNode }) => (
    <span className="block text-xs font-medium text-muted-foreground mb-1">{children}</span>
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-end gap-3 sticky top-0 bg-muted/20 py-2 z-10">
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

      <section className="rounded-lg border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold">Search Engine</h2>
        <label className="block">
          <Label>Homepage title</Label>
          <input
            value={seo.title}
            onChange={(e) => set({ title: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          />
          <span className="mt-1 block text-[11px] text-muted-foreground">{seo.title.length} chars (aim ≤ 60)</span>
        </label>
        <label className="block">
          <Label>Meta description</Label>
          <textarea
            value={seo.description}
            onChange={(e) => set({ description: e.target.value })}
            rows={3}
            className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          />
          <span className="mt-1 block text-[11px] text-muted-foreground">{seo.description.length} chars (aim ≤ 160)</span>
        </label>
        <label className="block">
          <Label>Keywords (comma-separated)</Label>
          <textarea
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            rows={3}
            className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          />
          <span className="mt-1 block text-[11px] text-muted-foreground">
            Auto-expanded per country (Taiwan, Vietnam, US, China) on save.
          </span>
        </label>
      </section>

      <section className="rounded-lg border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold">Social Sharing (Open Graph & X/Twitter)</h2>
        <label className="block">
          <Label>Share title</Label>
          <input
            value={seo.ogTitle}
            onChange={(e) => set({ ogTitle: e.target.value })}
            className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          />
        </label>
        <label className="block">
          <Label>Open Graph description (Facebook, LinkedIn…)</Label>
          <textarea
            value={seo.ogDescription}
            onChange={(e) => set({ ogDescription: e.target.value })}
            rows={3}
            className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          />
        </label>
        <label className="block">
          <Label>X/Twitter description</Label>
          <textarea
            value={seo.twitterDescription}
            onChange={(e) => set({ twitterDescription: e.target.value })}
            rows={2}
            className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          />
        </label>
        <label className="block">
          <Label>X/Twitter handle</Label>
          <input
            value={seo.twitterCreator}
            onChange={(e) => set({ twitterCreator: e.target.value })}
            placeholder="@tecxmate"
            className="w-full rounded-md border px-3 py-2 text-sm bg-background"
          />
        </label>
      </section>
    </div>
  )
}

export default function MetadataAdminPage() {
  return (
    <AdminShell title="Metadata (SEO)">
      <MetadataEditor />
    </AdminShell>
  )
}
