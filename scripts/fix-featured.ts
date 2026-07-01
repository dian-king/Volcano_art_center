import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()
async function main() {
  await db.experience.update({
    where: { id: "cmqwl76er000c7w8xk1josdk4" }, // Live Painting Workshop at VAC
    data: { featured: false },
  })
  console.log("✓ Un-featured: Live Painting Workshop at VAC")
  await db.$disconnect()
}
main().catch(console.error)
