import { NextResponse } from "next/server"
import { readIndex } from "@/lib/tecxbook"

export const dynamic = "force-dynamic"

export async function GET() {
  const entries = await readIndex()
  return NextResponse.json(entries)
}
