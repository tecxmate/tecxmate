import { NextRequest, NextResponse } from "next/server"
import type { VCardData } from "@/lib/vcard"
import vcards from "@/data/vcards.json"

const ADMIN_PASSWORD = process.env.VCARD_ADMIN_PASSWORD || "tecxmate2026"

function checkAuth(request: NextRequest): boolean {
  const password = request.headers.get("x-admin-password")
  if (!password) return false
  return password === ADMIN_PASSWORD
}

// GET: list all vCards from JSON
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.json(vcards as VCardData[])
}
