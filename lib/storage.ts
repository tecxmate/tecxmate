import { del, list, put } from "@vercel/blob"

/**
 * Object storage for admin-edited content, blog posts, TECXBOOK pages and uploads.
 *
 * Two backends, chosen by environment:
 * - Cloudflare (STORAGE_BACKEND=r2): the R2 bucket bound as SITE_BUCKET. Files are served by
 *   this site at /media/<path> (app/media/[...path]/route.ts), so stored URLs are relative.
 * - Vercel (default): Vercel Blob, using BLOB_READ_WRITE_TOKEN, as before the move.
 *
 * Callers never import a backend directly, so the site runs unchanged on either host.
 */

export function useR2(): boolean {
  return process.env.STORAGE_BACKEND === "r2"
}

export function storageConfigured(): boolean {
  return useR2() || Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim())
}

type Bucket = {
  get(key: string): Promise<{ text(): Promise<string>; body: ReadableStream; httpMetadata?: { contentType?: string } } | null>
  put(key: string, value: string | ArrayBuffer | ReadableStream | Blob, opts?: { httpMetadata?: { contentType?: string } }): Promise<unknown>
  head(key: string): Promise<unknown | null>
  delete(key: string): Promise<void>
}

export async function bucket(): Promise<Bucket> {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare")
  const { env } = await getCloudflareContext({ async: true })
  const b = (env as unknown as { SITE_BUCKET?: Bucket }).SITE_BUCKET
  if (!b) throw new Error("R2 bucket SITE_BUCKET is not bound.")
  return b
}

export const MEDIA_PREFIX = "/media/"

/** Read a stored JSON file, or null when it does not exist or cannot be read. */
export async function readStoredJSON<T>(pathname: string, opts?: { revalidate?: number }): Promise<T | null> {
  if (!storageConfigured()) return null
  try {
    if (useR2()) {
      const obj = await (await bucket()).get(pathname)
      return obj ? (JSON.parse(await obj.text()) as T) : null
    }
    const { blobs } = await list({ prefix: pathname, limit: 1 })
    const url = blobs[0]?.url
    if (!url) return null
    const res = await fetch(
      url,
      opts?.revalidate != null ? { next: { revalidate: opts.revalidate } } : { cache: "no-store" },
    )
    return res.ok ? ((await res.json()) as T) : null
  } catch {
    return null
  }
}

/** Store a file and return the URL it is served from. */
export async function putStored(
  pathname: string,
  body: string | Blob | ArrayBuffer,
  contentType: string,
  opts: { overwrite?: boolean; cacheSeconds?: number } = {},
): Promise<{ url: string }> {
  if (!storageConfigured()) {
    throw new Error("Storage is not configured: set STORAGE_BACKEND=r2 or BLOB_READ_WRITE_TOKEN.")
  }
  if (useR2()) {
    const b = await bucket()
    if (opts.overwrite === false && (await b.head(pathname))) {
      throw new Error(`A file already exists at ${pathname}.`)
    }
    const value = body instanceof Blob ? await body.arrayBuffer() : body
    await b.put(pathname, value, { httpMetadata: { contentType } })
    return { url: `${MEDIA_PREFIX}${pathname}` }
  }
  const result = await put(pathname, body, {
    access: "public",
    contentType,
    addRandomSuffix: false,
    allowOverwrite: opts.overwrite ?? true,
    ...(opts.cacheSeconds != null ? { cacheControlMaxAge: opts.cacheSeconds } : {}),
  })
  return { url: result.url }
}

/** Delete a stored file by the URL putStored returned. Files from the other backend are left alone. */
export async function deleteStored(url: string): Promise<void> {
  if (!storageConfigured()) return
  if (useR2()) {
    if (url.startsWith(MEDIA_PREFIX)) await (await bucket()).delete(url.slice(MEDIA_PREFIX.length))
    return
  }
  if (!url.startsWith(MEDIA_PREFIX)) await del(url)
}
