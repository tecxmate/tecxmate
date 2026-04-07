import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { generateVcf, defaultVCards } from "@/lib/vcard"
import type { VCardData } from "@/lib/vcard"

const redis = Redis.fromEnv()

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Try Redis first, fall back to defaults
    let data = await redis.get<VCardData>(`vcard:${id}`)
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
