"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const profileSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  country: z.string().optional(),
})

const applySchema = profileSchema

export async function submitOperatorApplicationAction(fd: FormData) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "REGISTERED_CLIENT") {
    redirect("/tour-operators/apply?error=Only%20client%20accounts%20can%20apply")
  }
  const userId = session.user.id

  const parsed = applySchema.safeParse(Object.fromEntries(fd))
  if (!parsed.success) redirect(`/tour-operators/apply?error=${encodeURIComponent(parsed.error.issues[0].message)}`)
  const d = parsed.data

  const existing = await db.tourOperator.findUnique({ where: { userId } })
  if (existing) redirect("/tour-operators/portal")

  await db.tourOperator.create({
    data: {
      userId,
      companyName: d.companyName,
      contactName: d.contactName,
      email: d.email,
      phone: d.phone || null,
      country: d.country || null,
    },
  })
  await db.user.update({ where: { id: userId }, data: { role: "TOUR_OPERATOR" } })

  revalidatePath("/tour-operators/portal")
  redirect("/tour-operators/portal")
}

const requestSchema = z.object({
  experienceSlug: z.string().optional(),
  requestType: z.enum(["GROUP_BOOKING", "CUSTOM_PACKAGE"]),
  estimatedSize: z.coerce.number().int().min(1, "Group size is required"),
  estimatedDate: z.string().optional(),
  invoiceRequired: z.boolean().default(false),
  specialRequests: z.string().optional(),
})

const messageSchema = z.object({
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

async function requireOperator() {
  const session = await auth()
  if (!session?.user?.id || !["TOUR_OPERATOR", "SUPER_ADMIN"].includes(session.user.role as string)) {
    throw new Error("Unauthorized")
  }
  return session
}

function dateOrNull(value?: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export async function saveOperatorProfileAction(formData: FormData) {
  const session = await requireOperator()
  const parsed = profileSchema.safeParse({
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    country: formData.get("country") || undefined,
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await db.tourOperator.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: { userId: session.user.id, ...parsed.data },
  })

  revalidatePath("/tour-operators/portal")
  redirect("/tour-operators/portal")
}

export async function createOperatorRequestAction(formData: FormData) {
  const session = await requireOperator()
  const operator = await db.tourOperator.findUnique({ where: { userId: session.user.id } })
  if (!operator) throw new Error("Create your company profile before submitting requests.")

  const parsed = requestSchema.safeParse({
    experienceSlug: formData.get("experienceSlug") || undefined,
    requestType: formData.get("requestType"),
    estimatedSize: formData.get("estimatedSize"),
    estimatedDate: formData.get("estimatedDate") || undefined,
    invoiceRequired: formData.get("invoiceRequired") === "on",
    specialRequests: formData.get("specialRequests") || undefined,
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const request = await db.operatorRequest.create({
    data: {
      operatorId: operator.id,
      experienceSlug: parsed.data.experienceSlug,
      requestType: parsed.data.requestType,
      estimatedSize: parsed.data.estimatedSize,
      estimatedDate: dateOrNull(parsed.data.estimatedDate),
      invoiceRequired: parsed.data.invoiceRequired,
      specialRequests: parsed.data.specialRequests,
      status: "SUBMITTED",
    },
  })

  const staff = await db.user.findMany({
    where: { isActive: true, role: { in: ["OPS_MANAGER", "SUPER_ADMIN"] } },
    select: { id: true },
  })
  if (staff.length > 0) {
    await db.notification.createMany({
      data: staff.map(user => ({
        userId: user.id,
        title: "New tour operator request",
        body: `${operator.companyName} submitted a ${parsed.data.requestType.replace("_", " ").toLowerCase()} request.`,
        type: "OPERATOR_REQUEST",
        ctaUrl: "/admin/operators",
      })),
    })
  }

  revalidatePath("/tour-operators/portal")
  revalidatePath("/tour-operators/portal/requests")
  redirect(`/tour-operators/portal/requests?request=${request.id}`)
}

export async function updateOwnOperatorRequestAction(id: string, formData: FormData) {
  const session = await requireOperator()
  const operator = await db.tourOperator.findUnique({ where: { userId: session.user.id } })
  if (!operator) throw new Error("Operator profile not found.")

  const existing = await db.operatorRequest.findUnique({ where: { id }, select: { operatorId: true, status: true } })
  if (!existing || existing.operatorId !== operator.id) throw new Error("Unauthorized")
  if (!["SUBMITTED", "UNDER_REVIEW"].includes(existing.status)) throw new Error("Only pending requests can be edited.")

  const parsed = requestSchema.safeParse({
    experienceSlug: formData.get("experienceSlug") || undefined,
    requestType: formData.get("requestType"),
    estimatedSize: formData.get("estimatedSize"),
    estimatedDate: formData.get("estimatedDate") || undefined,
    invoiceRequired: formData.get("invoiceRequired") === "on",
    specialRequests: formData.get("specialRequests") || undefined,
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await db.operatorRequest.update({
    where: { id },
    data: {
      experienceSlug: parsed.data.experienceSlug,
      requestType: parsed.data.requestType,
      estimatedSize: parsed.data.estimatedSize,
      estimatedDate: dateOrNull(parsed.data.estimatedDate),
      invoiceRequired: parsed.data.invoiceRequired,
      specialRequests: parsed.data.specialRequests,
    },
  })

  revalidatePath("/tour-operators/portal")
}

export async function deleteOwnOperatorRequestAction(formData: FormData) {
  const session = await requireOperator()
  const operator = await db.tourOperator.findUnique({ where: { userId: session.user.id } })
  if (!operator) throw new Error("Operator profile not found.")

  const id = formData.get("id") as string
  const existing = await db.operatorRequest.findUnique({ where: { id }, select: { operatorId: true, status: true } })
  if (!existing || existing.operatorId !== operator.id) throw new Error("Unauthorized")
  if (!["SUBMITTED", "UNDER_REVIEW"].includes(existing.status)) throw new Error("Only pending requests can be deleted.")

  await db.operatorRequest.delete({ where: { id } })

  revalidatePath("/tour-operators/portal")
  revalidatePath("/tour-operators/portal/requests")
}

export async function sendOperatorMessageAction(formData: FormData) {
  const session = await requireOperator()
  const operator = await db.tourOperator.findUnique({ where: { userId: session.user.id } })
  if (!operator) throw new Error("Operator profile not found.")

  const parsed = messageSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message"),
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await db.contactInquiry.create({
    data: {
      name: operator.contactName,
      email: operator.email,
      phone: operator.phone,
      subject: `[Tour Operator] ${parsed.data.subject}`,
      message: `${operator.companyName}\n\n${parsed.data.message}`,
      status: "NEW",
    },
  })

  revalidatePath("/tour-operators/portal")
  revalidatePath("/tour-operators/portal/messages")
  redirect("/tour-operators/portal/messages?message=sent")
}

export async function markOperatorNotificationsReadAction() {
  const session = await requireOperator()

  await db.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  })

  revalidatePath("/tour-operators/portal")
  revalidatePath("/tour-operators/portal/notifications")
}
