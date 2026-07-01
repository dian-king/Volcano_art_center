"use server"
import { db } from "@/lib/db"
import { z } from "zod"
import { headers } from "next/headers"
import { sendContactEmails } from "@/lib/transactional-email"

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(10),
})

export async function submitContactAction(raw: unknown) {
  const parsed = schema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const hdrs = await headers()
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0] ?? "unknown"

  const oneHourAgo = new Date(Date.now() - 3600 * 1000)
  const recent = await db.contactInquiry.count({
    where: { email: parsed.data.email, createdAt: { gte: oneHourAgo } },
  })
  if (recent >= 3) return { error: "Too many submissions. Please try again later." }

  await db.contactInquiry.create({
    data: { ...parsed.data, ipAddress: ip, status: "NEW" },
  })

  await sendContactEmails({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    subject: parsed.data.subject,
    message: parsed.data.message,
  })

  return { success: true }
}