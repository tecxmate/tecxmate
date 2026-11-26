import { putStored, readStoredJSON, storageConfigured } from "./storage"
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
  return storageConfigured()
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
  const raw = await readStoredJSON<Partial<BlogPostStore> | StoredBlogPost[]>(BLOG_POSTS_PATHNAME, opts)
  if (!raw) return []
  return normalizeStore(raw)
    .posts.filter((post) => post?.slug && post?.title)
    .sort((a, b) => Date.parse(b.publishedAt || b.updatedAt) - Date.parse(a.publishedAt || a.updatedAt))
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

  await putStored(BLOG_POSTS_PATHNAME, JSON.stringify({ posts: next }, null, 2), "application/json", {
    cacheSeconds: 60,
  })

  return next
}
