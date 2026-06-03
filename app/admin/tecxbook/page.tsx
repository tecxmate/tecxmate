"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminShell, useAdminContext } from "@/components/admin/admin-shell"
import type { TecxbookEntry } from "@/lib/tecxbook"

type Status = { kind: "idle" } | { kind: "ok"; msg: string } | { kind: "err"; msg: string }

function TecxbookManager() {
  const { authedFetch } = useAdminContext()
  const [entries, setEntries] = useState<TecxbookEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  // Upload form
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [cover, setCover] = useState("")

  // Edit state
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<TecxbookEntry>>({})
  const [editFile, setEditFile] = useState<File | null>(null)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/tecxbook", { cache: "no-store" })
      if (res.ok) setEntries(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) {
      setStatus({ kind: "err", msg: "File and title are required" })
      return
    }
    setStatus({ kind: "idle" })
    const fd = new FormData()
    fd.append("file", file)
    fd.append("title", title)
    if (slug) fd.append("slug", slug)
    fd.append("description", description)
    fd.append("tags", tags)
    fd.append("cover", cover)

    const res = await authedFetch("/api/admin/tecxbook", {
      method: "POST",
      body: fd,
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setStatus({ kind: "err", msg: j.error || `Upload failed (${res.status})` })
      return
    }
    setStatus({ kind: "ok", msg: "Uploaded" })
    setFile(null)
    setTitle("")
    setSlug("")
    setDescription("")
    setTags("")
    setCover("")
    const input = document.getElementById("upload-file") as HTMLInputElement | null
    if (input) input.value = ""
    fetchEntries()
  }

  const startEdit = (entry: TecxbookEntry) => {
    setEditingSlug(entry.slug)
    setEditForm({
      title: entry.title,
      description: entry.description,
      tags: entry.tags,
      cover: entry.cover,
    })
    setEditFile(null)
  }

  const cancelEdit = () => {
    setEditingSlug(null)
    setEditForm({})
    setEditFile(null)
  }

  const saveEdit = async (slug: string) => {
    const fd = new FormData()
    if (editForm.title !== undefined) fd.append("title", editForm.title)
    if (editForm.description !== undefined) fd.append("description", editForm.description)
    if (editForm.tags !== undefined) fd.append("tags", (editForm.tags ?? []).join(","))
    if (editForm.cover !== undefined) fd.append("cover", editForm.cover ?? "")
    if (editFile) fd.append("file", editFile)

    const res = await authedFetch(`/api/admin/tecxbook/${slug}`, {
      method: "PATCH",
      body: fd,
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setStatus({ kind: "err", msg: j.error || `Save failed (${res.status})` })
      return
    }
    setStatus({ kind: "ok", msg: "Saved" })
    cancelEdit()
    fetchEntries()
  }

  const deleteEntry = async (slug: string) => {
    if (!confirm(`Delete "${slug}"? This removes the HTML file too.`)) return
    const res = await authedFetch(`/api/admin/tecxbook/${slug}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      setStatus({ kind: "err", msg: `Delete failed (${res.status})` })
      return
    }
    setStatus({ kind: "ok", msg: "Deleted" })
    fetchEntries()
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-end mb-6">
        <a
          href="/tecxbook"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View site →
        </a>
      </div>

      {status.kind === "ok" && (
        <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-800">
          {status.msg}
        </div>
      )}
      {status.kind === "err" && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-800">
          {status.msg}
        </div>
      )}

      {/* Upload form */}
      <form
        onSubmit={handleUpload}
        className="bg-white rounded-lg shadow-sm p-6 mb-8 space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900">Upload new artifact</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HTML file
          </label>
          <input
            id="upload-file"
            type="file"
            accept=".html,text/html"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-gray-400">(auto from title if empty)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="high-finance"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags <span className="text-gray-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Finance, Reference"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover URL <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="url"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="https://..."
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
        >
          Upload
        </button>
      </form>

      {/* Entries list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No artifacts yet.</p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const isEditing = editingSlug === entry.slug
            return (
              <div
                key={entry.slug}
                className="bg-white rounded-lg shadow-sm p-5 border border-gray-200"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        value={editForm.title ?? ""}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, title: e.target.value }))
                        }
                        placeholder="Title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="text"
                        value={(editForm.tags ?? []).join(", ")}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            tags: e.target.value
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean),
                          }))
                        }
                        placeholder="Tags (comma-separated)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <textarea
                      value={editForm.description ?? ""}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, description: e.target.value }))
                      }
                      rows={2}
                      placeholder="Description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="url"
                      value={editForm.cover ?? ""}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, cover: e.target.value }))
                      }
                      placeholder="Cover URL (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Replace HTML file (optional)
                      </label>
                      <input
                        type="file"
                        accept=".html,text/html"
                        onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(entry.slug)}
                        className="bg-primary text-white px-3 py-1.5 rounded-md text-sm hover:bg-primary/90"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {entry.title}
                        </h3>
                        <code className="text-xs text-gray-500">{entry.slug}</code>
                      </div>
                      {entry.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {entry.description}
                        </p>
                      )}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map((t) => (
                            <span
                              key={t}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a
                        href={`/tecxbook/${entry.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-200"
                      >
                        View
                      </a>
                      <button
                        onClick={() => startEdit(entry)}
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.slug)}
                        className="bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-sm hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TecxbookAdminPage() {
  return (
    <AdminShell title="Tecxbook">
      <TecxbookManager />
    </AdminShell>
  )
}
