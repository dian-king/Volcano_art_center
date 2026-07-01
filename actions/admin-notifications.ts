"use server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function markNotificationsRead(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return

  const ids = (formData.get("ids") as string ?? "").split(",").filter(Boolean)
  if (ids.length === 0) return

  await db.notification.updateMany({
    where: { id: { in: ids }, userId: session.user.id },
    data: { read: true },
  })
  revalidatePath("/admin/notifications")
}
