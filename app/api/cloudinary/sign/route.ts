import { NextRequest, NextResponse } from "next/server"
import { ADMIN_ROLES, CONTENT_ROLES, OPS_ROLES, hasRole } from "@/lib/permissions"
import { signCloudinaryUpload } from "@/lib/cloudinary"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// "avatars" and "portfolio" are self-service — any signed-in user uploads
// their own avatar/portfolio item. Everything else is admin content.
function rolesRequiredFor(folder: string): readonly string[] | null {
  if (folder === "products") return OPS_ROLES
  if (folder === "avatars" || folder === "portfolio") return null
  if (folder === "misc") return ADMIN_ROLES
  return CONTENT_ROLES
}

export async function POST(req: NextRequest) {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { folder = "misc" } = await req.json().catch(() => ({ folder: "misc" }))
  const required = rolesRequiredFor(folder)
  if (required && !hasRole(session.user.role as string | undefined, required)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json(signCloudinaryUpload(folder))
}
