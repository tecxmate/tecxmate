import { NextResponse } from "next/server"

// The site chat assistant is switched off, so its public config is no longer served.
export function GET() {
  return NextResponse.json({ error: "The chat assistant is switched off." }, { status: 410 })
}
