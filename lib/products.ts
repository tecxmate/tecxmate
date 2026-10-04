import type { WPBlogPost } from "./wordpress"

/**
 * The fixed lineup shown in the homepage "Our Products" section. Each card is
 * backed by a WordPress post: the card links to it once a post with the given
 * slug — or tagged with the product id, which lets translated posts under other
 * slugs match too — is published. Until then the card shows "Coming soon".
 */
export const PRODUCTS = [
  { id: "tecxwork", name: "Tecxwork", slug: "introducing-tecxwork", taglineKey: "product_tecxwork_tagline" },
  { id: "tecxbot", name: "Tecxbot", slug: "introducing-tecxbot", taglineKey: "product_tecxbot_tagline" },
  { id: "alphatecx", name: "AlphaTecx", slug: "introducing-alphatecx", taglineKey: "product_alphatecx_tagline" },
] as const

export type Product = (typeof PRODUCTS)[number]

export function postForProduct(posts: readonly WPBlogPost[], product: Product): WPBlogPost | undefined {
  return (
    posts.find((post) => post.slug === product.slug) ??
    posts.find((post) => (post.tags ?? []).some((tag) => tag.trim().toLowerCase() === product.id))
  )
}
