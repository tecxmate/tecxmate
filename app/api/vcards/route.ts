import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { defaultVCards } from "@/lib/vcard"
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

  const redis = getRedis()
  try {
    const results: VCardData[] = []

    for (const def of defaultVCards) {
      const stored = redis ? await redis.get<VCardData>(`vcard:${def.id}`) : null
      results.push(stored ?? def)
    }

    if (redis) {
      const customIds = await redis.smembers("vcard:custom-ids")
      if (customIds && customIds.length > 0) {
        for (const id of customIds) {
          if (defaultVCards.some((d) => d.id === id)) continue
          const card = await redis.get<VCardData>(`vcard:${id}`)
          if (card) results.push(card)
        }
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

  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: "Storage not configured" }, { status: 503 })

  try {
    const data: VCardData = await request.json()
    if (!data.id || !data.firstName || !data.lastName) {
      return NextResponse.json({ error: "Missing required fields (id, firstName, lastName)" }, { status: 400 })
    }

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

  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: "Storage not configured" }, { status: 503 })

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

  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: "Storage not configured" }, { status: 503 })

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
