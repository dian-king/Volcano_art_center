import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

async function main() {
  // 1. Archive Gorilla Trek (has linked bookings so can't hard-delete)
  const gorilla = await db.experience.findFirst({ where: { title: { contains: "Gorilla Trek" } } })
  if (gorilla) {
    await db.experience.update({
      where: { id: gorilla.id },
      data: { status: "ARCHIVED", featured: false },
    })
    console.log(`✓ Archived: ${gorilla.title}`)
  } else {
    console.log("– Gorilla Trek not found")
  }

  // 2. Create Traditional Heritage Experience
  const existing = await db.experience.findUnique({ where: { slug: "traditional-rwandan-heritage-immersion" } })
  if (existing) {
    await db.experience.delete({ where: { slug: "traditional-rwandan-heritage-immersion" } })
  }

  const exp = await db.experience.create({
    data: {
      title:            "Traditional Rwandan Heritage Immersion",
      slug:             "traditional-rwandan-heritage-immersion",
      shortDescription: "Step into ancient Rwanda — grind grain on stone, handle century-old artifacts, and learn the stories behind Rwanda's most sacred objects.",
      description: `Inside a chamber lined with wooden masks, clay pots, woven gourds, and ceremonial spears, time slows down.

This is not a museum. Everything here is alive.

Your host — dressed in the red-and-yellow plaid of Rwandan tradition — will guide you through the objects that shaped Rwandan daily life for centuries: the grinding stone used to turn sorghum into flour, the intore warrior's spear, the inzebe gourd passed between families as a symbol of welcome, the clay pots still used in ceremonies today.

You will try grinding grain yourself. You will hold objects made before Rwanda had paved roads. You will hear the stories that no guidebook contains.

**What you will do:**
- Grind grain using traditional Rwandan stone tools
- Handle and learn the stories behind masks, gourds, pottery and ceremonial weapons
- Hear oral histories of Rwandan culture from a trained cultural guide
- Try on traditional dress and understand its significance
- Enjoy a traditional Rwandan drink made from the grain you ground

This experience runs at the Volcano Arts Center cultural heritage room in Kinigi — 15 minutes from the Volcanoes National Park gate.`,
      location:         "Kinigi, Northern Province",
      durationHours:    3,
      pricePerPerson:   95,
      groupPrice:       75,
      minGroupSize:     1,
      maxGroupSize:     12,
      languages:        ["English", "French", "Kinyarwanda"],
      meetingPoint:     "Volcano Arts Center reception, Kinigi",
      included: [
        "Cultural guide (English, French or Kinyarwanda)",
        "Hands-on grain grinding session",
        "Traditional drink from ground grain",
        "Traditional dress for photos",
        "Certificate of cultural participation",
      ],
      excluded: [
        "Transport to VAC",
        "Meals beyond the included drink",
        "Gratuities",
      ],
      whatToBring: [
        "Comfortable clothes you don't mind getting dusty",
        "Camera",
        "Curiosity",
      ],
      experienceType: "CULTURAL",
      bookingType:    "DIRECT",
      primaryImageUrl: "/images/WhatsApp Image 2026-06-30 at 8.52.04 PM.jpeg",
      status:   "PUBLISHED",
      featured: true,
    },
  })

  console.log(`✓ Created: ${exp.title}`)
  await db.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
