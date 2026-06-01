"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AdminShell, useAdminContext } from "@/components/admin/admin-shell"
import type { Locale, Localized, TeamMember } from "@/lib/site-content"

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "vi", label: "VI" },
  { code: "zh", label: "ZH" },
]

const EMPTY_LOCALIZED: Localized = { en: "", vi: "", zh: "" }

function blankMember(): TeamMember {
  return {
    id: `member-${Date.now()}`,
    name: "",
    role: { ...EMPTY_LOCALIZED },
    description: { ...EMPTY_LOCALIZED },
    photo: "",
    linkedin: "",
    twitter: "",
    socialIcon: "academic",
  }
}

type Status = { kind: "idle" } | { kind: "ok"; msg: string } | { kind: "err"; msg: string }

function TeamEditor() {
  const { authedFetch } = useAdminContext()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [locale, setLocale] = useState<Locale>("en")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const uploadingRef = useRef<number | null>(null)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => {
        if (Array.isArray(c?.team)) setMembers(c.team)
      })
      .finally(() => setLoading(false))
  }, [])

  const update = useCallback((idx: number, patch: Partial<TeamMember>) => {
    setMembers((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)))
  }, [])

  const updateLocalized = useCallback(
    (idx: number, field: "role" | "description", value: string) => {
      setMembers((prev) =>
        prev.map((m, i) => (i === idx ? { ...m, [field]: { ...m[field], [locale]: value } } : m)),
      )
    },
    [locale],
  )

  const move = (idx: number, dir: -1 | 1) => {
    setMembers((prev) => {
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const remove = (idx: number) => {
    if (!confirm("Remove this member?")) return
    setMembers((prev) => prev.filter((_, i) => i !== idx))
  }

  const uploadPhoto = async (idx: number, file: File) => {
    uploadingRef.current = idx
    setUploadingIdx(idx)
    setStatus({ kind: "idle" })
    const fd = new FormData()
    fd.append("file", file)
    fd.append("prefix", members[idx].id || "member")
    try {
      const res = await authedFetch("/api/admin/content", { method: "POST", body: fd })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus({ kind: "err", msg: j.error || "Upload failed" })
        return
      }
      update(idx, { photo: j.url })
    } finally {
      setUploadingIdx(null)
      uploadingRef.current = null
    }
  }

  const save = async () => {
    setSaving(true)
    setStatus({ kind: "idle" })
    try {
      const res = await authedFetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team: members }),
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

  if (loading) return <p className="text-sm text-muted-foreground">Loading team…</p>

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

      {members.map((m, idx) => (
        <div key={m.id} className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="h-24 w-20 overflow-hidden rounded bg-muted">
                {m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo} alt={m.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    No photo
                  </div>
                )}
              </div>
              <label className="mt-1 block cursor-pointer text-center text-xs text-primary hover:underline">
                {uploadingIdx === idx ? "Uploading…" : "Change"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) uploadPhoto(idx, f)
                  }}
                />
              </label>
            </div>

            <div className="flex-1 space-y-2">
              <input
                value={m.name}
                onChange={(e) => update(idx, { name: e.target.value })}
                placeholder="Name (e.g. Brian Nguyen 阮文貴)"
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              />
              <input
                value={m.role[locale]}
                onChange={(e) => updateLocalized(idx, "role", e.target.value)}
                placeholder={`Role (${locale.toUpperCase()})`}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              />
              <textarea
                value={m.description[locale]}
                onChange={(e) => updateLocalized(idx, "description", e.target.value)}
                placeholder={`Description (${locale.toUpperCase()}) — optional`}
                rows={2}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={m.linkedin}
              onChange={(e) => update(idx, { linkedin: e.target.value })}
              placeholder="LinkedIn URL"
              className="rounded-md border px-3 py-2 text-sm bg-background"
            />
            <input
              value={m.twitter}
              onChange={(e) => update(idx, { twitter: e.target.value })}
              placeholder="Secondary URL (optional)"
              className="rounded-md border px-3 py-2 text-sm bg-background"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Secondary icon
              <select
                value={m.socialIcon}
                onChange={(e) => update(idx, { socialIcon: e.target.value as TeamMember["socialIcon"] })}
                className="rounded-md border px-2 py-1 text-sm bg-background"
              >
                <option value="academic">Academic</option>
                <option value="company">Company</option>
              </select>
            </label>
            <div className="flex items-center gap-1 text-sm">
              <button onClick={() => move(idx, -1)} disabled={idx === 0} className="rounded border px-2 py-1 disabled:opacity-40">
                ↑
              </button>
              <button
                onClick={() => move(idx, 1)}
                disabled={idx === members.length - 1}
                className="rounded border px-2 py-1 disabled:opacity-40"
              >
                ↓
              </button>
              <button onClick={() => remove(idx)} className="rounded border px-2 py-1 text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => setMembers((prev) => [...prev, blankMember()])}
        className="w-full rounded-lg border border-dashed py-3 text-sm text-muted-foreground hover:bg-muted"
      >
        + Add member
      </button>
    </div>
  )
}

export default function TeamAdminPage() {
  return (
    <AdminShell title="Team">
      <TeamEditor />
    </AdminShell>
  )
}
