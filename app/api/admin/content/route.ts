import { NextRequest, NextResponse } from "next/server"
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth"
import {
  readContent,
  writeContent,
  uploadImage,
  isBlobConfigured,
  type SiteContent,
} from "@/lib/site-content"

export const dynamic = "force-dynamic"

function guard(request: NextRequest): NextResponse | null {
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
  return null
}

// GET — authoritative current content (admin editor convenience).
export async function GET(request: NextRequest) {
  const blocked = guard(request)
  if (blocked) return blocked
  return NextResponse.json(await readContent())
}

// PUT — overwrite content. Body merges over current so partial section writes are allowed.
export async function PUT(request: NextRequest) {
  const blocked = guard(request)
  if (blocked) return blocked

  let body: Partial<SiteContent>
  try {
    body = (await request.json()) as Partial<SiteContent>
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const current = await readContent()
  const next: SiteContent = { ...current, ...body }

  try {
    await writeContent(next)
    return NextResponse.json(next)
  } catch (error) {
    console.error("[/api/admin/content] write failed", error)
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 })
  }
}

// POST — multipart image upload (returns { url }). Empty form acts as the login probe.
export async function POST(request: NextRequest) {
  const blocked = guard(request)
  if (blocked) return blocked

  const form = await request.formData()
  const file = form.get("file")

  // Login probe: empty form is a valid auth check.
  if (file === null) {
    return NextResponse.json({ ok: true })
  }

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 })
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: `Expected an image (got ${file.type || "unknown"})` },
      { status: 400 },
    )
  }
  const prefix = String(form.get("prefix") ?? "img").trim() || "img"

  try {
    const { url } = await uploadImage(prefix, file)
    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    console.error("[/api/admin/content] image upload failed", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
