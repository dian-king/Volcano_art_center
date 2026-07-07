"use server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { OPS_ROLES, requireRole } from "@/lib/permissions"

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export async function createProduct(formData: FormData) {
  const session = await auth()
  requireRole(session?.user?.role as string | undefined, OPS_ROLES)

  const name = formData.get("name") as string
  const price = parseFloat(formData.get("price") as string)
  const currency = (formData.get("currency") as string) || "USD"
  const categoryId = formData.get("categoryId") as string || undefined
  const artistName = formData.get("artistName") as string || null
  const description = formData.get("description") as string || null
  const primaryImageUrl = formData.get("primaryImageUrl") as string || null
  const stockQuantity = parseInt(formData.get("stockQuantity") as string) || 1
  const inventoryType = formData.get("inventoryType") as "UNIQUE" | "BATCH"
  const status = formData.get("status") as "DRAFT" | "PUBLISHED"
  const featured = formData.get("featured") === "on"
  const medium = formData.get("medium") as string || null
  const dimensions = formData.get("dimensions") as string || null

  // Ensure unique slug
  let slug = toSlug(name)
  const existing = await db.product.count({ where: { slug } })
  if (existing > 0) slug = `${slug}-${Date.now()}`

  await db.product.create({
    data: {
      name, slug, price, currency, artistName, description, primaryImageUrl,
      stockQuantity, inventoryType, status, featured, medium, dimensions,
      categoryId: categoryId || null,
    },
  })

  revalidatePath("/art-store")
  revalidatePath("/admin/products")
  redirect("/admin/products")
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await auth()
  requireRole(session?.user?.role as string | undefined, OPS_ROLES)

  const data = {
    name: formData.get("name") as string,
    price: parseFloat(formData.get("price") as string),
    currency: (formData.get("currency") as string) || "USD",
    categoryId: (formData.get("categoryId") as string) || null,
    artistName: (formData.get("artistName") as string) || null,
    description: (formData.get("description") as string) || null,
    primaryImageUrl: (formData.get("primaryImageUrl") as string) || null,
    stockQuantity: parseInt(formData.get("stockQuantity") as string) || 1,
    inventoryType: formData.get("inventoryType") as "UNIQUE" | "BATCH",
    status: formData.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SOLD",
    featured: formData.get("featured") === "on",
    medium: (formData.get("medium") as string) || null,
    dimensions: (formData.get("dimensions") as string) || null,
  }

  await db.product.update({ where: { id }, data })

  revalidatePath("/art-store")
  revalidatePath("/admin/products")
  redirect("/admin/products")
}
