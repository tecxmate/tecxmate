import { NextRequest, NextResponse } from "next/server"
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth"
import type { VCardData } from "@/lib/vcard"
import vcards from "@/data/vcards.json"

// GET: list all vCards from JSON (shared admin auth)
export async function GET(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not configured on the server." }, { status: 503 })
  }
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.json(vcards as VCardData[])
}
