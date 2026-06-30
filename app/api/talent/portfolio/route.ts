import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const [{ auth }, { db }] = await Promise.all([
    import("@/lib/auth"),
    import("@/lib/db"),
  ])
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ items: [] })
  const profile = await db.talentProfile.findUnique({ where: { userId: session.user.id }, select: { portfolioItems: true } })
  return NextResponse.json({ items: (profile?.portfolioItems as string[] | null) ?? [] })
}

export async function POST(req: NextRequest) {
  const [{ auth }, { db }] = await Promise.all([
    import("@/lib/auth"),
    import("@/lib/db"),
  ])
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { items } = await req.json()
  await db.talentProfile.update({ where: { userId: session.user.id }, data: { portfolioItems: items } })
  return NextResponse.json({ ok: true })
}
