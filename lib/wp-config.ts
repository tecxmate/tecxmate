// WordPress Configuration
// For WordPress.com sites: use your site URL (e.g., 'yoursite.wordpress.com')
// For self-hosted WordPress: use your full domain (e.g., 'blog.yoursite.com')
//
// There is deliberately NO default site. This used to fall back to an unrelated
// third-party blog, which meant a missing WORDPRESS_SITE_URL did not break the
// blog — it quietly published a stranger's posts under the Tecxmate masthead,
// and only a reader noticing the bylines would ever catch it. An unset variable
// now leaves WORDPRESS_CONFIGURED false, and every caller either falls back to
// our own stored posts or tells the reader the section is being improved.
export const WORDPRESS_SITE_URL = process.env.WORDPRESS_SITE_URL?.trim() || ''
export const WORDPRESS_CONFIGURED = WORDPRESS_SITE_URL.length > 0

// Automatically determine API URL based on site URL
// WordPress.com sites use the public API
// Self-hosted sites use the REST API at /wp-json/wp/v2
const isWordPressCom = WORDPRESS_SITE_URL.includes('.wordpress.com')
export const WORDPRESS_BASE_URL = `https://${WORDPRESS_SITE_URL}`

// Empty when unconfigured so that a caller which skipped its WORDPRESS_CONFIGURED
// guard fails loudly on an unusable URL rather than fetching `https://undefined/...`.
export const WORDPRESS_API_URL = !WORDPRESS_CONFIGURED
  ? ''
  : isWordPressCom
    ? `https://public-api.wordpress.com/wp/v2/sites/${WORDPRESS_SITE_URL}`
    : `https://${WORDPRESS_SITE_URL}/wp-json/wp/v2`

// Cache and pagination settings
export const REVALIDATE_TIME = parseInt(process.env.WORDPRESS_REVALIDATE_TIME || '300', 10) // 5 minutes default
export const POSTS_PER_PAGE = parseInt(process.env.WORDPRESS_POSTS_PER_PAGE || '9', 10)
