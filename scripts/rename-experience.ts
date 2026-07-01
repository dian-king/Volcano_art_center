import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

async function main() {
  const exp = await db.experience.findFirst({ where: { title: { contains: "Kigali Cultural" } } })
  if (!exp) { console.log("Not found"); return }

  await db.experience.update({
    where: { id: exp.id },
    data: {
      title:    "Kinigi Cultural Walking Tour",
      slug:     "kinigi-cultural-walking-tour",
      location: "Kinigi, Northern Province",
    },
  })
  console.log(`✓ Renamed: "${exp.title}" → "Kinigi Cultural Walking Tour"`)
  await db.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
