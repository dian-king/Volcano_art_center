import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"
import { ADMIN_ROLES, CONTENT_ROLES, OPS_ROLES, hasRole } from "@/lib/permissions"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB for content images

export async function POST(req: NextRequest) {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const form = await req.formData()
  const file = form.get("file") as File | null
  const folder = (form.get("folder") as string) || "misc"
  const role = session.user.role as string | undefined
  const allowedRoles = folder === "products" ? OPS_ROLES : folder === "misc" ? ADMIN_ROLES : CONTENT_ROLES
  if (!hasRole(role, allowedRoles)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
  if (!VALID_TYPES.includes(file.type)) return NextResponse.json({ error: "Only JPEG, PNG and WebP are supported" }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large — max 5 MB" }, { status: 400 })

  const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp"
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const dir = join(process.cwd(), "public", "uploads", folder)

  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/uploads/${folder}/${filename}` })
}
