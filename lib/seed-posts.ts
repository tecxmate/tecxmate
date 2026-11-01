import rawSalesPosts from "@/content/blog/sales/posts.json"
import { assembleSalesPost, salesPostSchema } from "./sales-blog"
import type { StoredBlogPost } from "./blog-store"

/**
 * Seed content committed to the repository, assembled at runtime into the same
 * StoredBlogPost shape the Vercel Blob store produces. This is how the in-house
 * blog engine ships articles without depending on WordPress or on a populated
 * Blob store: the source of truth for these posts is `content/blog/sales/
 * posts.json`, reviewable and versioned in git.
 *
 * A Blob copy of the same slug always wins over its seed version (see
 * `site-posts.ts`), so an article can later be edited through the publish API
 * without touching the repo.
 */

let cache: StoredBlogPost[] | null = null

function parseRaw(): StoredBlogPost[] {
  const list = Array.isArray(rawSalesPosts)
    ? rawSalesPosts
    : (rawSalesPosts as { posts?: unknown[] }).posts ?? []

  const posts: StoredBlogPost[] = []
  for (const raw of list) {
    const parsed = salesPostSchema.safeParse(raw)
    if (!parsed.success) {
      // A malformed seed post is dropped, never crashes the blog. The slug (if
      // any) and the first issue make it findable in the build logs.
      const slug = (raw as { slug?: string } | null)?.slug ?? "<unknown>"
      console.error(`⚠️ Skipping invalid seed post "${slug}":`, parsed.error.issues[0]?.message)
      continue
    }
    try {
      posts.push(assembleSalesPost(parsed.data))
    } catch (error) {
      console.error("⚠️ Failed to assemble seed post:", error)
    }
  }
  return posts
}

export function readSeedPosts(): StoredBlogPost[] {
  if (!cache) cache = parseRaw()
  return cache
}
