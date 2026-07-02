import { db } from "../lib/db"

const PHOTOS: { imageUrl: string; caption: string }[] = [
  { imageUrl: "/images/talent-wood-carver.jpeg", caption: "A resident carver shapes a gorilla sculpture from raw lava-stone at Volcano Arts Center." },
  { imageUrl: "/images/talent-carver-collection.jpeg", caption: "Finished gorilla carvings on display, each one hand-shaped and unique." },
  { imageUrl: "/images/gorilla-sculpture.jpeg", caption: "A completed gorilla sculpture — one of our signature handcrafted pieces." },
  { imageUrl: "/images/talent-gorilla-sketch.jpeg", caption: "A young artist sketches a mountain gorilla in pencil during a drawing class." },
  { imageUrl: "/images/talent-kids-drawing-1.jpeg", caption: "Children from our Talent Programme drawing together as the sun sets." },
  { imageUrl: "/images/talent-kids-drawing-2.jpeg", caption: "An open-air art class on the VAC lawn, surrounded by community murals." },
  { imageUrl: "/images/talent-basket-weavers.jpeg", caption: "Two artisans weaving traditional Rwandan baskets by hand." },
  { imageUrl: "/images/WhatsApp Image 2026-06-30 at 8.51.42 PM.jpeg", caption: "Basket weavers at work outside our shop, surrounded by finished pieces." },
  { imageUrl: "/images/WhatsApp Image 2026-06-30 at 8.51.42 PM (1).jpeg", caption: "Inside the Volcano Arts Center shop — paintings, baskets, and carvings on display." },
  { imageUrl: "/images/WhatsApp Image 2026-06-30 at 8.51.43 PM.jpeg", caption: "Traditional village cooking over an open fire, a scene of daily life nearby." },
  { imageUrl: "/images/WhatsApp Image 2026-06-30 at 8.51.36 PM.jpeg", caption: "Winnowing freshly harvested beans the traditional way." },
  { imageUrl: "/images/WhatsApp Image 2026-06-30 at 8.51.38 PM.jpeg", caption: "Sorting grain by hand in the highlands near Musanze." },
  { imageUrl: "/images/talent-highlands-man.jpeg", caption: "A highlands resident pauses in the fields with the Virunga volcanoes behind him." },
  { imageUrl: "/images/talent-mountain-road.jpeg", caption: "Farmers moving goods along a rural road beneath the volcanoes." },
  { imageUrl: "/images/WhatsApp Image 2026-06-30 at 8.51.30 PM (1).jpeg", caption: "The Volcano Arts Center gallery building, its walls alive with community murals." },
]

async function main() {
  const last = await db.galleryImage.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } })
  let sortOrder = (last?.sortOrder ?? -1) + 1

  let created = 0
  for (const p of PHOTOS) {
    const exists = await db.galleryImage.findFirst({ where: { imageUrl: p.imageUrl } })
    if (exists) continue
    await db.galleryImage.create({ data: { imageUrl: p.imageUrl, caption: p.caption, sortOrder: sortOrder++, published: true } })
    created++
  }
  console.log(`Created ${created} gallery images (${PHOTOS.length - created} already existed).`)
  await db.$disconnect()
}

main()
