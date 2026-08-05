"use client"

import { useState, useEffect } from "react"
import { Calendar, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { BLOG_CATEGORY_TABS, postsForTab, type BlogCategoryTab } from "@/lib/blog-categories"
import type { WPBlogPost as BlogPost } from "@/lib/wordpress"

/** Posts shown per row before the visitor is sent to the full blog listing. */
const POSTS_PER_ROW = 3

/**
 * The three category rows sit in different places on the homepage but read the
 * same endpoint, so the request is shared: without this the page would fetch
 * an identical post list three times on load.
 */
const postsByLanguage = new Map<string, Promise<BlogPost[]>>()

function loadPosts(language: string): Promise<BlogPost[]> {
  const cached = postsByLanguage.get(language)
  if (cached) return cached

  const request = fetch(`/api/blog/posts?lang=${encodeURIComponent(language)}`)
    .then((res) => (res.ok ? res.json() : []))
    .catch(() => [])

  postsByLanguage.set(language, request)
  return request
}

function tabById(id: (typeof BLOG_CATEGORY_TABS)[number]["id"]): BlogCategoryTab {
  return BLOG_CATEGORY_TABS.find((tab) => tab.id === id) ?? BLOG_CATEGORY_TABS[0]
}

function PostCard({ post, readLabel }: { post: BlogPost; readLabel: string }) {
  return (
    <Link
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
        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">{post.excerpt}</p>
        <div className="inline-flex items-center text-sm font-bold text-primary group-hover:gap-2 transition-all">
          <span>{readLabel}</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </div>
      </div>
    </Link>
  )
}

/** One category as a single row of posts, headed by the category name. */
function BlogCategoryRow({ tab, className }: { tab: BlogCategoryTab; className: string }) {
  const [posts, setPosts] = useState<BlogPost[] | null>(null)
  const { language, t } = useLanguage()

  useEffect(() => {
    let mounted = true
    loadPosts(language).then((all) => {
      if (mounted) setPosts(postsForTab(all, tab).slice(0, POSTS_PER_ROW))
    })
    return () => {
      mounted = false
    }
  }, [language, tab])

  // A category with nothing published stays out of the page entirely, rather
  // than leaving an empty heading behind.
  if (posts && posts.length === 0) return null

  return (
    <section id={`blog-${tab.id}`} className={className}>
      <div className="container px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <h2
            className="text-3xl font-semibold md:text-4xl tracking-tight text-foreground"
            suppressHydrationWarning
          >
            {t(tab.labelKey)}
          </h2>
          <Link
            href="/blog"
            className="inline-flex items-center text-primary font-semibold hover:underline group"
          >
            {t("view_all_posts")}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts === null
            ? // Reserve the row's height while loading so the sections below
              // it do not jump once the posts arrive.
              Array.from({ length: POSTS_PER_ROW }, (_, i) => (
                <div key={i} className="h-[26rem] bg-card border border-border animate-pulse" />
              ))
            : posts.map((post) => (
                <PostCard key={post.id} post={post} readLabel={t("read_full_article")} />
              ))}
        </div>
      </div>
    </section>
  )
}

export function StoriesSection() {
  return <BlogCategoryRow tab={tabById("our-stories")} className="bg-background py-20 md:py-24" />
}

export function ProductsSection() {
  return <BlogCategoryRow tab={tabById("our-products")} className="bg-muted py-20 md:py-24" />
}

export function CampaignsSection() {
  return <BlogCategoryRow tab={tabById("industry-news")} className="bg-muted py-20 md:py-24" />
}
