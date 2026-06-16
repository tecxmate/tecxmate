import { NextRequest, NextResponse } from "next/server"
import { collectAiNewsSources, createDailyAiNewsPost, type AiNewsLanguage } from "@/lib/ai-news-agent"
import { readStoredBlogPosts, upsertStoredBlogPost } from "@/lib/blog-store"
import { shareBlogPostToSocials } from "@/lib/social-share"

export const dynamic = "force-dynamic"
export const maxDuration = 300

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim()
  const authHeader = request.headers.get("authorization")
  const userAgent = request.headers.get("user-agent") || ""

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true
  if (!cronSecret && process.env.NODE_ENV !== "production" && userAgent.includes("vercel-cron/1.0")) return true

  const manualSecret = request.nextUrl.searchParams.get("secret")
  return Boolean(cronSecret && manualSecret === cronSecret)
}

function normalizeLanguage(value: string): AiNewsLanguage | null {
  const language = value.trim().toLowerCase()
  if (language === "en" || language === "english") return "en"
  if (language === "zh" || language === "zh-tw" || language === "traditional-chinese" || language === "tc") return "zh"
  if (language === "vi" || language === "vn" || language === "vietnamese") return "vi"
  return null
}

function requestedLanguages(request: NextRequest): AiNewsLanguage[] {
  const raw =
    request.nextUrl.searchParams.get("languages") ||
    request.nextUrl.searchParams.get("lang") ||
    process.env.AI_NEWS_LANGUAGES ||
    "en,zh,vi"

  if (raw.trim().toLowerCase() === "all") return ["en", "zh", "vi"]

  const languages = raw
    .split(",")
    .map(normalizeLanguage)
    .filter((language): language is AiNewsLanguage => Boolean(language))

  return Array.from(new Set(languages.length > 0 ? languages : ["en", "zh", "vi"]))
}

async function run(request: NextRequest) {
  if (process.env.AI_NEWS_ENABLED !== "true") {
    return NextResponse.json(
      { error: "AI news automation is disabled." },
      { status: 410 },
    )
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const datePrefix = `ai-industry-brief-${now.toISOString().slice(0, 10)}`
  const force = request.nextUrl.searchParams.get("force") === "1"
  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1"
  const languages = requestedLanguages(request)

  const existing = await readStoredBlogPosts()
  const sources = await collectAiNewsSources()
  const results = []

  for (const language of languages) {
    const todayPrefix = `${datePrefix}-${language}`
    const existingToday = existing.find((post) => post.language === language && post.slug.startsWith(todayPrefix))

    if (existingToday && !force && !dryRun) {
      results.push({
        language,
        skipped: true,
        reason: "Daily AI news post already exists.",
        slug: existingToday.slug,
      })
      continue
    }

    const post = await createDailyAiNewsPost(now, language, sources)

    if (dryRun) {
      results.push({ language, dryRun: true, post })
      continue
    }

    if (existingToday && force) {
      post.slug = existingToday.slug
      post.id = existingToday.id
      post.publishedAt = existingToday.publishedAt
    }

    await upsertStoredBlogPost(post)
    const socialShareResults = await shareBlogPostToSocials(post)

    results.push({
      language,
      slug: post.slug,
      title: post.title,
      sourceCount: post.sourceUrls?.length ?? 0,
      socialShareResults,
    })
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    languages,
    results,
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
