import { NextRequest, NextResponse } from "next/server"
import { generateVcf } from "@/lib/vcard"
import type { VCardData } from "@/lib/vcard"
import vcards from "@/data/vcards.json"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = (vcards as VCardData[]).find((v) => v.id === id)

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
}
