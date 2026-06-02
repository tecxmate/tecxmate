"use client"

import { useEffect, useState } from "react"
import { AdminShell, useAdminContext } from "@/components/admin/admin-shell"
import type { CompanyInfo, SiteContent } from "@/lib/site-content"

type Status = { kind: "idle" } | { kind: "ok"; msg: string } | { kind: "err"; msg: string }

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border px-3 py-2 text-sm bg-background"
      />
    </label>
  )
}

function CompanyEditor() {
  const { authedFetch } = useAdminContext()
  const [c, setC] = useState<CompanyInfo | null>(null)
  const [markets, setMarkets] = useState("")
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SiteContent | null) => {
        if (data?.company) {
          setC(data.company)
          setMarkets(data.company.operatingMarkets.join(", "))
        }
      })
  }, [])

  if (!c) return <p className="text-sm text-muted-foreground">Loading company info…</p>

  const set = (patch: Partial<CompanyInfo>) => setC((prev) => (prev ? { ...prev, ...patch } : prev))
  const setPhone = (region: "us" | "tw" | "vn", field: "display" | "tel", v: string) =>
    setC((prev) => (prev ? { ...prev, phone: { ...prev.phone, [region]: { ...prev.phone[region], [field]: v } } } : prev))
  const setSocial = (key: keyof CompanyInfo["social"], v: string) =>
    setC((prev) => (prev ? { ...prev, social: { ...prev.social, [key]: v } } : prev))

  const save = async () => {
    setSaving(true)
    setStatus({ kind: "idle" })
    const payload: CompanyInfo = {
      ...c,
      operatingMarkets: markets.split(",").map((m) => m.trim()).filter(Boolean),
    }
    try {
      const res = await authedFetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: payload }),
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
        <h2 className="text-sm font-semibold">Identity</h2>
        <Field label="Brand name" value={c.name} onChange={(v) => set({ name: v })} />
        <Field label="Legal name (EN)" value={c.legalName.en} onChange={(v) => set({ legalName: { ...c.legalName, en: v } })} />
        <Field label="Legal name (VI)" value={c.legalName.vi} onChange={(v) => set({ legalName: { ...c.legalName, vi: v } })} />
        <Field label="Formation" value={c.formation} onChange={(v) => set({ formation: v })} />
        <Field label="Tax number (MST)" value={c.taxNumber} onChange={(v) => set({ taxNumber: v })} />
        <Field label="Operating markets (comma-separated)" value={markets} onChange={setMarkets} placeholder="Taiwan, US, Vietnam" />
      </section>

      <section className="rounded-lg border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold">Headquarters</h2>
        <Field label="Street" value={c.address.street} onChange={(v) => set({ address: { ...c.address, street: v } })} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Locality" value={c.address.locality} onChange={(v) => set({ address: { ...c.address, locality: v } })} />
          <Field label="Country" value={c.address.country} onChange={(v) => set({ address: { ...c.address, country: v } })} />
          <Field label="Country code" value={c.address.countryCode} onChange={(v) => set({ address: { ...c.address, countryCode: v } })} />
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold">Contact</h2>
        <Field label="Contact email" value={c.contactEmail} onChange={(v) => set({ contactEmail: v })} />
        {(["us", "tw", "vn"] as const).map((region) => (
          <div key={region} className="grid gap-3 sm:grid-cols-2">
            <Field
              label={`Phone ${region.toUpperCase()} — display`}
              value={c.phone[region].display}
              onChange={(v) => setPhone(region, "display", v)}
            />
            <Field
              label={`Phone ${region.toUpperCase()} — tel link`}
              value={c.phone[region].tel}
              onChange={(v) => setPhone(region, "tel", v)}
            />
          </div>
        ))}
      </section>

      <section className="rounded-lg border bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold">Social & Booking</h2>
        <Field label="Facebook URL" value={c.social.facebook} onChange={(v) => setSocial("facebook", v)} />
        <Field label="X (Twitter) URL" value={c.social.x} onChange={(v) => setSocial("x", v)} />
        <Field label="Instagram URL" value={c.social.instagram} onChange={(v) => setSocial("instagram", v)} />
        <Field label="LinkedIn URL" value={c.social.linkedin} onChange={(v) => setSocial("linkedin", v)} />
        <Field label="Booking URL (cal.com)" value={c.social.booking} onChange={(v) => setSocial("booking", v)} />
      </section>
    </div>
  )
}

export default function CompanyAdminPage() {
  return (
    <AdminShell title="Company & Footer">
      <CompanyEditor />
    </AdminShell>
  )
}
