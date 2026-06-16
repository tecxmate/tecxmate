import { XMLParser } from "fast-xml-parser"
import { z } from "zod"
import type { StoredBlogPost } from "./blog-store"

type NewsSource = {
  title: string
  url: string
  publishedAt?: string
  source: string
  summary?: string
}

export type AiNewsLanguage = StoredBlogPost["language"]

const LANGUAGE_INSTRUCTIONS: Record<AiNewsLanguage, string> = {
  en: "English",
  zh: "Traditional Chinese for Taiwan readers",
  vi: "Vietnamese",
}

const DEFAULT_FEEDS = [
  "https://techcrunch.com/category/artificial-intelligence/feed/",
  "https://techcrunch.com/category/startups/feed/",
  "https://venturebeat.com/category/ai/feed/",
  "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  "https://openai.com/news/rss.xml",
]

export const generatedPostSchema = z.object({
  title: z.string().min(8).max(120),
  excerpt: z.string().min(40).max(220),
  keyTakeaways: z.array(z.string().min(10).max(180)).min(3).max(6),
  sections: z.array(
    z.object({
      heading: z.string().min(4).max(90),
      paragraphs: z.array(z.string().min(40).max(700)).min(1).max(3),
    }),
  ).min(3).max(5),
  tags: z.array(z.string().min(2).max(32)).min(3).max(8),
  citations: z.array(
    z.object({
      title: z.string().min(3).max(180),
      url: z.string().url(),
    }),
  ).min(3).max(8),
})

export type GeneratedPost = z.infer<typeof generatedPostSchema>

function envList(name: string, fallback: string[]): string[] {
  const raw = process.env[name]?.trim()
  if (!raw) return fallback

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function stripHtml(value = ""): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function text(value: unknown): string {
  if (typeof value === "string") return stripHtml(value)
  if (value && typeof value === "object" && "#text" in value) return stripHtml(String(value["#text" as keyof typeof value]))
  return ""
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function normalizeUrl(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).toString()
  } catch {
    return null
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function estimateReadTime(html: string): string {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

function toContentHtml(post: GeneratedPost): string {
  const takeaways = post.keyTakeaways
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")

  const sections = post.sections
    .map((section) => {
      const paragraphs = section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")
      return `<h2>${escapeHtml(section.heading)}</h2>${paragraphs}`
    })
    .join("")

  return [
    `<p>${escapeHtml(post.excerpt)}</p>`,
    "<h2>Key takeaways</h2>",
    `<ul>${takeaways}</ul>`,
    sections,
  ].join("")
}

function toCitationsHtml(citations: GeneratedPost["citations"]): string {
  return `<ol>${citations
    .map((citation) => `<li><a href="${escapeHtml(citation.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(citation.title)}</a></li>`)
    .join("")}</ol>`
}

function getTodaySlug(now: Date): string {
  return now.toISOString().slice(0, 10)
}

function languageTag(language: AiNewsLanguage): string {
  if (language === "vi") return "vi"
  if (language === "zh") return "zh"
  return "en"
}

function getItemDate(item: any): string | undefined {
  const raw = item.isoDate || item.pubDate || item.published || item.updated || item["dc:date"]
  if (!raw) return undefined
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

async function fetchFeed(feedUrl: string): Promise<NewsSource[]> {
  const res = await fetch(feedUrl, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
      "User-Agent": "Tecxmate AI news agent",
    },
    next: { revalidate: 900 },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch ${feedUrl}: ${res.status}`)
  }

  const xml = await res.text()
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" })
  const parsed = parser.parse(xml)
  const channel = parsed.rss?.channel ?? parsed.feed
  const sourceName = text(channel?.title) || new URL(feedUrl).hostname
  const items = asArray<any>(channel?.item ?? channel?.entry).slice(0, 12)

  return items
    .map((item) => {
      const link =
        typeof item.link === "string"
          ? item.link
          : Array.isArray(item.link)
            ? item.link.find((candidate: any) => candidate?.href)?.href
            : item.link?.href
      const url = normalizeUrl(link || item.guid)

      return {
        title: text(item.title),
        url: url ?? "",
        publishedAt: getItemDate(item),
        source: sourceName,
        summary: text(item.description || item.summary || item.content || item["content:encoded"]).slice(0, 500),
      }
    })
    .filter((item) => item.title && item.url)
}

export async function collectAiNewsSources(): Promise<NewsSource[]> {
  const feeds = envList("AI_NEWS_FEEDS", DEFAULT_FEEDS)
  const settled = await Promise.allSettled(feeds.map((feed) => fetchFeed(feed)))
  const unique = new Map<string, NewsSource>()

  for (const result of settled) {
    if (result.status !== "fulfilled") continue
    for (const item of result.value) {
      unique.set(item.url, item)
    }
  }

  return Array.from(unique.values())
    .sort((a, b) => Date.parse(b.publishedAt ?? "0") - Date.parse(a.publishedAt ?? "0"))
    .slice(0, 30)
}

function buildPrompt(sources: NewsSource[], now: Date, language: AiNewsLanguage): string {
  const sourceBlock = sources
    .map((source, index) => {
      return [
        `${index + 1}. ${source.title}`,
        `Source: ${source.source}`,
        `URL: ${source.url}`,
        source.publishedAt ? `Published: ${source.publishedAt}` : null,
        source.summary ? `Summary: ${source.summary}` : null,
      ].filter(Boolean).join("\n")
    })
    .join("\n\n")

  return `Today is ${now.toISOString().slice(0, 10)}.

Write a concise automated news article for Tecxmate about AI startups and AI industry news.
The article must be written in ${LANGUAGE_INSTRUCTIONS[language]}.

Rules:
- Use only the supplied source list. Do not invent companies, funding rounds, dates, or claims.
- Focus on what founders, SME owners, and product teams should understand.
- Mention uncertainty when the supplied sources do not support a stronger claim.
- Return JSON only with this shape: title, excerpt, keyTakeaways, sections, tags, citations.
- Citations must use URLs from the supplied sources.

Sources:
${sourceBlock}`
}

function extractOpenAiText(data: any): string {
  if (typeof data.output_text === "string") return data.output_text

  const chunks: string[] = []
  for (const output of data.output ?? []) {
    for (const content of output.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        chunks.push(content.text)
      }
    }
  }
  return chunks.join("\n")
}

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "excerpt", "keyTakeaways", "sections", "tags", "citations"],
  properties: {
    title: { type: "string" },
    excerpt: { type: "string" },
    keyTakeaways: { type: "array", items: { type: "string" } },
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["heading", "paragraphs"],
        properties: {
          heading: { type: "string" },
          paragraphs: { type: "array", items: { type: "string" } },
        },
      },
    },
    tags: { type: "array", items: { type: "string" } },
    citations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "url"],
        properties: {
          title: { type: "string" },
          url: { type: "string" },
        },
      },
    },
  },
}

function parseGeneratedPostJson(content: string): GeneratedPost {
  const trimmed = content.trim()
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
  return generatedPostSchema.parse(JSON.parse(withoutFence))
}

async function generateWithOpenAi(prompt: string): Promise<GeneratedPost> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.")

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_NEWS_MODEL || "gpt-5.5",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "daily_ai_news_article",
          strict: true,
          schema: jsonSchema,
        },
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`OpenAI response failed: ${res.status} ${await res.text()}`)
  }

  const content = extractOpenAiText(await res.json())
  return parseGeneratedPostJson(content)
}

async function generateWithAnthropic(prompt: string): Promise<GeneratedPost> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.")

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_NEWS_MODEL || "claude-sonnet-4-5",
      max_tokens: 2500,
      system: "You are an editorial assistant that returns valid JSON only.",
      messages: [{ role: "user", content: prompt }],
    }),
  })

  if (!res.ok) {
    throw new Error(`Anthropic response failed: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  const content = data.content?.map((part: any) => part.text ?? "").join("\n") ?? ""
  return parseGeneratedPostJson(content)
}

function extractGeminiText(data: any): string {
  return data.candidates?.[0]?.content?.parts
    ?.map((part: any) => part.text ?? "")
    .join("\n") ?? ""
}

async function generateWithGemini(prompt: string): Promise<GeneratedPost> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.")

  const model = process.env.AI_NEWS_MODEL || "gemini-3.5-flash"
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseFormat: {
            text: {
              mimeType: "application/json",
              schema: jsonSchema,
            },
          },
          temperature: 0.2,
        },
      }),
    },
  )

  if (!res.ok) {
    throw new Error(`Gemini response failed: ${res.status} ${await res.text()}`)
  }

  const content = extractGeminiText(await res.json())
  return parseGeneratedPostJson(content)
}

async function generatePost(prompt: string): Promise<GeneratedPost> {
  const provider = (process.env.AI_NEWS_PROVIDER || "gemini").toLowerCase()
  if (provider === "gemini" || provider === "google") return generateWithGemini(prompt)
  if (provider === "anthropic") return generateWithAnthropic(prompt)
  if (provider === "openai") return generateWithOpenAi(prompt)
  throw new Error(`Unsupported AI_NEWS_PROVIDER: ${provider}`)
}

/**
 * Assemble a StoredBlogPost from already-generated structured content.
 *
 * Shared by the RSS+LLM pipeline (createDailyAiNewsPost) and the external
 * publish endpoint (/api/blog/publish) so both produce identical HTML, slugs,
 * and metadata. `source` defaults to "ai-news-agent" for the RSS pipeline;
 * externally-authored posts pass "manual".
 */
export function assembleDailyPost(
  generated: GeneratedPost,
  now: Date = new Date(),
  language: AiNewsLanguage = "en",
  source: StoredBlogPost["source"] = "ai-news-agent",
): StoredBlogPost {
  const content = toContentHtml(generated)
  const slugDate = getTodaySlug(now)
  const slug = `ai-industry-brief-${slugDate}-${language}-${slugify(generated.title)}`

  return {
    id: Number(now.toISOString().replace(/\D/g, "").slice(0, 12)),
    slug,
    title: generated.title,
    excerpt: generated.excerpt,
    date: now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    publishedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    readTime: estimateReadTime(content),
    category: "Automated News",
    coverImage: "/graphics/Strategy & Research.png",
    content,
    tags: Array.from(new Set(["AI", "Startups", "Industry", languageTag(language), ...generated.tags])),
    citations: toCitationsHtml(generated.citations),
    language,
    source,
    sourceUrls: generated.citations.map((citation) => citation.url),
  }
}

export async function createDailyAiNewsPost(
  now = new Date(),
  language: AiNewsLanguage = "en",
  sources?: NewsSource[],
): Promise<StoredBlogPost> {
  const newsSources = sources ?? await collectAiNewsSources()
  if (newsSources.length < 3) {
    throw new Error(`Not enough news sources found. Expected at least 3, got ${newsSources.length}.`)
  }

  const generated = await generatePost(buildPrompt(newsSources, now, language))
  return assembleDailyPost(generated, now, language, "ai-news-agent")
}
