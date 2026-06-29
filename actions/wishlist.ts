"use server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function toggleSavedItem(productId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  const existing = await db.savedItem.findUnique({ where: { userId_productId: { userId: session.user.id, productId } } })
  if (existing) {
    await db.savedItem.delete({ where: { userId_productId: { userId: session.user.id, productId } } })
    revalidatePath("/client/dashboard")
    return { saved: false }
  } else {
    await db.savedItem.create({ data: { userId: session.user.id, productId } })
    revalidatePath("/client/dashboard")
    return { saved: true }
  }
}
