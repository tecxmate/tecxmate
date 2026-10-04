"use client"

import { useEffect, useState } from "react"
import { AdminShell, useAdminContext } from "@/components/admin/admin-shell"
import { Switch } from "@/components/ui/switch"
import {
  HOMEPAGE_SECTION_KEYS,
  SECTION_KEYS,
  defaultSectionVisibility,
  homepageSectionOrder,
  type HomepageSectionKey,
  type SectionKey,
  type SectionVisibility,
  type SiteContent,
} from "@/lib/site-content"

const SECTION_LABELS: Record<SectionKey, { title: string; desc: string }> = {
  hero: {
    title: "Hero",
    desc: "Homepage headline and opening section.",
  },
  problem: {
    title: "Service vs hire graph",
    desc: "Sales narrative: interactive before/after org diagram ('A unique collaboration').",
  },
  economics: {
    title: "Cost calculator",
    desc: "Sales narrative: interactive in-house vs Tecxmate cost calculator.",
  },
  proof: {
    title: "Proof",
    desc: "Sales narrative: Vietnamy and Tecxwork case studies.",
  },
  technology: {
    title: "Technology",
    desc: "Sales narrative: the concrete technology capabilities grid.",
  },
  process: {
    title: "Process",
    desc: "Sales narrative: how we work and engagement models.",
  },
  trust: {
    title: "Trust",
    desc: "Sales narrative: global caliber, local trust differentiators.",
  },
  cta: {
    title: "CTA",
    desc: "Sales narrative: dark closing call-to-action before the footer.",
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
    desc: "Blog navigation, homepage Industry News row, blog pages, feed, and blog APIs.",
  },
  stories: {
    title: "Our Stories",
    desc: "Homepage row of posts categorised 'Our Stories' in WordPress.",
  },
  products: {
    title: "Our Products",
    desc: "Homepage row of posts tagged 'projects' or categorised 'Our Products' in WordPress.",
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
  const [order, setOrder] = useState<HomepageSectionKey[]>([...HOMEPAGE_SECTION_KEYS])
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
        if (content) setOrder(homepageSectionOrder(content))
      })
      .finally(() => setLoading(false))
  }, [])

  const moveSection = (idx: number, dir: -1 | 1) => {
    setOrder((prev) => {
      const target = idx + dir
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
    setStatus({ kind: "idle" })
  }

  const save = async () => {
    setSaving(true)
    setStatus({ kind: "idle" })
    try {
      const res = await authedFetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: { sections, homepageOrder: order } }),
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
        <p className="text-sm text-muted-foreground">Reorder the homepage and turn sections on or off.</p>
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

      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <p className="font-medium">Homepage section order</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Top-to-bottom order of the homepage. Sections turned off below are skipped.
          </p>
        </div>
        <div className="divide-y">
          {order.map((key, idx) => (
            <div key={key} className="flex items-center justify-between gap-4 px-4 py-3">
              <p className={`text-sm ${sections[key] ? "" : "text-muted-foreground line-through"}`}>
                <span className="mr-2 text-muted-foreground">{idx + 1}.</span>
                {SECTION_LABELS[key].title}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveSection(idx, -1)}
                  disabled={idx === 0}
                  aria-label={`Move ${SECTION_LABELS[key].title} up`}
                  className="rounded border px-2 py-1 text-sm disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveSection(idx, 1)}
                  disabled={idx === order.length - 1}
                  aria-label={`Move ${SECTION_LABELS[key].title} down`}
                  className="rounded border px-2 py-1 text-sm disabled:opacity-40"
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
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
