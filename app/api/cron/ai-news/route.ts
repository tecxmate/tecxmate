import { NextRequest, NextResponse } from "next/server"
import { createDailyAiNewsPost } from "@/lib/ai-news-agent"
import { readStoredBlogPosts, upsertStoredBlogPost } from "@/lib/blog-store"
import { shareBlogPostToSocials } from "@/lib/social-share"

export const dynamic = "force-dynamic"
export const maxDuration = 60

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim()
  const authHeader = request.headers.get("authorization")
  const userAgent = request.headers.get("user-agent") || ""

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true
  if (!cronSecret && process.env.NODE_ENV !== "production" && userAgent.includes("vercel-cron/1.0")) return true

  const manualSecret = request.nextUrl.searchParams.get("secret")
  return Boolean(cronSecret && manualSecret === cronSecret)
}

async function run(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const todayPrefix = `ai-industry-brief-${now.toISOString().slice(0, 10)}`
  const force = request.nextUrl.searchParams.get("force") === "1"
  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1"

  const existing = await readStoredBlogPosts()
  const existingToday = existing.find((post) => post.slug.startsWith(todayPrefix))

  if (existingToday && !force && !dryRun) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Daily AI news post already exists.",
      slug: existingToday.slug,
    })
  }

  const post = await createDailyAiNewsPost(now)

  if (dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, post })
  }

  if (existingToday && force) {
    post.slug = existingToday.slug
    post.id = existingToday.id
    post.publishedAt = existingToday.publishedAt
  }

  await upsertStoredBlogPost(post)
  const socialShareResults = await shareBlogPostToSocials(post)

  return NextResponse.json({
    ok: true,
    slug: post.slug,
    title: post.title,
    sourceCount: post.sourceUrls?.length ?? 0,
    socialShareResults,
  })
}

export async function GET(request: NextRequest) {
  try {
    return await run(request)
  } catch (error) {
    console.error("[cron/ai-news] failed", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate AI news post" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
