import { NextResponse } from "next/server"
import { readContent } from "@/lib/site-content"

export const dynamic = "force-dynamic"

export async function GET() {
  const content = await readContent()
  return NextResponse.json(content)
}
