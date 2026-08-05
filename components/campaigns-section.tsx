"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { BLOG_CATEGORY_TABS, postsForTab, type BlogCategoryTabId } from "@/lib/blog-categories"
import type { WPBlogPost as BlogPost } from "@/lib/wordpress"

/** Posts shown per tab before the visitor is sent to the full blog listing. */
const POSTS_PER_TAB = 3

export function CampaignsSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  // null until the visitor picks a tab, so the default can follow the data.
  const [selectedTabId, setSelectedTabId] = useState<BlogCategoryTabId | null>(null)
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
          setPosts(data)
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

  // One bucket per tab, computed once so the tab bar can show counts and the
  // default tab can skip over categories that have nothing published yet.
  const postsByTab = useMemo(
    () =>
      BLOG_CATEGORY_TABS.map((tab) => {
        const matched = postsForTab(posts, tab)
        // `total` is what the tab badge reports: the cap is a display limit,
        // so counting after slicing would understate a busy category.
        return { tab, posts: matched.slice(0, POSTS_PER_TAB), total: matched.length }
      }),
    [posts],
  )

  const activeTabId =
    selectedTabId ?? postsByTab.find((entry) => entry.posts.length > 0)?.tab.id ?? BLOG_CATEGORY_TABS[0].id
  const activePosts = postsByTab.find((entry) => entry.tab.id === activeTabId)?.posts ?? []

  if (loading) {
    return (
      <section id="campaigns" className="bg-muted py-24 md:py-28 lg:py-32">
        <div className="container px-4 md:px-6 max-w-7xl text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        </div>
      </section>
    )
  }

  // Nothing categorised into any of the three tabs — hide the section entirely
  // rather than render an empty shell.
  if (postsByTab.every((entry) => entry.posts.length === 0)) return null

  return (
    <section id="campaigns" className="bg-muted py-24 md:py-28 lg:py-32">
      <div className="container px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl tracking-tight text-foreground mb-4" suppressHydrationWarning>
              {t("news_insights")}
            </h2>
            <p className="text-muted-foreground text-lg">
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

        <div
          role="tablist"
          aria-label={t("news_insights")}
          className="flex flex-wrap gap-2 border-b border-border mb-10"
        >
          {postsByTab.map(({ tab, total }) => {
            const isActive = tab.id === activeTabId
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`campaigns-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`campaigns-panel-${tab.id}`}
                onClick={() => setSelectedTabId(tab.id)}
                className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold tracking-wide transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span suppressHydrationWarning>{t(tab.labelKey)}</span>
                <span className="ml-2 text-xs font-normal text-muted-foreground">{total}</span>
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`campaigns-panel-${activeTabId}`}
          aria-labelledby={`campaigns-tab-${activeTabId}`}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {activePosts.length === 0 && (
            <p className="text-muted-foreground md:col-span-2 lg:col-span-3" suppressHydrationWarning>
              {t("blog_tab_empty")}
            </p>
          )}
          {activePosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block bg-card border border-border shadow-sm overflow-hidden hover:shadow-md hover:border-primary transition-all duration-300 h-full flex flex-col"
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
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
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
