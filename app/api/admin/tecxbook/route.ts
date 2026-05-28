import { NextRequest, NextResponse } from "next/server"
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth"
import {
  readIndex,
  writeIndex,
  uploadHtml,
  isBlobConfigured,
  slugify,
  type TecxbookEntry,
} from "@/lib/tecxbook"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server." },
      { status: 503 },
    )
  }
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    )
  }
  if (!isBlobConfigured()) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured on the server." },
      { status: 503 },
    )
  }

  const form = await request.formData()
  const file = form.get("file")
  const title = String(form.get("title") ?? "").trim()
  const description = String(form.get("description") ?? "").trim()
  const slugInput = String(form.get("slug") ?? "").trim()
  const tagsInput = String(form.get("tags") ?? "").trim()
  const cover = String(form.get("cover") ?? "").trim() || undefined

  // Admin login probe sends an empty form. Treat this as a valid auth check.
  if (
    file === null &&
    !title &&
    !description &&
    !slugInput &&
    !tagsInput &&
    !cover
  ) {
    return NextResponse.json({ ok: true })
  }

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 })
  }
  if (!file.type.includes("html") && !file.type.includes("text/")) {
    return NextResponse.json(
      { error: `Expected an HTML file (got ${file.type || "unknown"})` },
      { status: 400 },
    )
  }
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const slug = slugify(slugInput || title)
  if (!slug) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 })
  }

  const entries = await readIndex()
  if (entries.some((e) => e.slug === slug)) {
    return NextResponse.json(
      { error: `Slug "${slug}" already exists` },
      { status: 409 },
    )
  }

  try {
    const { url } = await uploadHtml(slug, file)
    const now = Date.now()
    const entry: TecxbookEntry = {
      slug,
      title,
      description,
      file: url,
      cover,
      tags: tagsInput ? tagsInput.split(",").map((t) => t.trim()).filter(Boolean) : [],
      createdAt: now,
      updatedAt: now,
    }
    await writeIndex([entry, ...entries])
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error("[/api/admin/tecxbook] upload failed", error)
    return NextResponse.json({ error: "Failed to save artifact" }, { status: 500 })
  }
}
