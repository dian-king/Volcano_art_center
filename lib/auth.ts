import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { authConfig } from "../auth.config"
import { rateLimit } from "@/lib/rate-limit"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    // Override Credentials with full authorize (has Prisma + bcrypt)
    Credentials({
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)
        if (!parsed.success) return null
        // Rate limit: 10 attempts per 15 minutes per email
        const { ok } = rateLimit(`login:${parsed.data.email}`, 10, 15 * 60 * 1000)
        if (!ok) return null

        const user = await db.user.findUnique({ where: { email: parsed.data.email } })
        if (!user?.password || !user.isActive) return null
        const valid = await bcrypt.compare(parsed.data.password, user.password)
        return valid ? user : null
      },
    }),
    ...(authConfig.providers ?? []).filter((p) => (p as { id?: string }).id === "google"),
  ],
  events: {
    async createUser({ user }) {
      const parts = (user.name ?? "").split(" ")
      const firstName = parts[0] || "User"
      const lastName = parts.slice(1).join(" ") || "-"
      await db.user.update({
        where: { id: user.id },
        data: { role: "REGISTERED_CLIENT", firstName, lastName },
      })
    },
  },
})