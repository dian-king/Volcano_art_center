"use server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { hasRole, SUPER_ROLES } from "@/lib/permissions"

const ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]
const DONATION_STATUSES = ["PENDING", "COMPLETED", "FAILED", "REFUNDED", "CANCELLED"]

// A donation in one of these states is counted toward its campaign total
const COUNTED = ["PENDING", "COMPLETED"]

async function requireSuper() {
  const session = await auth()
  return hasRole(session?.user?.role as string | undefined, SUPER_ROLES)
}

export async function setOrderStatusAction(orderId: string, status: string) {
  if (!(await requireSuper())) return { error: "Unauthorized" }
  if (!ORDER_STATUSES.includes(status)) return { error: "Invalid status." }

  await db.order.update({ where: { id: orderId }, data: { status: status as never } })

  revalidatePath("/admin/overrides")
  revalidatePath("/admin/orders")
  return { success: true }
}

export async function setDonationStatusAction(donationId: string, status: string) {
  if (!(await requireSuper())) return { error: "Unauthorized" }
  if (!DONATION_STATUSES.includes(status)) return { error: "Invalid status." }

  const donation = await db.donation.findUnique({ where: { id: donationId } })
  if (!donation) return { error: "Donation not found." }
  if (donation.status === status) return { success: true }

  const wasCounted = COUNTED.includes(donation.status)
  const willCount = COUNTED.includes(status)

  await db.$transaction(async (tx) => {
    await tx.donation.update({ where: { id: donationId }, data: { status: status as never } })
    if (donation.campaignId && wasCounted !== willCount) {
      // Moving out of a counted state subtracts; moving into one adds
      const sign = willCount ? 1 : -1
      await tx.conservationCampaign.updateMany({
        where: { id: donation.campaignId },
        data: {
          raisedAmount: willCount ? { increment: donation.amount } : { decrement: donation.amount },
          donorCount: { increment: sign },
        },
      })
    }
  })

  revalidatePath("/admin/overrides")
  revalidatePath("/admin/conservation/donations")
  revalidatePath("/conservation")
  revalidatePath("/conservation/[slug]", "page")
  revalidatePath("/")
  return { success: true }
}
