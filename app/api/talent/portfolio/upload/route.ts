import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]
const IMAGE_MAX = 5  * 1024 * 1024  // 5 MB
const VIDEO_MAX = 100 * 1024 * 1024 // 100 MB

export async function POST(req: NextRequest) {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const form = await req.formData()
  const file = form.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  const isImage = IMAGE_TYPES.includes(file.type)
  const isVideo = VIDEO_TYPES.includes(file.type)

  if (!isImage && !isVideo)
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, MP4, WebM or MOV are supported" }, { status: 400 })

  const maxBytes = isVideo ? VIDEO_MAX : IMAGE_MAX
  if (file.size > maxBytes)
    return NextResponse.json({ error: `File too large — max ${isVideo ? "100" : "5"} MB` }, { status: 400 })

  const extMap: Record<string, string> = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
    "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov",
  }
  const ext = extMap[file.type]
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const dir = join(process.cwd(), "public", "uploads", "portfolio")

  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/uploads/portfolio/${filename}`, type: isVideo ? "video" : "image" })
}
