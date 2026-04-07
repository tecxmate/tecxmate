import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { generateVcf, defaultVCards } from "@/lib/vcard"
import type { VCardData } from "@/lib/vcard"

let _redis: Redis | null = null
function getRedis(): Redis | null {
  if (_redis) return _redis
  try {
    _redis = Redis.fromEnv()
    return _redis
  } catch {
    return null
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const redis = getRedis()

  try {
    // Try Redis first, fall back to defaults
    let data = redis ? await redis.get<VCardData>(`vcard:${id}`) : null
    if (!data) {
      data = defaultVCards.find((v) => v.id === id) ?? null
    }

    if (!data) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    const vcf = generateVcf(data)
    const filename = `${data.firstName}_${data.lastName}.vcf`

    return new NextResponse(vcf, {
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch {
    // If Redis fails, try defaults
    const data = defaultVCards.find((v) => v.id === id)
    if (!data) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }
    const vcf = generateVcf(data)
    return new NextResponse(vcf, {
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${data.firstName}_${data.lastName}.vcf"`,
      },
    })
  }
}
