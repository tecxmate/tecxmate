import { list, put } from "@vercel/blob"
import type { WPBlogPost } from "./wordpress"

const BLOG_POSTS_PATHNAME = "blog/posts.json"

export type StoredBlogPost = WPBlogPost & {
  id: number
  publishedAt: string
  updatedAt: string
  language: "en" | "vi" | "zh"
  source: "ai-news-agent" | "manual"
  sourceUrls?: string[]
}

type BlogPostStore = {
  posts: StoredBlogPost[]
}

function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())
}

async function findPostsUrl(): Promise<string | null> {
  if (!isBlobConfigured()) return null

  try {
    const { blobs } = await list({ prefix: BLOG_POSTS_PATHNAME, limit: 1 })
    return blobs[0]?.url ?? null
  } catch {
    return null
  }
}

function normalizeStore(store: Partial<BlogPostStore> | StoredBlogPost[]): BlogPostStore {
  if (Array.isArray(store)) {
    return { posts: store }
  }

  return {
    posts: Array.isArray(store.posts) ? store.posts : [],
  }
}

export async function readStoredBlogPosts(opts?: { revalidate?: number }): Promise<StoredBlogPost[]> {
  const url = await findPostsUrl()
  if (!url) return []

  try {
    const res = await fetch(
      url,
      opts?.revalidate != null ? { next: { revalidate: opts.revalidate } } : { cache: "no-store" },
    )
    if (!res.ok) return []

    const store = normalizeStore((await res.json()) as Partial<BlogPostStore> | StoredBlogPost[])
    return store.posts
      .filter((post) => post?.slug && post?.title)
      .sort((a, b) => Date.parse(b.publishedAt || b.updatedAt) - Date.parse(a.publishedAt || a.updatedAt))
  } catch {
    return []
  }
}

export async function getStoredBlogPostBySlug(slug: string): Promise<StoredBlogPost | null> {
  const posts = await readStoredBlogPosts()
  return posts.find((post) => post.slug === slug) ?? null
}

export async function upsertStoredBlogPost(post: StoredBlogPost): Promise<StoredBlogPost[]> {
  if (!isBlobConfigured()) {
    throw new Error("BLOB storage is not configured: BLOB_READ_WRITE_TOKEN is missing.")
  }

  const current = await readStoredBlogPosts()
  const next = [
    post,
    ...current.filter((existing) => existing.slug !== post.slug),
  ].sort((a, b) => Date.parse(b.publishedAt || b.updatedAt) - Date.parse(a.publishedAt || a.updatedAt))

  await put(BLOG_POSTS_PATHNAME, JSON.stringify({ posts: next }, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  })

  return next
}
