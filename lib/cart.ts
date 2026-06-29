import { db } from "./db"
import type { CartItem } from "@/types"

export async function mergeGuestCart(userId: string, guestItems: CartItem[]) {
  if (!guestItems.length) return
  let cart = await db.cart.findUnique({ where: { userId } })
  if (!cart) cart = await db.cart.create({ data: { userId } })
  for (const item of guestItems) {
    const product = await db.product.findUnique({ where: { id: item.productId } })
    if (!product || product.status !== "PUBLISHED") continue
    await db.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
      update: { quantity: { increment: item.quantity } },
      create: { cartId: cart.id, productId: item.productId, quantity: item.quantity },
    })
  }
}

export async function getUserCart(userId: string) {
  return db.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true, name: true, slug: true, artistName: true,
              price: true, primaryImageUrl: true, status: true, stockQuantity: true,
            },
          },
        },
      },
    },
  })
}
