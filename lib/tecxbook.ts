import { put, del, list } from "@vercel/blob"

export type TecxbookEntry = {
  slug: string
  title: string
  description: string
  file: string
  cover?: string
  tags?: string[]
  createdAt: number
  updatedAt: number
}

const INDEX_PATHNAME = "tecxbook/index.json"

async function findIndexUrl(): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null
  try {
    const { blobs } = await list({ prefix: INDEX_PATHNAME, limit: 1 })
    return blobs[0]?.url ?? null
  } catch {
    return null
  }
}

export async function readIndex(): Promise<TecxbookEntry[]> {
  const url = await findIndexUrl()
  if (!url) return []
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return []
    return (await res.json()) as TecxbookEntry[]
  } catch {
    return []
  }
}

export async function writeIndex(entries: TecxbookEntry[]): Promise<void> {
  await put(INDEX_PATHNAME, JSON.stringify(entries), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  })
}

export async function getEntry(slug: string): Promise<TecxbookEntry | null> {
  const entries = await readIndex()
  return entries.find((e) => e.slug === slug) ?? null
}

export async function uploadHtml(
  slug: string,
  body: Blob | ArrayBuffer | string,
): Promise<{ url: string }> {
  const pathname = `tecxbook/${slug}-${Date.now()}.html`
  const result = await put(pathname, body, {
    access: "public",
    contentType: "text/html; charset=utf-8",
    addRandomSuffix: false,
    allowOverwrite: false,
  })
  return { url: result.url }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    await del(url)
  } catch {
    // file may already be gone; ignore
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}
