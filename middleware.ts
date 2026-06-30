import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import { ADMIN_ROLES, ADMIN_ROUTE_ROLES, hasRole } from "@/lib/permissions"

const { auth } = NextAuth(authConfig)

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
    if (!hasRole(role, ADMIN_ROLES)) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    const matchedRoute = Object.entries(ADMIN_ROUTE_ROLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([prefix]) => path.startsWith(prefix))
    if (matchedRoute && !hasRole(role, matchedRoute[1])) {
      return NextResponse.redirect(new URL("/admin", req.url))
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
  matcher: [
    "/admin/:path*",
    "/client/:path*",
    "/talent/dashboard/:path*",
    "/tour-operators/portal/:path*",
  ],
}
