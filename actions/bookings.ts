"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateBookingRef } from "@/lib/references"
import { sendBookingSubmittedEmails } from "@/lib/transactional-email"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const bookingSchema = z.object({
  experienceId: z.string().min(1),
  slotId: z.string().optional(),
  preferredDate: z.string().min(1, "Preferred date is required"),
  alternateDate: z.string().optional(),
  groupSize: z.coerce.number().int().min(1, "Group size is required"),
  guestName: z.string().min(2, "Guest name is required"),
  guestEmail: z.string().email("Valid email is required"),
  guestPhone: z.string().optional(),
  language: z.string().optional(),
  specialRequests: z.string().optional(),
})

function asDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export async function createBookingAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "You must be signed in to book an experience." }

  const parsed = bookingSchema.safeParse({
    experienceId: formData.get("experienceId"),
    slotId: formData.get("slotId") || undefined,
    preferredDate: formData.get("preferredDate"),
    alternateDate: formData.get("alternateDate") || undefined,
    groupSize: formData.get("groupSize"),
    guestName: formData.get("guestName"),
    guestEmail: formData.get("guestEmail"),
    guestPhone: formData.get("guestPhone") || undefined,
    language: formData.get("language") || undefined,
    specialRequests: formData.get("specialRequests") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const preferredDate = asDate(parsed.data.preferredDate)
  const alternateDate = parsed.data.alternateDate ? asDate(parsed.data.alternateDate) : null
  if (!preferredDate) return { error: "Preferred date is invalid." }
  if (alternateDate === null && parsed.data.alternateDate) return { error: "Alternate date is invalid." }

  const result = await db.$transaction(async (tx) => {
    const experience = await tx.experience.findUnique({
      where: { id: parsed.data.experienceId },
      select: { id: true, title: true, status: true, minGroupSize: true, maxGroupSize: true },
    })
    if (!experience || experience.status !== "PUBLISHED") return { error: "This experience is not available for booking." }
    if (parsed.data.groupSize < experience.minGroupSize || parsed.data.groupSize > experience.maxGroupSize) {
      return { error: `Group size must be between ${experience.minGroupSize} and ${experience.maxGroupSize}.` }
    }

    let slotDate = preferredDate
    if (parsed.data.slotId) {
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: parsed.data.slotId },
        select: { id: true, experienceId: true, date: true, status: true, capacity: true, booked: true },
      })
      if (!slot || slot.experienceId !== experience.id) return { error: "Selected date is not valid for this experience." }
      if (!["AVAILABLE", "LIMITED", "REQUEST_ONLY"].includes(slot.status)) return { error: "Selected date is not available." }
      if (slot.booked + parsed.data.groupSize > slot.capacity) return { error: "Selected date does not have enough remaining capacity." }
      slotDate = slot.date
      await tx.availabilitySlot.update({
        where: { id: slot.id },
        data: { booked: { increment: parsed.data.groupSize } },
      })
    }

    const booking = await tx.booking.create({
      data: {
        reference: generateBookingRef(),
        userId: session.user.id,
        experienceId: experience.id,
        slotId: parsed.data.slotId,
        guestName: parsed.data.guestName,
        guestEmail: parsed.data.guestEmail,
        guestPhone: parsed.data.guestPhone,
        groupSize: parsed.data.groupSize,
        preferredDate: slotDate,
        alternateDate,
        language: parsed.data.language,
        specialRequests: parsed.data.specialRequests,
        status: "PENDING",
      },
      select: { reference: true, guestName: true, guestEmail: true, preferredDate: true, groupSize: true },
    })

    await tx.notification.create({
      data: {
        userId: session.user.id,
        title: "Booking request submitted",
        body: `We received your request for ${experience.title}. Our team will review it shortly.`,
        type: "BOOKING",
        ctaUrl: "/client/dashboard/bookings",
      },
    })

    return { reference: booking.reference, booking, experienceTitle: experience.title }
  })

  if ("error" in result) return result
  await sendBookingSubmittedEmails({
    reference: result.booking.reference,
    guestName: result.booking.guestName,
    guestEmail: result.booking.guestEmail,
    preferredDate: result.booking.preferredDate,
    groupSize: result.booking.groupSize,
    experienceTitle: result.experienceTitle,
  })
  revalidatePath("/client/dashboard")
  redirect(`/client/dashboard/bookings?booking=${result.reference}`)
}

export async function cancelOwnBookingAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const booking = await db.booking.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true, slotId: true, groupSize: true },
  })
  if (!booking || booking.userId !== session.user.id) throw new Error("Unauthorized")
  if (booking.status !== "PENDING") throw new Error("Only pending bookings can be cancelled.")

  await db.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id },
      data: { status: "CANCELLED", cancelReason: "Cancelled by client" },
    })
    if (booking.slotId) {
      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: { booked: { decrement: booking.groupSize } },
      })
    }
  })

  revalidatePath("/client/dashboard")
}
