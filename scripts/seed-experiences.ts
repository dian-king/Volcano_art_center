import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

const IMG = {
  cultural: "/images/WhatsApp Image 2026-06-30 at 8.51.30 PM (1).jpeg",   // VAC outdoor garden — cultural/city feel
  village:  "/images/WhatsApp Image 2026-06-30 at 8.51.40 PM.jpeg",        // women weaving baskets — perfect for village crafts
  gorilla:  "/images/WhatsApp Image 2026-06-30 at 8.51.33 PM (3).jpeg",    // man in traditional cloak with volcano
}

async function main() {
  const experiences = await db.experience.findMany({
    select: { id: true, title: true, primaryImageUrl: true },
  })

  for (const exp of experiences) {
    const title = exp.title.toLowerCase()
    let img: string | null = null

    if (title.includes("cultural") || title.includes("kigali") || title.includes("walking")) {
      img = IMG.cultural
    } else if (title.includes("village") || title.includes("craft") || title.includes("immersion")) {
      img = IMG.village
    } else if (title.includes("gorilla") || title.includes("trek") || title.includes("volcano")) {
      if (!exp.primaryImageUrl) img = IMG.gorilla
    }

    if (img && !exp.primaryImageUrl) {
      await db.experience.update({
        where: { id: exp.id },
        data: { primaryImageUrl: img },
      })
      console.log(`✓ ${exp.title} → image set`)
    } else if (exp.primaryImageUrl) {
      console.log(`– ${exp.title} → already has image, skipping`)
    } else {
      console.log(`? ${exp.title} → no rule matched`)
    }
  }

  await db.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
