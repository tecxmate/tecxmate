"use client"

import { useEffect, useState } from "react"
import { AdminShell, useAdminContext } from "@/components/admin/admin-shell"
import type { ChatbotConfig, Locale, SiteContent } from "@/lib/site-content"

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "vi", label: "Vietnamese" },
  { code: "zh", label: "Traditional Chinese" },
]

type Status = { kind: "idle" } | { kind: "ok"; msg: string } | { kind: "err"; msg: string }

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
    </label>
  )
}

function ChatbotEditor() {
  const { authedFetch } = useAdminContext()
  const [bot, setBot] = useState<ChatbotConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SiteContent | null) => {
        if (data?.chatbot) setBot(data.chatbot)
      })
  }, [])

  if (!bot) return <p className="text-sm text-muted-foreground">Loading chatbot settings...</p>

  const set = (patch: Partial<ChatbotConfig>) => setBot((prev) => (prev ? { ...prev, ...patch } : prev))
  const setLocalized = (key: "title" | "subtitle" | "greeting" | "placeholder" | "systemPrompt" | "knowledge", locale: Locale, value: string) =>
    setBot((prev) => (prev ? { ...prev, [key]: { ...prev[key], [locale]: value } } : prev))
  const setEscalationMessage = (locale: Locale, value: string) =>
    setBot((prev) => (
      prev
        ? { ...prev, escalation: { ...prev.escalation, message: { ...prev.escalation.message, [locale]: value } } }
        : prev
    ))
  const setLimit = (key: keyof ChatbotConfig["limits"], value: string) =>
    setBot((prev) => (
      prev
        ? { ...prev, limits: { ...prev.limits, [key]: Math.max(1, Number(value) || prev.limits[key]) } }
        : prev
    ))

  const setQuickQuestions = (locale: Locale, value: string) => {
    const lines = value.split("\n").map((line) => line.trim()).filter(Boolean)
    setBot((prev) => {
      if (!prev) return prev
      const max = Math.max(lines.length, prev.quickQuestions.length)
      const quickQuestions = Array.from({ length: max }, (_, index) => ({
        id: prev.quickQuestions[index]?.id || `question-${index + 1}`,
        label: {
          en: prev.quickQuestions[index]?.label.en || lines[index] || "",
          vi: prev.quickQuestions[index]?.label.vi || lines[index] || "",
          zh: prev.quickQuestions[index]?.label.zh || lines[index] || "",
          [locale]: lines[index] || prev.quickQuestions[index]?.label[locale] || "",
        },
      })).filter((item) => item.label.en || item.label.vi || item.label.zh)
      return { ...prev, quickQuestions }
    })
  }

  const save = async () => {
    setSaving(true)
    setStatus({ kind: "idle" })
    try {
      const res = await authedFetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatbot: bot }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus({ kind: "err", msg: json.error || "Save failed" })
        return
      }
      setStatus({ kind: "ok", msg: "Saved. Changes are live within ~60s." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-muted/20 py-2">
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={bot.enabled} onChange={(event) => set({ enabled: event.target.checked })} />
            Enabled
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={bot.memoryEnabled} onChange={(event) => set({ memoryEnabled: event.target.checked })} />
            Returning visitor memory
          </label>
        </div>
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

      <section className="rounded-lg border bg-card p-4 space-y-4">
        <h2 className="text-sm font-semibold">Public widget copy</h2>
        {LOCALES.map((locale) => (
          <div key={locale.code} className="space-y-3 rounded-md border p-3">
            <h3 className="text-xs font-medium text-muted-foreground">{locale.label}</h3>
            <Field label="Title" value={bot.title[locale.code]} onChange={(value) => setLocalized("title", locale.code, value)} />
            <Field label="Subtitle" value={bot.subtitle[locale.code]} onChange={(value) => setLocalized("subtitle", locale.code, value)} />
            <TextArea label="Greeting" value={bot.greeting[locale.code]} onChange={(value) => setLocalized("greeting", locale.code, value)} rows={3} />
            <Field label="Input placeholder" value={bot.placeholder[locale.code]} onChange={(value) => setLocalized("placeholder", locale.code, value)} />
            <TextArea
              label="Quick questions, one per line"
              value={bot.quickQuestions.map((item) => item.label[locale.code]).join("\n")}
              onChange={(value) => setQuickQuestions(locale.code, value)}
              rows={4}
            />
          </div>
        ))}
      </section>

      <section className="rounded-lg border bg-card p-4 space-y-4">
        <h2 className="text-sm font-semibold">Prompt and knowledge</h2>
        {LOCALES.map((locale) => (
          <div key={locale.code} className="space-y-3 rounded-md border p-3">
            <h3 className="text-xs font-medium text-muted-foreground">{locale.label}</h3>
            <TextArea label="System prompt" value={bot.systemPrompt[locale.code]} onChange={(value) => setLocalized("systemPrompt", locale.code, value)} rows={8} />
            <TextArea label="Business knowledge" value={bot.knowledge[locale.code]} onChange={(value) => setLocalized("knowledge", locale.code, value)} rows={5} />
          </div>
        ))}
      </section>

      <section className="rounded-lg border bg-card p-4 space-y-4">
        <h2 className="text-sm font-semibold">Escalation and limits</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="LINE label" value={bot.escalation.lineLabel} onChange={(value) => set({ escalation: { ...bot.escalation, lineLabel: value } })} />
          <Field label="LINE URL" value={bot.escalation.lineUrl} onChange={(value) => set({ escalation: { ...bot.escalation, lineUrl: value } })} />
          <Field label="Transcript email" value={bot.escalation.contactEmail} onChange={(value) => set({ escalation: { ...bot.escalation, contactEmail: value } })} />
          <Field label="Retention days" type="number" value={String(bot.limits.retainDays)} onChange={(value) => setLimit("retainDays", value)} />
          <Field label="Max input characters" type="number" value={String(bot.limits.maxInputChars)} onChange={(value) => setLimit("maxInputChars", value)} />
          <Field label="Max messages per hour" type="number" value={String(bot.limits.maxMessagesPerHour)} onChange={(value) => setLimit("maxMessagesPerHour", value)} />
        </div>
        {LOCALES.map((locale) => (
          <TextArea
            key={locale.code}
            label={`Escalation message (${locale.label})`}
            value={bot.escalation.message[locale.code]}
            onChange={(value) => setEscalationMessage(locale.code, value)}
            rows={3}
          />
        ))}
      </section>
    </div>
  )
}

export default function ChatbotAdminPage() {
  return (
    <AdminShell title="Chatbot">
      <ChatbotEditor />
    </AdminShell>
  )
}
