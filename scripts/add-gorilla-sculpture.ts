import { db } from "../lib/db"

async function main() {
  const category = await db.category.findFirst({ where: { slug: "sculpture" } })
  const product = await db.product.create({
    data: {
      name: "Gorilla Sculpture",
      slug: "gorilla-sculpture",
      description: "Hand-carved gorilla sculpture crafted from volcanic lava stone by our resident artist at Volcano Arts Center. Each piece is unique, shaped by hand and reflecting the raw power and grace of Rwanda's mountain gorillas.",
      price: 450,
      ...(category ? { category: { connect: { id: category.id } } } : {}),
      primaryImageUrl: "/images/gorilla-sculpture.jpeg",
      status: "PUBLISHED",
      featured: true,
      stockQuantity: 1,
    },
  })
  console.log("Created:", product.name, product.id)
  await db.$disconnect()
}

main()
