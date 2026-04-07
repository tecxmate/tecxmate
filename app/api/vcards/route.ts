import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { defaultVCards } from "@/lib/vcard"
import type { VCardData } from "@/lib/vcard"

const redis = Redis.fromEnv()

const ADMIN_PASSWORD = process.env.VCARD_ADMIN_PASSWORD || "tecxmate2026"

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

function checkAuth(request: NextRequest): boolean {
  const password = request.headers.get("x-admin-password")
  if (!password) return false
  return password === ADMIN_PASSWORD
}

// GET: list all vCards (defaults + custom additions)
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized()

  try {
    const results: VCardData[] = []

    // Load defaults (with Redis overrides)
    for (const def of defaultVCards) {
      const stored = await redis.get<VCardData>(`vcard:${def.id}`)
      results.push(stored ?? def)
    }

    // Load custom-added cards
    const customIds = await redis.smembers("vcard:custom-ids")
    if (customIds && customIds.length > 0) {
      for (const id of customIds) {
        // Skip if it's also a default (shouldn't happen, but safe)
        if (defaultVCards.some((d) => d.id === id)) continue
        const card = await redis.get<VCardData>(`vcard:${id}`)
        if (card) results.push(card)
      }
    }

    return NextResponse.json(results)
  } catch {
    return NextResponse.json(defaultVCards)
  }
}

// POST: add a new person
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized()

  try {
    const data: VCardData = await request.json()
    if (!data.id || !data.firstName || !data.lastName) {
      return NextResponse.json({ error: "Missing required fields (id, firstName, lastName)" }, { status: 400 })
    }

    // Check for duplicate ID
    const existing = await redis.get(`vcard:${data.id}`)
    const isDefault = defaultVCards.some((d) => d.id === data.id)
    if (existing || isDefault) {
      return NextResponse.json({ error: "A contact with this ID already exists" }, { status: 409 })
    }

    await redis.set(`vcard:${data.id}`, data)
    await redis.sadd("vcard:custom-ids", data.id)
    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error("Error adding vCard:", error)
    return NextResponse.json({ error: "Failed to add" }, { status: 500 })
  }
}

// PUT: update a single vCard
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized()

  try {
    const data: VCardData = await request.json()
    if (!data.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    await redis.set(`vcard:${data.id}`, data)
    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error("Error saving vCard:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}

// DELETE: remove a custom-added person
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized()

  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const isDefault = defaultVCards.some((d) => d.id === id)
    if (isDefault) {
      return NextResponse.json({ error: "Cannot delete a default team member" }, { status: 400 })
    }

    await redis.del(`vcard:${id}`)
    await redis.srem("vcard:custom-ids", id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting vCard:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
