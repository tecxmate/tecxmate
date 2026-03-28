"use client"

import { useState, useEffect } from "react"
import { Calendar, ExternalLink } from "lucide-react"
import type { NewsItem } from "@/lib/news-types"

const SOURCE_STYLES: Record<string, string> = {
  "Ars Technica": "bg-green-100 text-green-700",
  "The Verge": "bg-purple-100 text-purple-700",
  "Hacker News": "bg-orange-100 text-orange-700",
}

const SOURCE_PLACEHOLDER_BG: Record<string, string> = {
  "Ars Technica": "bg-green-600",
  "The Verge": "bg-purple-600",
  "Hacker News": "bg-orange-500",
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return ""
  }
}

export function CampaignsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchNews = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        if (!mounted) return

        const response = await fetch("/api/news")
        if (!response.ok) throw new Error(`Failed: ${response.status}`)
        const data = await response.json()
        if (mounted) {
          setNews(data.slice(0, 6))
          setLoading(false)
        }
      } catch {
        if (mounted) {
          setNews([])
          setLoading(false)
        }
      }
    }

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(fetchNews, { timeout: 3000 })
    } else {
      setTimeout(fetchNews, 1000)
    }

    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <section id="campaigns" className="bg-gray-50/80 py-24 md:py-28 lg:py-32">
        <div className="container px-4 md:px-6 max-w-7xl">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="campaigns" className="bg-gray-50/80 py-24 md:py-28 lg:py-32">
      <div className="container px-4 md:px-6 max-w-7xl">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-gray-900">
            Tech News
          </h2>
        </div>

        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-none border border-gray-200 bg-white shadow-sm overflow-hidden h-full hover:border-primary hover:shadow-md transition-all duration-300"
              >
                {item.imageUrl ? (
                  <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className={`aspect-video w-full flex items-center justify-center ${SOURCE_PLACEHOLDER_BG[item.source] || "bg-gray-400"}`}>
                    <span className="text-white/80 text-2xl font-bold tracking-wide">{item.source}</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="mb-2">
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium ${SOURCE_STYLES[item.source] || "bg-gray-100 text-gray-700"}`}>
                      {item.source}
                    </span>
                  </div>
                  <div className="mb-3 flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.date)}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {item.excerpt}
                  </p>
                  <div className="inline-flex items-center text-sm font-medium text-primary">
                    <span>Read Article</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No news available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  )
}
