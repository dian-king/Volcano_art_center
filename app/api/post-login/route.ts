import { NextRequest, NextResponse } from "next/server"
import { dashboardPathForRole } from "@/lib/permissions"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Google OAuth lands here (no explicit ?next=) so we can read the freshly
// created session and route straight to the user's dashboard.
export async function GET(req: NextRequest) {
  const { auth } = await import("@/lib/auth")
  const session = await auth()
  const dest = dashboardPathForRole(session?.user?.role as string | undefined)
  return NextResponse.redirect(new URL(dest, req.url))
}
