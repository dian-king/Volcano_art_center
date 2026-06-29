"use server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcryptjs"

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(80),
  phone: z.string().max(30).optional().or(z.literal("")),
  country: z.string().max(80).optional().or(z.literal("")),
  profileImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    profileImageUrl: formData.get("profileImageUrl"),
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { firstName, lastName, phone, country, profileImageUrl } = parsed.data
  await db.user.update({
    where: { id: session.user.id },
    data: {
      firstName, lastName,
      name: `${firstName} ${lastName}`,
      phone: phone || null,
      country: country || null,
      profileImageUrl: profileImageUrl || null,
    },
  })
  revalidatePath("/client/dashboard")
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const current = formData.get("currentPassword") as string
  const next = formData.get("newPassword") as string
  const confirm = formData.get("confirmPassword") as string

  if (!current || !next || !confirm) return { error: "All fields are required" }
  if (next.length < 8) return { error: "New password must be at least 8 characters" }
  if (next !== confirm) return { error: "Passwords do not match" }

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { password: true } })
  if (!user?.password) return { error: "No password set on this account" }

  const valid = await bcrypt.compare(current, user.password)
  if (!valid) return { error: "Current password is incorrect" }

  await db.user.update({
    where: { id: session.user.id },
    data: { password: await bcrypt.hash(next, 12) },
  })
  return { success: true }
}

export async function deleteAccount() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  // Soft-delete: deactivate + clear sessions so next sign-in is blocked
  await db.user.update({ where: { id: session.user.id }, data: { isActive: false } })
  await db.session.deleteMany({ where: { userId: session.user.id } })
  return { success: true }
}

export async function markNotificationsRead(ids: string[]) {
  const session = await auth()
  if (!session?.user?.id) return
  await db.notification.updateMany({
    where: { id: { in: ids }, userId: session.user.id },
    data: { read: true },
  })
  revalidatePath("/client/dashboard")
}

export async function removeSavedItem(productId: string) {
  const session = await auth()
  if (!session?.user?.id) return
  await db.savedItem.deleteMany({ where: { userId: session.user.id, productId } })
  revalidatePath("/client/dashboard")
}
