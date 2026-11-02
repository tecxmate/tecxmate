import type { WPBlogPost } from "./wordpress"

/**
 * The lineup shown in the homepage "Our Products" section.
 *
 * WHY A CARD IS NO LONGER JUST A BLOG POST. Until now a product card was driven
 * entirely by whether a WordPress post existed: post found → cover image and
 * "Read full article"; no post → the wordmark and **"Coming soon"**. That made
 * the blog the source of truth for whether a product had shipped, which is the
 * wrong way round — tecxmap and Tecxwork are both live and serving, and a card
 * that calls a shipped product unreleased is a defect, not a placeholder. It
 * also tied the section to WordPress, which is being replaced.
 *
 * So each product now carries its own `status` and, where it has one, its own
 * `url`. The blog post is enrichment on top (a cover image and a "read more"),
 * never the thing that decides what the card claims.
 *
 * `url` is the product's own public address, and it is deliberately `null`
 * rather than guessed where none exists:
 *   - alphatecx runs as an MCP server whose console is gated behind a token in
 *     the path; only `/` and `/health` answer unauthenticated, so there is no
 *     public page to send a visitor to.
 *   - Tecxbot has no public address anywhere in these repositories.
 * Both are live products, so they must not say "Coming soon"; they fall back to
 * their blog post, and show the tagline alone if there is not one yet.
 *
 * On the name: the repository is `bizmap`, but the shipped product is
 * `tecxmap` (Chinese half 商業地圖, and where both appear together the order is
 * 「商業地圖 tecxmap」). Its own repo enforces that spelling in CI, so the card
 * uses the product name, not the repo name.
 */
export const PRODUCTS = [
  {
    id: "tecxmap",
    name: "tecxmap",
    url: "https://cmap.tecxmate.com",
    status: "live",
    slug: "introducing-tecxmap",
    taglineKey: "product_tecxmap_tagline",
  },
  {
    id: "tecxwork",
    name: "Tecxwork",
    url: "https://work.tecxmate.com",
    status: "live",
    slug: "introducing-tecxwork",
    taglineKey: "product_tecxwork_tagline",
  },
  {
    id: "tecxbot",
    name: "Tecxbot",
    url: null,
    status: "live",
    slug: "introducing-tecxbot",
    taglineKey: "product_tecxbot_tagline",
  },
  {
    id: "alphatecx",
    name: "AlphaTecx",
    url: null,
    status: "live",
    slug: "introducing-alphatecx",
    taglineKey: "product_alphatecx_tagline",
  },
  {
    // No tagline key on purpose: nothing in these repositories says what VolTecx
    // does, and inventing a description of an unreleased product would put a
    // claim on the site that nobody has made. The card shows the name and
    // "Coming soon" until there is copy to add.
    id: "voltecx",
    name: "VolTecx",
    url: null,
    status: "coming-soon",
    slug: "introducing-voltecx",
    taglineKey: null,
  },
] as const satisfies readonly ProductShape[]

type ProductShape = {
  id: string
  name: string
  url: string | null
  status: "live" | "coming-soon"
  slug: string
  taglineKey: string | null
}

export type Product = (typeof PRODUCTS)[number]

export function postForProduct(posts: readonly WPBlogPost[], product: Product): WPBlogPost | undefined {
  return (
    posts.find((post) => post.slug === product.slug) ??
    posts.find((post) => (post.tags ?? []).some((tag) => tag.trim().toLowerCase() === product.id))
  )
}
