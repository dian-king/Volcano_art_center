import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

// Edge-safe config — no Prisma, no bcrypt (those run in lib/auth.ts server-side only)
export const authConfig: NextAuthConfig = {
  // Trust the deployment host (Vercel/proxy) so OAuth callbacks resolve to the
  // real production domain instead of erroring on an untrusted host.
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Credentials authorize runs in lib/auth.ts where Prisma is available
    Credentials({ credentials: { email: {}, password: {} } }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as Record<string, unknown>).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as import("@/types").UserRole
      }
      return session
    },
    authorized({ auth }) {
      return true // actual role checks done in middleware function body
    },
    async redirect({ url, baseUrl }) {
      // Extract and validate the ?next= param — must be a relative path to prevent open redirect
      try {
        const parsed = new URL(url, baseUrl)
        const next = parsed.searchParams.get("next")
        if (next && next.startsWith("/") && !next.startsWith("//")) {
          return `${baseUrl}${next}`
        }
      } catch {}
      // Allow same-origin redirects, fall back to baseUrl
      return url.startsWith(baseUrl) ? url : baseUrl
    },
  },
}