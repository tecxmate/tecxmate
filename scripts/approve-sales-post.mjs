#!/usr/bin/env node
// Approve (publish) or unpublish sales-blog posts by flipping their status in
// content/blog/sales/posts.json. Articles are drafts until approved; approving
// makes them live on the next deploy.
//
// Usage:
//   node scripts/approve-sales-post.mjs <slug> [<slug> ...]   # publish these
//   node scripts/approve-sales-post.mjs --all                 # publish all
//   node scripts/approve-sales-post.mjs --unpublish <slug>    # back to draft
//   node scripts/approve-sales-post.mjs --list                # show statuses
import fs from "node:fs"
import path from "node:path"
import url from "node:url"

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..")
const FILE = path.join(ROOT, "content/blog/sales/posts.json")

const args = process.argv.slice(2)
const unpublish = args.includes("--unpublish")
const all = args.includes("--all")
const list = args.includes("--list")
const slugs = args.filter((a) => !a.startsWith("--"))

const posts = JSON.parse(fs.readFileSync(FILE, "utf8"))

if (list) {
  for (const p of posts) console.log(`[${p.status ?? "published"}] ${p.slug} :: ${p.title}`)
  process.exit(0)
}

const target = unpublish ? "draft" : "published"
let changed = 0
for (const p of posts) {
  const hit = all || slugs.includes(p.slug)
  if (hit && p.status !== target) {
    p.status = target
    changed++
    console.log(`${target === "published" ? "✓ approved" : "↩ unpublished"}: ${p.slug}`)
  }
}

const unknown = slugs.filter((s) => !posts.some((p) => p.slug === s))
if (unknown.length) console.error(`Unknown slug(s): ${unknown.join(", ")}`)

if (changed) {
  fs.writeFileSync(FILE, JSON.stringify(posts, null, 2) + "\n")
  console.log(`Updated ${changed} post(s). Commit and deploy to apply.`)
} else {
  console.log("No changes.")
}
if (unknown.length) process.exit(1)
