import type { WPBlogPost } from "./wordpress"

/**
 * The three categories the homepage blog section is split into. A post is
 * shown under a tab only when its WordPress category matches that tab's
 * `wpCategory` name — so these strings must exist verbatim as categories in
 * WordPress. Posts in any other category are not surfaced on the homepage.
 */
export const BLOG_CATEGORY_TABS = [
  { id: "industry-news", wpCategory: "Industry News", labelKey: "blog_tab_industry_news" },
  { id: "our-products", wpCategory: "Our Products", labelKey: "blog_tab_our_products" },
  { id: "tecxmate-news", wpCategory: "Tecxmate News", labelKey: "blog_tab_tecxmate_news" },
] as const

export type BlogCategoryTab = (typeof BLOG_CATEGORY_TABS)[number]
export type BlogCategoryTabId = BlogCategoryTab["id"]

/** Category names differ only by casing and stray spacing between WP installs. */
function normalize(value: string): string {
  return value.trim().toLowerCase()
}

export function postsForTab(posts: readonly WPBlogPost[], tab: BlogCategoryTab): WPBlogPost[] {
  const target = normalize(tab.wpCategory)
  return posts.filter((post) => normalize(post.category || "") === target)
}
