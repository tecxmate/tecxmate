#!/usr/bin/env node
// Validate every sales-blog draft in content/blog/sales/drafts/*.json against
// the same constraints as lib/sales-blog.ts (salesPostSchema) and assemble them
// into content/blog/sales/posts.json. New drafts default to status "draft".
//
// Existing posts.json entries keep their status: if a slug is already present
// and marked "published", re-running this script does NOT silently revert it to
// draft. This is how a batch of new articles can be added without un-approving
// the live ones.
//
// Usage: node scripts/build-sales-posts.mjs
import fs from "node:fs"
import path from "node:path"
import url from "node:url"

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..")
const DRAFTS = path.join(ROOT, "content/blog/sales/drafts")
const OUT = path.join(ROOT, "content/blog/sales/posts.json")

const COVERS = new Set([
  "/graphics/Idea Launchpad.png",
  "/graphics/Premium Package.png",
  "/graphics/Software Development.png",
  "/graphics/Strategy & Research.png",
  "/graphics/UI_UX & Brand Design.png",
])

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const errors = []
const posts = []
const seenSlug = new Set()

// Preserve approval decisions already made in posts.json.
const prevStatus = new Map()
if (fs.existsSync(OUT)) {
  try {
    for (const p of JSON.parse(fs.readFileSync(OUT, "utf8"))) {
      if (p?.slug && p?.status) prevStatus.set(p.slug, p.status)
    }
  } catch {
    /* a corrupt posts.json is simply rebuilt from drafts */
  }
}

const len = (s) => (typeof s === "string" ? [...s].length : -1)
const check = (cond, msg) => { if (!cond) errors.push(msg) }

if (!fs.existsSync(DRAFTS)) {
  console.error(`No drafts directory at ${DRAFTS}`)
  process.exit(1)
}

for (const f of fs.readdirSync(DRAFTS).filter((f) => f.endsWith(".json")).sort()) {
  let j
  try { j = JSON.parse(fs.readFileSync(path.join(DRAFTS, f), "utf8")) }
  catch (e) { errors.push(`${f}: invalid JSON — ${e.message}`); continue }

  check(typeof j.slug === "string" && slugRe.test(j.slug) && len(j.slug) >= 3 && len(j.slug) <= 100, `${f}: slug bad`)
  check(!seenSlug.has(j.slug), `${f}: duplicate slug ${j.slug}`)
  seenSlug.add(j.slug)
  check(["en", "zh", "vi"].includes(j.language ?? "en"), `${f}: language bad`)
  check(len(j.title) >= 8 && len(j.title) <= 120, `${f}: title len ${len(j.title)}`)
  check(len(j.excerpt) >= 40 && len(j.excerpt) <= 220, `${f}: excerpt len ${len(j.excerpt)}`)
  if (j.coverImage !== undefined) {
    check(len(j.coverImage) >= 1 && len(j.coverImage) <= 500, `${f}: coverImage len`)
    if (!COVERS.has(j.coverImage)) errors.push(`${f}: coverImage not a known graphic: ${j.coverImage}`)
  }
  check(Array.isArray(j.keyTakeaways) && j.keyTakeaways.length >= 3 && j.keyTakeaways.length <= 6, `${f}: keyTakeaways count`)
  for (const [i, t] of (j.keyTakeaways ?? []).entries()) check(len(t) >= 10 && len(t) <= 180, `${f}: takeaway[${i}] len ${len(t)}`)
  check(Array.isArray(j.sections) && j.sections.length >= 3 && j.sections.length <= 6, `${f}: sections count`)
  for (const [i, s] of (j.sections ?? []).entries()) {
    check(len(s.heading) >= 4 && len(s.heading) <= 90, `${f}: section[${i}].heading len ${len(s.heading)}`)
    check(Array.isArray(s.paragraphs) && s.paragraphs.length >= 1 && s.paragraphs.length <= 4, `${f}: section[${i}] paragraphs count`)
    for (const [k, p] of (s.paragraphs ?? []).entries()) check(len(p) >= 40 && len(p) <= 900, `${f}: section[${i}].paragraph[${k}] len ${len(p)}`)
  }
  check(Array.isArray(j.tags) && j.tags.length >= 3 && j.tags.length <= 8, `${f}: tags count`)
  for (const [i, t] of (j.tags ?? []).entries()) check(len(t) >= 2 && len(t) <= 32, `${f}: tag[${i}] len ${len(t)}`)
  if (j.faq !== undefined) {
    check(Array.isArray(j.faq) && j.faq.length <= 4, `${f}: faq count`)
    for (const [i, q] of (j.faq ?? []).entries()) {
      check(len(q.q) >= 5 && len(q.q) <= 180, `${f}: faq[${i}].q len`)
      check(len(q.a) >= 10 && len(q.a) <= 700, `${f}: faq[${i}].a len`)
    }
  }

  posts.push({
    slug: j.slug,
    language: j.language ?? "en",
    title: j.title,
    excerpt: j.excerpt,
    coverImage: j.coverImage,
    keyTakeaways: j.keyTakeaways,
    sections: j.sections,
    tags: j.tags,
    faq: j.faq,
    status: prevStatus.get(j.slug) ?? "draft",
  })
}

if (errors.length) {
  console.error("VALIDATION FAILED:\n" + errors.map((e) => " - " + e).join("\n"))
  process.exit(1)
}

fs.writeFileSync(OUT, JSON.stringify(posts, null, 2) + "\n")
console.log(`OK: ${posts.length} posts -> ${path.relative(ROOT, OUT)}`)
for (const p of posts) console.log(` - [${p.status}] ${p.slug} :: ${p.title}`)
