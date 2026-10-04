import { NextResponse } from "next/server"
import { publicChatbotConfig } from "@/lib/chatbot"
import { readContent } from "@/lib/site-content"

export const dynamic = "force-dynamic"

export async function GET() {
  const content = await readContent()
  return NextResponse.json(publicChatbotConfig(content.chatbot))
}
