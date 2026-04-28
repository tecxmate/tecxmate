import { NextRequest, NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin-auth"
import {
  readIndex,
  writeIndex,
  uploadHtml,
  slugify,
  type TecxbookEntry,
} from "@/lib/tecxbook"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get("file")
  const title = String(form.get("title") ?? "").trim()
  const description = String(form.get("description") ?? "").trim()
  const slugInput = String(form.get("slug") ?? "").trim()
  const tagsInput = String(form.get("tags") ?? "").trim()
  const cover = String(form.get("cover") ?? "").trim() || undefined

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
}
