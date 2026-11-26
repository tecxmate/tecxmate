import { deleteStored, putStored, readStoredJSON, storageConfigured } from "./storage"

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

export function isBlobConfigured(): boolean {
  return storageConfigured()
}

export async function readIndex(): Promise<TecxbookEntry[]> {
  return (await readStoredJSON<TecxbookEntry[]>(INDEX_PATHNAME)) ?? []
}

export async function writeIndex(entries: TecxbookEntry[]): Promise<void> {
  if (!isBlobConfigured()) {
    throw new Error("BLOB storage is not configured: BLOB_READ_WRITE_TOKEN is missing.")
  }
  await putStored(INDEX_PATHNAME, JSON.stringify(entries), "application/json", { cacheSeconds: 60 })
}

export async function getEntry(slug: string): Promise<TecxbookEntry | null> {
  const entries = await readIndex()
  return entries.find((e) => e.slug === slug) ?? null
}

export async function uploadHtml(
  slug: string,
  body: Blob | ArrayBuffer | string,
): Promise<{ url: string }> {
  if (!isBlobConfigured()) {
    throw new Error("BLOB storage is not configured: BLOB_READ_WRITE_TOKEN is missing.")
  }
  const pathname = `tecxbook/${slug}-${Date.now()}.html`
  return putStored(pathname, body, "text/html; charset=utf-8", { overwrite: false })
}

export async function deleteFile(url: string): Promise<void> {
  if (!isBlobConfigured()) return
  try {
    await deleteStored(url)
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
