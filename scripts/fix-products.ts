import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()
async function main() {
  const products = await db.product.findMany({
    select: { id: true, name: true, primaryImageUrl: true, slug: true },
    orderBy: { name: "asc" },
  })
  console.log(JSON.stringify(products, null, 2))
  await db.$disconnect()
}
main().catch(console.error)
