import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()
async function main() {
  const exps = await db.experience.findMany({
    where: { featured: true, status: "PUBLISHED" },
    select: { id: true, title: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })
  console.log(JSON.stringify(exps, null, 2))
  await db.$disconnect()
}
main().catch(console.error)
