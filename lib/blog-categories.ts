import type { WPBlogPost } from "./wordpress"

/**
 * The three categories the homepage blog section is split into. A post is
 * shown under a tab only when its WordPress category matches that tab's
 * `wpCategory` name — so these strings must exist verbatim as categories in
 * WordPress. Posts in any other category are not surfaced on the homepage.
 */
export const BLOG_CATEGORY_TABS = [
  {
    id: "our-stories",
    wpCategory: "Our Stories",
    labelKey: "blog_tab_our_stories",
    aliases: ["Tecxmate News"],
    tags: [],
  },
  {
    id: "our-products",
    wpCategory: "Our Products",
    labelKey: "blog_tab_our_products",
    aliases: [],
    // Product write-ups (TECXWORK, TECXNOTE, Vietnamy) are marked by tag
    // rather than by category.
    tags: ["projects"],
  },
  {
    id: "industry-news",
    wpCategory: "Industry News",
    labelKey: "blog_tab_industry_news",
    // "News" is the category the WordPress blog already files industry pieces
    // under; "Automated News" is what the agent used before the rename.
    aliases: ["News", "Automated News"],
    tags: [],
  },
] as const

/**
 * Category the RSS+LLM news agent files its daily briefs under. Named
 * explicitly rather than read by position, so reordering the tabs above
 * cannot silently redirect the agent's output into another section.
 */
export const AUTOMATED_NEWS_CATEGORY = "Industry News"

export type BlogCategoryTab = (typeof BLOG_CATEGORY_TABS)[number]
export type BlogCategoryTabId = BlogCategoryTab["id"]

/** Category names differ only by casing and stray spacing between WP installs. */
function normalize(value: string): string {
  return value.trim().toLowerCase()
}

export function postsForTab(posts: readonly WPBlogPost[], tab: BlogCategoryTab): WPBlogPost[] {
  const categories = new Set([tab.wpCategory, ...tab.aliases].map(normalize))
  const tags = new Set(tab.tags.map(normalize))

  return posts.filter(
    (post) =>
      categories.has(normalize(post.category || "")) ||
      (post.tags ?? []).some((tag) => tags.has(normalize(tag))),
  )
}
