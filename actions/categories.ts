"use server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { OPS_ROLES, requireRole } from "@/lib/permissions"

async function getRole() {
  const s = await auth()
  return s?.user?.role as string | undefined
}

function slugify(name: string) {
  const value = name.trim()
  if (!value) throw new Error("A name is required to create a slug.")
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

async function uniqueSlug(base: string, model: "category" | "experienceCategory", excludeId?: string) {
  let s = slugify(base), n = 0
  while (true) {
    const candidate = n === 0 ? s : `${s}-${n}`
    const existing = await (db[model] as any).findUnique({ where: { slug: candidate } })
    if (!existing || existing.id === excludeId) return candidate
    n++
  }
}

// ─── PRODUCT (ART STORE) CATEGORIES ────────────────────────────────────────

export async function createCategoryAction(fd: FormData) {
  requireRole(await getRole(), OPS_ROLES)
  const name = (fd.get("name") as string || "").trim()
  if (!name) throw new Error("Category name is required.")

  await db.category.create({
    data: {
      name,
      slug: await uniqueSlug(name, "category"),
      description: (fd.get("description") as string) || null,
    },
  })
  revalidatePath("/art-store")
  revalidatePath("/admin/categories")
}

export async function updateCategoryAction(id: string, fd: FormData) {
  requireRole(await getRole(), OPS_ROLES)
  const name = (fd.get("name") as string || "").trim()
  if (!name) throw new Error("Category name is required.")

  await db.category.update({
    where: { id },
    data: {
      name,
      slug: await uniqueSlug(name, "category", id),
      description: (fd.get("description") as string) || null,
    },
  })
  revalidatePath("/art-store")
  revalidatePath("/admin/categories")
}

export async function deleteCategoryAction(fd: FormData) {
  requireRole(await getRole(), OPS_ROLES)
  await db.category.delete({ where: { id: fd.get("id") as string } })
  revalidatePath("/art-store")
  revalidatePath("/admin/categories")
}

// ─── EXPERIENCE CATEGORIES ──────────────────────────────────────────────────

export async function createExperienceCategoryAction(fd: FormData) {
  requireRole(await getRole(), OPS_ROLES)
  const name = (fd.get("name") as string || "").trim()
  if (!name) throw new Error("Category name is required.")

  await db.experienceCategory.create({
    data: {
      name,
      slug: await uniqueSlug(name, "experienceCategory"),
      description: (fd.get("description") as string) || null,
    },
  })
  revalidatePath("/experiences")
  revalidatePath("/admin/experience-categories")
}

export async function updateExperienceCategoryAction(id: string, fd: FormData) {
  requireRole(await getRole(), OPS_ROLES)
  const name = (fd.get("name") as string || "").trim()
  if (!name) throw new Error("Category name is required.")

  await db.experienceCategory.update({
    where: { id },
    data: {
      name,
      slug: await uniqueSlug(name, "experienceCategory", id),
      description: (fd.get("description") as string) || null,
    },
  })
  revalidatePath("/experiences")
  revalidatePath("/admin/experience-categories")
}

export async function deleteExperienceCategoryAction(fd: FormData) {
  requireRole(await getRole(), OPS_ROLES)
  await db.experienceCategory.delete({ where: { id: fd.get("id") as string } })
  revalidatePath("/experiences")
  revalidatePath("/admin/experience-categories")
}
