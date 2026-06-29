"use server"
import { db } from "@/lib/db"
import { signIn } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { generateDonationRef } from "@/lib/references"

const registerSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    country: z.string().optional(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export async function registerAction(raw: unknown) {
  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } })
  if (existing) return { error: "An account with this email already exists." }

  const hashed = await bcrypt.hash(parsed.data.password, 12)
  await db.user.create({
    data: {
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      country: parsed.data.country,
      password: hashed,
      role: "REGISTERED_CLIENT",
    },
  })
  return { success: true }
}

export async function forgotPasswordAction(email: string) {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) return { success: true } // do not reveal existence
  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 3600 * 1000)
  await db.verificationToken.create({ data: { identifier: email, token, expires } })
  // Email sent in Task: email templates
  return { success: true }
}