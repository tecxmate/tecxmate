import { bucket, useR2 } from "@/lib/storage"

/** Serves files the admin uploaded to R2 (images, TECXBOOK pages, JSON) on Cloudflare. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (!useR2()) return new Response("Not found", { status: 404 })
  const { path } = await params
  const key = path.map(decodeURIComponent).join("/")
  if (!key || key.includes("..")) return new Response("Not found", { status: 404 })
  const obj = await (await bucket()).get(key)
  if (!obj) return new Response("Not found", { status: 404 })
  return new Response(obj.body, {
    headers: {
      "content-type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": "public, max-age=300",
      "x-content-type-options": "nosniff",
      // Uploaded HTML (TECXBOOK pages) is served from this origin, so lock it into a sandbox:
      // no scripts can reach this site's cookies or the admin.
      "content-security-policy": "sandbox allow-popups allow-popups-to-escape-sandbox",
    },
  })
}
