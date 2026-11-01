import { readStoredBlogPosts, type StoredBlogPost } from "./blog-store"
import { readSeedPosts } from "./seed-posts"

/**
 * The single read path the public site uses for blog posts. It merges two
 * sources into one list:
 *
 *   1. Seed content committed to the repo (`content/blog/sales/*`), assembled
 *      by `readSeedPosts()`.
 *   2. Posts written to the Vercel Blob store (the news agent and the publish
 *      API), read by `readStoredBlogPosts()`.
 *
 * A Blob post wins over a seed post with the same slug, so an article can be
 * edited or re-approved through the API without a code change.
 *
 * Drafts (`status === "draft"`) are hidden from the public site unless
 * SHOW_BLOG_DRAFTS is "true" — set that on a preview deployment to review
 * unpublished articles before they go live. A missing status means published.
 */

function draftsVisible(): boolean {
  return process.env.SHOW_BLOG_DRAFTS === "true"
}

function isDraft(post: StoredBlogPost): boolean {
  return post.status === "draft"
}

export async function readSitePosts(opts?: {
  revalidate?: number
  includeDrafts?: boolean
}): Promise<StoredBlogPost[]> {
  const seed = readSeedPosts()
  const blob = await readStoredBlogPosts(opts)

  const bySlug = new Map<string, StoredBlogPost>()
  for (const post of seed) bySlug.set(post.slug, post)
  for (const post of blob) bySlug.set(post.slug, post) // Blob overrides seed.

  const includeDrafts = opts?.includeDrafts ?? draftsVisible()
  const posts = Array.from(bySlug.values()).filter((post) => includeDrafts || !isDraft(post))

  return posts.sort(
    (a, b) => Date.parse(b.publishedAt || b.updatedAt) - Date.parse(a.publishedAt || a.updatedAt),
  )
}

export async function getSitePostBySlug(
  slug: string,
  opts?: { includeDrafts?: boolean },
): Promise<StoredBlogPost | null> {
  const includeDrafts = opts?.includeDrafts ?? draftsVisible()
  // Resolve against the full set (drafts included) so a draft slug is found,
  // then gate visibility, rather than silently falling through to WordPress.
  const posts = await readSitePosts({ includeDrafts: true })
  const found = posts.find((post) => post.slug === slug) ?? null
  if (!found) return null
  if (isDraft(found) && !includeDrafts) return null
  return found
}
