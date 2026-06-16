import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { assembleDailyPost, generatedPostSchema, type AiNewsLanguage } from "@/lib/ai-news-agent"
import { readStoredBlogPosts, upsertStoredBlogPost } from "@/lib/blog-store"
import { shareBlogPostToSocials } from "@/lib/social-share"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 300

/**
 * Authenticated endpoint for publishing an externally-authored daily brief
 * (e.g. from the Cowork scheduled task) into the Vercel Blob blog store.
 *
 * Auth: provide the secret as `Authorization: Bearer <secret>`, an
 * `x-admin-password: <password>` header, or a `?secret=<secret>` query param.
 * Accepted secrets are CRON_SECRET (if set) and any value in ADMIN_PASSWORD.
 *
 * Body: the same structured shape the news agent produces, plus `language`:
 *   { language, title, excerpt, keyTakeaways, sections, tags, citations, force? }
 */

function allowedSecrets(): string[] {
  const secrets: string[] = []
  const cron = process.env.CRON_SECRET?.trim()
  if (cron) secrets.push(cron)
  for (const pwd of (process.env.ADMIN_PASSWORD ?? "").split(",").map((s) => s.trim()).filter(Boolean)) {
    secrets.push(pwd)
  }
  return secrets
}

function isAuthorized(request: NextRequest): boolean {
  const secrets = allowedSecrets()
  if (secrets.length === 0) return false

  const authHeader = request.headers.get("authorization") || ""
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : ""
  const adminHeader = request.headers.get("x-admin-password")?.trim() || ""
  const querySecret = request.nextUrl.searchParams.get("secret")?.trim() || ""

  return [bearer, adminHeader, querySecret].some((value) => value.length > 0 && secrets.includes(value))
}

function normalizeLanguage(value: string): AiNewsLanguage | null {
  const language = value.trim().toLowerCase()
  if (language === "en" || language === "english") return "en"
  if (language === "zh" || language === "zh-tw" || language === "traditional-chinese" || language === "tc") return "zh"
  if (language === "vi" || language === "vn" || language === "vietnamese") return "vi"
  return null
}

const publishSchema = generatedPostSchema.extend({
  language: z.string(),
  force: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = publishSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    )
  }

  const { language: rawLanguage, force, ...generated } = parsed.data
  const language = normalizeLanguage(rawLanguage)
  if (!language) {
    return NextResponse.json(
      { error: `Unsupported language: ${rawLanguage}. Use en, zh, or vi.` },
      { status: 422 },
    )
  }

  const now = new Date()
  const post = assembleDailyPost(generated, now, language, "manual")

  const existing = await readStoredBlogPosts()
  const existingSameSlug = existing.find((item) => item.slug === post.slug)

  if (existingSameSlug && !force) {
    return NextResponse.json(
      { ok: false, skipped: true, reason: "A post with this slug already exists. Pass force:true to overwrite.", slug: post.slug },
      { status: 409 },
    )
  }

  if (existingSameSlug && force) {
    post.id = existingSameSlug.id
    post.publishedAt = existingSameSlug.publishedAt
  }

  try {
    await upsertStoredBlogPost(post)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to store post" },
      { status: 500 },
    )
  }

  let socialShareResults: unknown = []
  try {
    socialShareResults = await shareBlogPostToSocials(post)
  } catch (error) {
    socialShareResults = [{ target: "social", ok: false, error: error instanceof Error ? error.message : "share failed" }]
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tecxmate.com").replace(/\/$/, "")

  return NextResponse.json({
    ok: true,
    language,
    slug: post.slug,
    title: post.title,
    url: `${siteUrl}/blog/${encodeURIComponent(post.slug)}`,
    sourceCount: post.sourceUrls?.length ?? 0,
    socialShareResults,
  })
}
