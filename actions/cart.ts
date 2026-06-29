"use server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { mergeGuestCart } from "@/lib/cart"
import { revalidatePath } from "next/cache"
import type { CartItem } from "@/types"

export async function fetchProductsByIds(ids: string[]) {
  if (!ids.length) return []
  const products = await db.product.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
    select: { id: true, name: true, price: true, primaryImageUrl: true, slug: true },
  })
  return products.map(p => ({ ...p, price: Number(p.price) }))
}

export async function fetchCartAction() {
  const session = await auth()
  if (!session?.user?.id) return { items: [], count: 0 }

  const cart = await db.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: { select: { name: true, price: true, primaryImageUrl: true, slug: true } },
        },
      },
    },
  })
  if (!cart) return { items: [], count: 0 }

  const items = cart.items.map((i) => ({
    productId: i.productId,
    slug: i.product.slug,
    name: i.product.name,
    price: Number(i.product.price),
    image: i.product.primaryImageUrl,
    quantity: i.quantity,
  }))

  return { items, count: items.reduce((s, i) => s + i.quantity, 0) }
}

export async function addToCartAction(productId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "guest" }

  const product = await db.product.findUnique({ where: { id: productId, status: "PUBLISHED" } })
  if (!product) return { error: "Product not found" }
  if (product.inventoryType === "BATCH" && product.stockQuantity < 1) return { error: "Out of stock" }

  let cart = await db.cart.findUnique({ where: { userId: session.user.id } })
  if (!cart) cart = await db.cart.create({ data: { userId: session.user.id } })

  await db.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: 1 } },
    create: { cartId: cart.id, productId, quantity: 1 },
  })
  revalidatePath("/")
  return { success: true }
}

export async function removeFromCartAction(productId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  const cart = await db.cart.findUnique({ where: { userId: session.user.id } })
  if (!cart) return { error: "Cart not found" }
  await db.cartItem.deleteMany({ where: { cartId: cart.id, productId } })
  revalidatePath("/")
  return { success: true }
}

export async function mergeGuestCartAction(guestItems: CartItem[]) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }
  await mergeGuestCart(session.user.id, guestItems)
  revalidatePath("/")
  return { success: true }
}