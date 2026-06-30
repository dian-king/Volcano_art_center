"use server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateOrderRef } from "@/lib/references"
import { sendOrderPlacedEmails } from "@/lib/transactional-email"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
  recipientName: z.string().min(2, "Name is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  notes: z.string().optional(),
})

export async function createOrderAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "You must be signed in to place an order" }

  const parsed = schema.safeParse({
    recipientName: formData.get("recipientName"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2") || undefined,
    city: formData.get("city"),
    state: formData.get("state") || undefined,
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
    notes: formData.get("notes") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Fetch cart
  const cart = await db.cart.findUnique({
    where: { userId: session.user.id },
    include: { items: { include: { product: { select: { id: true, name: true, price: true, stockQuantity: true, inventoryType: true } } } } },
  })
  if (!cart || cart.items.length === 0) return { error: "Your cart is empty" }

  const subtotal = cart.items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0)

  // Create order + items in a transaction
  const order = await db.$transaction(async (tx) => {
    const ref = generateOrderRef()
    const ord = await tx.order.create({
      data: {
        reference: ref,
        userId: session.user.id!,
        subtotal,
        total: subtotal, // shipping added manually by ops team
        recipientName: parsed.data.recipientName,
        addressLine1: parsed.data.addressLine1,
        addressLine2: parsed.data.addressLine2 ?? null,
        city: parsed.data.city,
        state: parsed.data.state ?? null,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country,
        notes: parsed.data.notes ?? null,
        items: {
          create: cart.items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.product.price,
          })),
        },
      },
    })

    // Decrement stock for BATCH items
    for (const item of cart.items) {
      if (item.product.inventoryType === "BATCH") {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        })
      }
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

    return tx.order.findUniqueOrThrow({
      where: { id: ord.id },
      include: {
        user: { select: { email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    })
  })

  await sendOrderPlacedEmails({
    reference: order.reference,
    customerEmail: order.user.email,
    recipientName: order.recipientName,
    total: Number(order.total),
    status: order.status,
    items: order.items.map(item => item.product.name),
  })
  revalidatePath("/client/dashboard")
  return { success: true, reference: order.reference }
}
