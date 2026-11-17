import { NextResponse } from "next/server"

// The site chat assistant is switched off. The route stays so old clients get a
// clear answer instead of a 404; the previous handler is in git history.
const gone = () => NextResponse.json({ error: "The chat assistant is switched off." }, { status: 410 })

export const POST = gone
export const GET = gone
