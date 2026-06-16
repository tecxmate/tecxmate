"use client"

import { useEffect, useState } from "react"
import { AdminShell, useAdminContext } from "@/components/admin/admin-shell"
import { Switch } from "@/components/ui/switch"
import {
  SECTION_KEYS,
  defaultSectionVisibility,
  type SectionKey,
  type SectionVisibility,
  type SiteContent,
} from "@/lib/site-content"

const SECTION_LABELS: Record<SectionKey, { title: string; desc: string }> = {
  hero: {
    title: "Hero",
    desc: "Homepage headline and opening section.",
  },
  projects: {
    title: "Projects",
    desc: "Projects link in navigation and the homepage projects section.",
  },
  services: {
    title: "Services",
    desc: "Services link in navigation and the homepage services section.",
  },
  team: {
    title: "Team",
    desc: "Team link in navigation and the homepage team section.",
  },
  blog: {
    title: "Blog / News",
    desc: "Blog navigation, homepage news cards, blog pages, feed, and blog APIs.",
  },
  about: {
    title: "About",
    desc: "About link in navigation and the About page.",
  },
  tecxbook: {
    title: "Tecxbook",
    desc: "Tecxbook product link and Tecxbook pages.",
  },
}

type Status = { kind: "idle" } | { kind: "ok"; msg: string } | { kind: "err"; msg: string }

function VisibilityEditor() {
  const { authedFetch } = useAdminContext()
  const [sections, setSections] = useState<SectionVisibility>(defaultSectionVisibility)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((content: SiteContent | null) => {
        setSections({
          ...defaultSectionVisibility,
          ...content?.settings?.sections,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    setStatus({ kind: "idle" })
    try {
      const res = await authedFetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: { sections } }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus({ kind: "err", msg: data.error || "Save failed" })
        return
      }
      setStatus({ kind: "ok", msg: "Saved. Changes are live within ~60s." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading visibility settings...</p>

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between sticky top-0 bg-muted/20 py-2">
        <p className="text-sm text-muted-foreground">Turn public website sections on or off.</p>
        <div className="flex items-center gap-3">
          {status.kind === "ok" && <span className="text-sm text-green-600">{status.msg}</span>}
          {status.kind === "err" && <span className="text-sm text-red-600">{status.msg}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-card divide-y">
        {SECTION_KEYS.map((key) => {
          const label = SECTION_LABELS[key]
          return (
            <div key={key} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{label.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label.desc}</p>
              </div>
              <Switch
                checked={sections[key]}
                onCheckedChange={(checked) => {
                  setSections((prev) => ({ ...prev, [key]: checked }))
                  setStatus({ kind: "idle" })
                }}
                aria-label={`Toggle ${label.title}`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminVisibilityPage() {
  return (
    <AdminShell title="Section Visibility">
      <VisibilityEditor />
    </AdminShell>
  )
}
