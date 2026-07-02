"use server"
import { db } from "@/lib/db"
import { signIn } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { generateDonationRef } from "@/lib/references"
import { sendMail } from "@/lib/mailer"

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

  // Delete any existing tokens for this email first
  await db.verificationToken.deleteMany({ where: { identifier: email } })

  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 3600 * 1000)
  await db.verificationToken.create({ data: { identifier: email, token, expires } })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const link = `${appUrl}/reset-password?token=${token}`
  const name = user.firstName ?? "there"

  await sendMail(
    email,
    "Reset your Volcano Arts Center password",
    `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
      <h2 style="margin:0 0 8px">Reset your password</h2>
      <p style="color:#555;margin:0 0 24px">Hi ${name}, click the button below to set a new password. This link expires in 1 hour.</p>
      <a href="${link}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600">Reset Password</a>
      <p style="color:#999;font-size:12px;margin-top:24px">If you didn't request this, ignore this email — your password won't change.</p>
    </div>`
  )

  return { success: true }
}

export async function resetPasswordAction(token: string, password: string) {
  if (password.length < 8) return { error: "Password must be at least 8 characters." }

  const record = await db.verificationToken.findUnique({ where: { token } })
  if (!record) return { error: "Invalid or expired reset link." }
  if (record.expires < new Date()) {
    await db.verificationToken.delete({ where: { token } })
    return { error: "This link has expired. Please request a new one." }
  }

  const hashed = await bcrypt.hash(password, 12)
  await db.user.update({ where: { email: record.identifier }, data: { password: hashed } })
  await db.verificationToken.delete({ where: { token } })

  return { success: true }
}