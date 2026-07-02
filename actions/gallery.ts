"use server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { CONTENT_ROLES, requireRole } from "@/lib/permissions"

async function getRole() {
  const s = await auth()
  return s?.user?.role as string | undefined
}

export async function createGalleryImage(fd: FormData) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)

  const imageUrl = fd.get("imageUrl") as string
  if (!imageUrl) throw new Error("An image is required.")

  const session = await auth()
  const last = await db.galleryImage.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } })

  await db.galleryImage.create({
    data: {
      imageUrl,
      caption: (fd.get("caption") as string) || null,
      sortOrder: (last?.sortOrder ?? -1) + 1,
      createdById: session?.user?.id,
    },
  })

  revalidatePath("/gallery")
  revalidatePath("/admin/gallery")
  redirect("/admin/gallery")
}

export async function updateGalleryImage(id: string, fd: FormData) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)

  await db.galleryImage.update({
    where: { id },
    data: {
      caption: (fd.get("caption") as string) || null,
      published: fd.get("published") === "on",
    },
  })

  revalidatePath("/gallery")
  revalidatePath("/admin/gallery")
}

export async function deleteGalleryImage(fd: FormData) {
  const role = await getRole()
  requireRole(role, CONTENT_ROLES)

  const id = fd.get("id") as string
  await db.galleryImage.delete({ where: { id } })

  revalidatePath("/gallery")
  revalidatePath("/admin/gallery")
}
