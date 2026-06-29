import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

const ADMIN_ROLES = ["SUPER_ADMIN", "CONTENT_MANAGER", "OPS_MANAGER"]

// Routes only admin roles can access
const ADMIN_PREFIXES = ["/admin"]

// Routes only specific roles can access
const ROLE_ROUTES: Record<string, string[]> = {
  "/client":                ["REGISTERED_CLIENT", "SUPER_ADMIN"],
  "/talent/dashboard":      ["TALENT_APPLICANT", "SUPER_ADMIN"],
  "/tour-operators/portal": ["TOUR_OPERATOR", "SUPER_ADMIN"],
}

export default auth(async (req) => {
  const path = req.nextUrl.pathname
  const session = req.auth
  const role = session?.user?.role as string | undefined


  // Block non-admins from /admin routes
  if (ADMIN_PREFIXES.some(p => path.startsWith(p))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL(`/login?next=${path}`, req.url))
    }
    if (!role || !ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  // Role-restricted client routes
  for (const [prefix, allowed] of Object.entries(ROLE_ROUTES)) {
    if (path.startsWith(prefix)) {
      if (!session?.user) {
        return NextResponse.redirect(new URL(`/login?next=${path}`, req.url))
      }
      if (!role || !allowed.includes(role)) {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
