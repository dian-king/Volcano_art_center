"use server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { generateDonationRef } from "@/lib/references"

const schema = z.object({
  amount: z.number().min(1),
  purpose: z.enum(["GENERAL", "REFORESTATION", "COMMUNITY_EDUCATION", "YOUTH_EMPOWERMENT", "CONSERVATION"]),
  frequency: z.enum(["ONE_TIME", "MONTHLY", "QUARTERLY", "ANNUALLY"]),
  donorName: z.string().optional(),
  donorEmail: z.string().email(),
  anonymous: z.boolean().default(false),
  campaignId: z.string().optional(),
})

export async function createDonationAction(raw: unknown) {
  const parsed = schema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const session = await auth()
  const reference = generateDonationRef()

  await db.donation.create({
    data: {
      reference,
      userId: session?.user?.id,
      campaignId: parsed.data.campaignId,
      amount: parsed.data.amount,
      purpose: parsed.data.purpose,
      frequency: parsed.data.frequency,
      donorName: parsed.data.anonymous ? null : parsed.data.donorName,
      donorEmail: parsed.data.donorEmail,
      anonymous: parsed.data.anonymous,
      status: "PENDING",
    },
  })

  const paymentSettings = await db.platformSetting.findMany({ where: { category: "payments" } })
  return { success: true, reference, paymentSettings }
}