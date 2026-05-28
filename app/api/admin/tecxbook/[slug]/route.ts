import { NextRequest, NextResponse } from "next/server"
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth"
import {
  readIndex,
  writeIndex,
  deleteFile,
  uploadHtml,
  isBlobConfigured,
} from "@/lib/tecxbook"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ slug: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server." },
      { status: 503 },
    )
  }
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isBlobConfigured()) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured on the server." },
      { status: 503 },
    )
  }
  const { slug } = await params

  const form = await request.formData()
  const title = form.get("title")
  const description = form.get("description")
  const tagsInput = form.get("tags")
  const cover = form.get("cover")
  const file = form.get("file")

  const entries = await readIndex()
  const idx = entries.findIndex((e) => e.slug === slug)
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const current = entries[idx]
  const next = { ...current, updatedAt: Date.now() }

  if (typeof title === "string" && title.trim()) next.title = title.trim()
  if (typeof description === "string") next.description = description.trim()
  if (typeof cover === "string") next.cover = cover.trim() || undefined
  if (typeof tagsInput === "string") {
    next.tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  }

  if (file instanceof Blob && file.size > 0) {
    if (!file.type.includes("html") && !file.type.includes("text/")) {
      return NextResponse.json(
        { error: `Expected an HTML file (got ${file.type || "unknown"})` },
        { status: 400 },
      )
    }
    const oldUrl = current.file
    const { url } = await uploadHtml(slug, file)
    next.file = url
    await deleteFile(oldUrl)
  }

  try {
    entries[idx] = next
    await writeIndex(entries)
    return NextResponse.json(next)
  } catch (error) {
    console.error("[/api/admin/tecxbook/:slug] update failed", error)
    return NextResponse.json({ error: "Failed to update artifact" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server." },
      { status: 503 },
    )
  }
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isBlobConfigured()) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured on the server." },
      { status: 503 },
    )
  }
  const { slug } = await params

  const entries = await readIndex()
  const target = entries.find((e) => e.slug === slug)
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  try {
    await deleteFile(target.file)
    await writeIndex(entries.filter((e) => e.slug !== slug))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[/api/admin/tecxbook/:slug] delete failed", error)
    return NextResponse.json({ error: "Failed to delete artifact" }, { status: 500 })
  }
}
