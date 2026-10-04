"use client"

import { useEffect, useState } from "react"
import type { SiteContent } from "./site-content"

// Module-level cache: every component that calls useSiteContent() during a
// single page load shares ONE /api/content request rather than each firing
// its own. Not refreshed within a session — a page reload picks up any admin
// edits, which is all the homepage display needs.
let cached: Promise<SiteContent | null> | null = null

function loadSiteContent(): Promise<SiteContent | null> {
  if (!cached) {
    cached = fetch("/api/content", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<SiteContent>) : null))
      .catch(() => null)
  }
  return cached
}

/** Returns the live site content once loaded, or null until then. */
export function useSiteContent(): SiteContent | null {
  const [content, setContent] = useState<SiteContent | null>(null)
  useEffect(() => {
    let active = true
    loadSiteContent().then((c) => {
      if (active) setContent(c)
    })
    return () => {
      active = false
    }
  }, [])
  return content
}
