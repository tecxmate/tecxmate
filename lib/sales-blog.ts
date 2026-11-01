import { z } from "zod"
import { SALES_BLOG_CATEGORY } from "./blog-categories"
import type { StoredBlogPost } from "./blog-store"

/**
 * In-house sales-blog engine.
 *
 * Writer agents (or a human) produce a small, validated JSON object per
 * article — the structured fields only, never raw HTML. `assembleSalesPost`
 * turns that into the same `StoredBlogPost` shape the rest of the blog renders,
 * so sales articles share the listing, post page, RSS feed, and sitemap with
 * every other post. HTML generation lives here and only here, so every article
 * gets the same markup, the same call-to-action, and the same read-time rule.
 *
 * Unlike the RSS news agent (`ai-news-agent.ts`), sales posts carry no external
 * citations — they are first-party marketing — and they default to `draft` so
 * nothing reaches the public site until it is approved.
 */

export const salesSectionSchema = z.object({
  heading: z.string().min(4).max(90),
  paragraphs: z.array(z.string().min(40).max(900)).min(1).max(4),
})

export const salesFaqSchema = z.object({
  q: z.string().min(5).max(180),
  a: z.string().min(10).max(700),
})

export const salesPostSchema = z.object({
  // Stable, human-readable slug. Evergreen sales content keeps its slug for the
  // life of the article, unlike the date-stamped news briefs.
  slug: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case"),
  language: z.enum(["en", "zh", "vi"]).default("en"),
  title: z.string().min(8).max(120),
  excerpt: z.string().min(40).max(220),
  // Absolute http(s) URL or a site-relative path (e.g. "/graphics/foo.png").
  coverImage: z.string().trim().min(1).max(500).optional(),
  keyTakeaways: z.array(z.string().min(10).max(180)).min(3).max(6),
  sections: z.array(salesSectionSchema).min(3).max(6),
  tags: z.array(z.string().min(2).max(32)).min(3).max(8),
  faq: z.array(salesFaqSchema).max(4).optional(),
  // Draft until a human approves it; missing is treated as draft for safety.
  status: z.enum(["draft", "published"]).default("draft"),
  // Optional explicit publish date (ISO). Defaults to now at assembly time.
  publishedAt: z.string().datetime().optional(),
  // Optional override; defaults to the "Guides" sales category.
  category: z.string().trim().min(1).max(60).optional(),
})

export type SalesPostInput = z.input<typeof salesPostSchema>
export type SalesPost = z.infer<typeof salesPostSchema>

const DEFAULT_COVER = "/graphics/Strategy & Research.png"

/** Links come from ASSISTANT.md — the single source of truth for contact channels. */
const CTA = {
  bookCall: "https://cal.com/nikolasdoan/30min",
  quote: "/quote",
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function stripHtml(value = ""): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function estimateReadTime(html: string): string {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

function languageTag(language: SalesPost["language"]): string {
  return language
}

/**
 * The call-to-action appended to every sales article. Writer agents never put
 * links in the body; the single, correct CTA is added here so it cannot drift
 * out of sync with ASSISTANT.md or point at a stale URL.
 */
function ctaHtml(): string {
  return [
    '<h2>Talk to Tecxmate</h2>',
    `<p>Not sure where this fits your business? The first consultation is free. `,
    `<a href="${CTA.bookCall}" target="_blank" rel="noopener noreferrer">Book a 30-minute call</a> `,
    `and we will walk through it with you — or `,
    `<a href="${CTA.quote}">tell us what you need</a> and we will come back with a plan.</p>`,
  ].join("")
}

function faqHtml(faq: SalesPost["faq"]): string {
  if (!faq || faq.length === 0) return ""
  const items = faq
    .map((item) => `<h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p>`)
    .join("")
  return `<h2>Frequently asked</h2>${items}`
}

function toContentHtml(post: SalesPost): string {
  const takeaways = post.keyTakeaways.map((item) => `<li>${escapeHtml(item)}</li>`).join("")

  const sections = post.sections
    .map((section) => {
      const paragraphs = section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("")
      return `<h2>${escapeHtml(section.heading)}</h2>${paragraphs}`
    })
    .join("")

  return [
    `<p>${escapeHtml(post.excerpt)}</p>`,
    "<h2>Key takeaways</h2>",
    `<ul>${takeaways}</ul>`,
    sections,
    faqHtml(post.faq),
    ctaHtml(),
  ]
    .filter(Boolean)
    .join("")
}

/** Deterministic positive integer id from the slug, so rebuilds are stable. */
function stableId(slug: string): number {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 1_000_000_007
  }
  // Keep it comfortably away from the date-derived ids the news agent mints.
  return 900_000_000 + (hash % 99_999_999)
}

/**
 * Build a renderable StoredBlogPost from validated sales input. Accepts either
 * a raw object (validated here) or an already-parsed SalesPost.
 */
export function assembleSalesPost(input: SalesPostInput | SalesPost): StoredBlogPost {
  const post = salesPostSchema.parse(input)
  const content = toContentHtml(post)
  const published = post.publishedAt ? new Date(post.publishedAt) : new Date()

  return {
    id: stableId(post.slug),
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: published.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    publishedAt: published.toISOString(),
    updatedAt: published.toISOString(),
    readTime: estimateReadTime(content),
    category: post.category?.trim() || SALES_BLOG_CATEGORY,
    coverImage: post.coverImage?.trim() || DEFAULT_COVER,
    content,
    tags: Array.from(new Set([...post.tags, languageTag(post.language)])),
    language: post.language,
    source: "sales-blog",
    status: post.status,
    sourceUrls: [],
  }
}
