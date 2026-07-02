"use server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { generateDonationRef } from "@/lib/references"
import { sendDonationEmails } from "@/lib/transactional-email"
import { hasRole, OPS_ROLES } from "@/lib/permissions"
import { sendDonationConfirmedEmail } from "@/lib/transactional-email"

const schema = z.object({
  amount: z.number().min(1),
  // Campaign donation form doesn't ask for these — default to a conservation one-time gift
  purpose: z.enum(["GENERAL", "REFORESTATION", "COMMUNITY_EDUCATION", "YOUTH_EMPOWERMENT", "CONSERVATION"]).default("CONSERVATION"),
  frequency: z.enum(["ONE_TIME", "MONTHLY", "QUARTERLY", "ANNUALLY"]).default("ONE_TIME"),
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

  // Count toward the campaign total immediately (admin can reverse if payment never arrives).
  // updateMany avoids throwing if the campaignId is stale.
  if (parsed.data.campaignId) {
    await db.conservationCampaign.updateMany({
      where: { id: parsed.data.campaignId },
      data: {
        raisedAmount: { increment: parsed.data.amount },
        donorCount: { increment: 1 },
      },
    })
    // These pages are ISR-cached (revalidate=3600) — bust them so the new total shows on reload
    revalidatePath("/conservation")
    revalidatePath("/conservation/[slug]", "page")
    revalidatePath("/")
  }

  await sendDonationEmails({
    reference,
    donorName: parsed.data.anonymous ? null : parsed.data.donorName ?? null,
    donorEmail: parsed.data.donorEmail,
    amount: parsed.data.amount,
    purpose: parsed.data.purpose,
    frequency: parsed.data.frequency,
    anonymous: parsed.data.anonymous,
  })

  const paymentSettings = await db.platformSetting.findMany({ where: { category: "payments" } })
  return { success: true, reference, paymentSettings }
}

/**
 * Ops/super-admin approval — confirms a donation's payment has arrived.
 * PENDING → COMPLETED. Already counted toward the total on submit, so no
 * total change; sends the donor a payment-confirmed email.
 */
export async function approveDonationAction(donationId: string) {
  const session = await auth()
  if (!hasRole(session?.user?.role as string | undefined, OPS_ROLES)) {
    return { error: "Unauthorized" }
  }

  const donation = await db.donation.findUnique({ where: { id: donationId } })
  if (!donation) return { error: "Donation not found." }
  if (donation.status !== "PENDING") {
    return { error: "Only pending donations can be approved." }
  }

  await db.donation.update({ where: { id: donationId }, data: { status: "COMPLETED" } })

  await sendDonationConfirmedEmail({
    reference: donation.reference,
    donorName: donation.anonymous ? null : donation.donorName,
    donorEmail: donation.donorEmail,
    amount: Number(donation.amount),
  })

  revalidatePath("/admin/conservation/donations")
  return { success: true }
}

/**
 * Ops/super-admin reversal for a donation whose payment never arrived.
 * Marks it CANCELLED and subtracts it back out of the campaign total.
 * Guarded so a donation can only be reversed once.
 */
export async function reverseDonationAction(donationId: string) {
  const session = await auth()
  if (!hasRole(session?.user?.role as string | undefined, OPS_ROLES)) {
    return { error: "Unauthorized" }
  }

  const donation = await db.donation.findUnique({ where: { id: donationId } })
  if (!donation) return { error: "Donation not found." }
  // Only donations currently counted toward the total can be reversed
  if (!["PENDING", "COMPLETED"].includes(donation.status)) {
    return { error: "This donation has already been reversed." }
  }

  await db.$transaction(async (tx) => {
    await tx.donation.update({ where: { id: donationId }, data: { status: "CANCELLED" } })
    if (donation.campaignId) {
      await tx.conservationCampaign.updateMany({
        where: { id: donation.campaignId },
        data: {
          raisedAmount: { decrement: donation.amount },
          donorCount: { decrement: 1 },
        },
      })
    }
  })

  revalidatePath("/admin/conservation/donations")
  revalidatePath("/conservation")
  revalidatePath("/conservation/[slug]", "page")
  revalidatePath("/")
  return { success: true }
}