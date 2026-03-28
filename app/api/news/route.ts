import { NextResponse } from "next/server"
import { XMLParser } from "fast-xml-parser"
import type { NewsItem } from "@/lib/news-types"

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
})

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, "")).trim()
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).replace(/\s+\S*$/, "") + "..."
}

/** Extract first image src from HTML content */
function extractImageFromHtml(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/)
  return match?.[1] || null
}

/** Get a thumbnail for a URL via Google's favicon service or og:image proxy */
function getThumbnailForUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  } catch {
    return ""
  }
}

async function fetchArsTechinica(): Promise<NewsItem[]> {
  const res = await fetch("https://feeds.arstechnica.com/arstechnica/index", {
    next: { revalidate: 1800 },
    headers: { "User-Agent": "Tecxmate/1.0 (news aggregator)" },
  })
  if (!res.ok) return []

  const xml = await res.text()
  const data = parser.parse(xml)
  const items = data?.rss?.channel?.item
  if (!Array.isArray(items)) return []

  return items.slice(0, 8).map((item: any, i: number) => {
    const imageUrl =
      item["media:content"]?.["@_url"] ||
      item["media:thumbnail"]?.["@_url"] ||
      item?.enclosure?.["@_url"] ||
      extractImageFromHtml(item.description || item["content:encoded"] || "") ||
      null

    return {
      id: `ars-${i}`,
      title: decodeEntities(item.title || ""),
      excerpt: truncate(stripHtml(item.description || ""), 120),
      date: new Date(item.pubDate).toISOString(),
      source: "Ars Technica" as const,
      url: item.link || "",
      imageUrl,
    }
  })
}

async function fetchTheVerge(): Promise<NewsItem[]> {
  const res = await fetch("https://www.theverge.com/rss/index.xml", {
    next: { revalidate: 1800 },
    headers: { "User-Agent": "Tecxmate/1.0 (news aggregator)" },
  })
  if (!res.ok) return []

  const xml = await res.text()
  const data = parser.parse(xml)

  const entries = data?.feed?.entry
  if (!Array.isArray(entries)) return []

  return entries.slice(0, 8).map((entry: any, i: number) => {
    const link = Array.isArray(entry.link)
      ? entry.link.find((l: any) => l["@_rel"] === "alternate")?.["@_href"] || entry.link[0]?.["@_href"]
      : entry.link?.["@_href"] || entry.link || ""

    const content = entry.content?.["#text"] || entry.content || entry.summary || ""
    const imageUrl =
      entry["media:thumbnail"]?.["@_url"] ||
      entry["media:content"]?.["@_url"] ||
      extractImageFromHtml(typeof content === "string" ? content : "") ||
      null

    return {
      id: `verge-${i}`,
      title: decodeEntities(typeof entry.title === "string" ? entry.title : entry.title?.["#text"] || ""),
      excerpt: truncate(stripHtml(typeof content === "string" ? content : ""), 120),
      date: new Date(entry.updated || entry.published).toISOString(),
      source: "The Verge" as const,
      url: link,
      imageUrl,
    }
  })
}

async function fetchHackerNews(): Promise<NewsItem[]> {
  const res = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
    next: { revalidate: 1800 },
  })
  if (!res.ok) return []

  const ids: number[] = await res.json()
  const top10 = ids.slice(0, 10)

  const stories = await Promise.all(
    top10.map(async (id) => {
      try {
        const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
          next: { revalidate: 1800 },
        })
        return r.ok ? r.json() : null
      } catch {
        return null
      }
    })
  )

  return stories
    .filter((s): s is any => s && s.url && s.title)
    .map((s) => ({
      id: `hn-${s.id}`,
      title: s.title,
      excerpt: `${s.score} points · ${s.descendants || 0} comments`,
      date: new Date(s.time * 1000).toISOString(),
      source: "Hacker News" as const,
      url: s.url,
      imageUrl: null,
    }))
}

const fallbackNews: NewsItem[] = [
  {
    id: "fallback-1",
    title: "The Latest in AI and Machine Learning",
    excerpt: "Keeping up with the rapidly evolving world of artificial intelligence.",
    date: new Date().toISOString(),
    source: "Ars Technica",
    url: "https://arstechnica.com/ai/",
    imageUrl: null,
  },
  {
    id: "fallback-2",
    title: "What's New in Tech This Week",
    excerpt: "A roundup of the biggest stories in technology.",
    date: new Date().toISOString(),
    source: "The Verge",
    url: "https://www.theverge.com/tech",
    imageUrl: null,
  },
  {
    id: "fallback-3",
    title: "Top Stories on Hacker News",
    excerpt: "The most discussed topics in the developer community.",
    date: new Date().toISOString(),
    source: "Hacker News",
    url: "https://news.ycombinator.com/",
    imageUrl: null,
  },
]

export async function GET() {
  try {
    const [ars, verge, hn] = await Promise.all([
      fetchArsTechinica().catch(() => []),
      fetchTheVerge().catch(() => []),
      fetchHackerNews().catch(() => []),
    ])

    const all = [...ars, ...verge, ...hn]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 12)

    if (all.length === 0) {
      return NextResponse.json(fallbackNews)
    }

    return NextResponse.json(all)
  } catch {
    return NextResponse.json(fallbackNews)
  }
}
