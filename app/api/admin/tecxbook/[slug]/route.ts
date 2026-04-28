import { NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin-auth"
import {
  readIndex,
  writeIndex,
  deleteFile,
  uploadHtml,
} from "@/lib/tecxbook"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ slug: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

  entries[idx] = next
  await writeIndex(entries)
  return NextResponse.json(next)
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { slug } = await params

  const entries = await readIndex()
  const target = entries.find((e) => e.slug === slug)
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  await deleteFile(target.file)
  await writeIndex(entries.filter((e) => e.slug !== slug))
  return NextResponse.json({ ok: true })
}
