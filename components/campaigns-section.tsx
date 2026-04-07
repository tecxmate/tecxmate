"use client"

import { useState, useEffect } from "react"
import { Calendar, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import type { WPBlogPost as BlogPost } from "@/lib/wordpress"

export function CampaignsSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const { language, t } = useLanguage()

  useEffect(() => {
    let mounted = true
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/blog/posts?lang=${encodeURIComponent(language)}`)
        if (!response.ok) throw new Error(`Failed: ${response.status}`)
        const data = await response.json()
        if (mounted) {
          setPosts(data.slice(0, 3)) // Show top 3 recent posts
          setLoading(false)
        }
      } catch (err) {
        console.error("Error fetching blog posts for campaigns:", err)
        if (mounted) {
          setPosts([])
          setLoading(false)
        }
      }
    }

    fetchPosts()

    return () => { mounted = false }
  }, [language])

  if (loading) {
    return (
      <section id="campaigns" className="bg-gray-50/80 py-24 md:py-28 lg:py-32">
        <div className="container px-4 md:px-6 max-w-7xl text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        </div>
      </section>
    )
  }

  if (posts.length === 0) return null

  return (
    <section id="campaigns" className="bg-gray-50/80 py-24 md:py-28 lg:py-32">
      <div className="container px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-gray-900 mb-4" suppressHydrationWarning>
              {t("news_insights")}
            </h2>
            <p className="text-gray-600 text-lg">
              {t("news_insights_subtitle")}
            </p>
          </div>
          <Link 
            href="/blog" 
            className="inline-flex items-center text-primary font-semibold hover:underline group"
          >
            {t("view_all_posts")}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col"
            >
              <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage || "/placeholder.svg?height=200&width=400"}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/95 px-3 py-1 text-xs font-semibold text-primary shadow-sm uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                  {post.excerpt}
                </p>
                <div className="inline-flex items-center text-sm font-bold text-primary group-hover:gap-2 transition-all">
                  <span>{t("read_full_article")}</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
