import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

async function main() {
  // 1. Archive christ the redeemer (referenced by CartItem, can't hard delete)
  await db.product.update({
    where: { slug: "christ-the-redemer" },
    data: { status: "ARCHIVED", featured: false },
  })
  console.log("✓ Archived: christ the redemer")

  // 2. Fix broken chess set image
  await db.product.update({
    where: { slug: "gorilla-kingdom-chess-set" },
    data: { primaryImageUrl: "/images/WhatsApp Image 2026-06-27 at 1.59.56 PM.jpeg" },
  })
  console.log("✓ Fixed image: Gorilla Kingdom Chess Set")

  await db.$disconnect()
}

main().catch(console.error)
