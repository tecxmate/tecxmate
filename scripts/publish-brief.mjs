#!/usr/bin/env node
/**
 * Publish an externally-authored daily AI brief to the live site's blog store
 * by POSTing structured content to /api/blog/publish.
 *
 * Usage:
 *   node scripts/publish-brief.mjs <path-to-json>
 *
 * The JSON file may be either a single post object or an array of post objects.
 * Each object must match the publish endpoint shape:
 *   {
 *     "language": "en" | "zh" | "vi",
 *     "title": string,            // 8-120 chars
 *     "excerpt": string,          // 40-220 chars
 *     "keyTakeaways": string[],   // 3-6 items, each 10-180 chars
 *     "sections": [               // 3-5 sections
 *       { "heading": string,      // 4-90 chars
 *         "paragraphs": string[]  // 1-3 paragraphs, each 40-700 chars
 *       }
 *     ],
 *     "tags": string[],           // 3-8 items
 *     "citations": [              // 3-8 items, URLs must be real sources
 *       { "title": string, "url": string }
 *     ],
 *     "force": boolean            // optional; overwrite same-day slug
 *   }
 *
 * Config is read from environment first, then falls back to .env.local in the
 * repo root:
 *   - Secret:  PUBLISH_SECRET  ->  CRON_SECRET  ->  ADMIN_PASSWORD (first entry)
 *   - Base URL: PUBLISH_URL  ->  NEXT_PUBLIC_SITE_URL  ->  https://tecxmate.com
 */

import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, join, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, "..")

function parseEnvFile(text) {
  const out = {}
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue
    const eq = line.indexOf("=")
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

async function loadEnvLocal() {
  try {
    const text = await readFile(join(repoRoot, ".env.local"), "utf8")
    return parseEnvFile(text)
  } catch {
    return {}
  }
}

function firstAdminSecret(value) {
  if (!value) return ""
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0] || ""
}

async function main() {
  const jsonPath = process.argv[2]
  if (!jsonPath) {
    console.error("Usage: node scripts/publish-brief.mjs <path-to-json>")
    process.exit(2)
  }

  const env = await loadEnvLocal()

  const secret =
    process.env.PUBLISH_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    env.PUBLISH_SECRET ||
    env.CRON_SECRET ||
    firstAdminSecret(process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD)

  if (!secret) {
    console.error("No publish secret found (PUBLISH_SECRET / CRON_SECRET / ADMIN_PASSWORD).")
    process.exit(1)
  }

  const baseUrl = (
    process.env.PUBLISH_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    env.PUBLISH_URL ||
    env.NEXT_PUBLIC_SITE_URL ||
    "https://tecxmate.com"
  ).replace(/\/$/, "")

  const endpoint = `${baseUrl}/api/blog/publish`

  const raw = await readFile(resolve(jsonPath), "utf8")
  const data = JSON.parse(raw)
  const posts = Array.isArray(data) ? data : [data]

  let failures = 0
  for (const post of posts) {
    const label = `${post.language ?? "?"} | ${post.title ?? "(no title)"}`
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify(post),
      })
      const text = await res.text()
      let body
      try {
        body = text ? JSON.parse(text) : null
      } catch {
        body = text
      }
      if (res.ok && body?.ok) {
        console.log(`✓ Published [${label}] -> ${body.url}`)
      } else {
        failures++
        console.error(`✗ Failed [${label}] (HTTP ${res.status}):`, JSON.stringify(body))
      }
    } catch (error) {
      failures++
      console.error(`✗ Error [${label}]:`, error?.message || error)
    }
  }

  if (failures > 0) {
    console.error(`${failures} of ${posts.length} posts failed to publish.`)
    process.exit(1)
  }
  console.log(`All ${posts.length} post(s) published successfully.`)
}

main().catch((error) => {
  console.error("Unexpected error:", error)
  process.exit(1)
})
